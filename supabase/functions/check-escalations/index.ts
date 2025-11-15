import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Checking for complaints that need escalation...');

    // Get escalation settings
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('escalation_enabled', true)
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      throw settingsError;
    }

    if (!settings) {
      console.log('Escalation not enabled, skipping...');
      return new Response(
        JSON.stringify({ message: 'Escalation not enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const unresolvedHours = settings.escalation_unresolved_hours || 48;
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - unresolvedHours);

    // Find unresolved complaints that have been open too long
    const { data: complaints, error: complaintsError } = await supabase
      .from('complaints')
      .select('id, ticket_id, created_at, escalation_level, escalated_at')
      .in('status', ['pending', 'in_progress'])
      .lt('created_at', thresholdDate.toISOString())
      .lt('escalation_level', settings.escalation_max_level);

    if (complaintsError) {
      console.error('Error fetching complaints:', complaintsError);
      throw complaintsError;
    }

    console.log(`Found ${complaints?.length || 0} complaints to check for escalation`);

    let escalatedCount = 0;

    if (complaints && complaints.length > 0) {
      for (const complaint of complaints) {
        // Check if enough time has passed since last escalation
        const lastEscalation = complaint.escalated_at 
          ? new Date(complaint.escalated_at)
          : new Date(complaint.created_at);
        
        const hoursSinceEscalation = (Date.now() - lastEscalation.getTime()) / (1000 * 60 * 60);
        
        // Only escalate if at least unresolvedHours/2 have passed since last escalation
        if (hoursSinceEscalation >= unresolvedHours / 2) {
          // Call the escalate_complaint function
          const { error: escalateError } = await supabase
            .rpc('escalate_complaint', {
              p_complaint_id: complaint.id,
              p_reason: `Unresolved for ${Math.floor(hoursSinceEscalation)} hours`
            });

          if (escalateError) {
            console.error(`Error escalating complaint ${complaint.ticket_id}:`, escalateError);
          } else {
            console.log(`Escalated complaint ${complaint.ticket_id}`);
            escalatedCount++;
          }
        }
      }
    }

    console.log(`Escalation check complete. Escalated ${escalatedCount} complaints.`);

    return new Response(
      JSON.stringify({
        success: true,
        checked: complaints?.length || 0,
        escalated: escalatedCount,
        message: `Checked ${complaints?.length || 0} complaints, escalated ${escalatedCount}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in check-escalations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});