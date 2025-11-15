import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoginAttemptRequest {
  email: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}

interface LoginAttemptResponse {
  allowed: boolean;
  attemptsRemaining?: number;
  lockoutMinutes?: number;
  message?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { email, success, ipAddress, userAgent }: LoginAttemptRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking login attempt for email: ${email}, success: ${success}`);

    // Get failed login attempts in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: recentAttempts, error: fetchError } = await supabaseClient
      .from('login_attempts')
      .select('*')
      .eq('email', email)
      .eq('success', false)
      .gte('attempt_time', fifteenMinutesAgo)
      .order('attempt_time', { ascending: false });

    if (fetchError) {
      console.error('Error fetching login attempts:', fetchError);
      throw fetchError;
    }

    const failedAttempts = recentAttempts?.length || 0;
    console.log(`Found ${failedAttempts} failed attempts in the last 15 minutes`);

    // Check if account is locked (5 or more failed attempts)
    if (failedAttempts >= 5 && !success) {
      const oldestFailedAttempt = recentAttempts[recentAttempts.length - 1];
      const lockoutEnd = new Date(new Date(oldestFailedAttempt.attempt_time).getTime() + 15 * 60 * 1000);
      const minutesRemaining = Math.ceil((lockoutEnd.getTime() - Date.now()) / (60 * 1000));

      console.log(`Account locked. Minutes remaining: ${minutesRemaining}`);

      const response: LoginAttemptResponse = {
        allowed: false,
        lockoutMinutes: Math.max(minutesRemaining, 0),
        message: `Account locked due to too many failed login attempts. Please try again in ${minutesRemaining} minute(s).`
      };

      return new Response(
        JSON.stringify(response),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the attempt
    const { error: insertError } = await supabaseClient
      .from('login_attempts')
      .insert({
        email,
        success,
        ip_address: ipAddress,
        user_agent: userAgent,
        attempt_time: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error logging login attempt:', insertError);
      // Don't fail the request if logging fails, just log the error
    }

    // Calculate remaining attempts
    const newFailedCount = success ? 0 : failedAttempts + 1;
    const attemptsRemaining = Math.max(5 - newFailedCount, 0);

    console.log(`Attempts remaining: ${attemptsRemaining}`);

    const response: LoginAttemptResponse = {
      allowed: true,
      attemptsRemaining: success ? 5 : attemptsRemaining,
      message: success ? 'Login successful' : `${attemptsRemaining} attempt(s) remaining before account lockout`
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-login-attempt function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});