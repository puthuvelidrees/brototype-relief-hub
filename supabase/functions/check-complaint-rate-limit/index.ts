import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateLimitCheck {
  allowed: boolean;
  remainingSubmissions: number;
  maxPerDay: number;
  resetTime: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Invalid user token:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get max complaints per day from admin settings (default: 10)
    const { data: settings } = await supabaseClient
      .from('admin_settings')
      .select('max_complaints_per_day')
      .limit(1)
      .single();

    const maxComplaintsPerDay = settings?.max_complaints_per_day || 10;

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Count complaints submitted by this user in the last 24 hours
    const { count, error: countError } = await supabaseClient
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', twentyFourHoursAgo.toISOString());

    if (countError) {
      console.error('Error counting complaints:', countError);
      throw countError;
    }

    const complaintCount = count || 0;
    const remainingSubmissions = Math.max(0, maxComplaintsPerDay - complaintCount);
    const allowed = complaintCount < maxComplaintsPerDay;

    // Calculate reset time (24 hours from now)
    const resetTime = new Date();
    resetTime.setHours(resetTime.getHours() + 24);

    const response: RateLimitCheck = {
      allowed,
      remainingSubmissions,
      maxPerDay: maxComplaintsPerDay,
      resetTime: resetTime.toISOString(),
    };

    console.log('Rate limit check:', {
      userId: user.id,
      complaintCount,
      maxComplaintsPerDay,
      allowed,
    });

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in check-complaint-rate-limit:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
