import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity } from "lucide-react";

interface ActivityBadgeProps {
  complaintId: string;
}

export default function ActivityBadge({ complaintId }: ActivityBadgeProps) {
  const [activityCount, setActivityCount] = useState(0);

  useEffect(() => {
    fetchActivityCount();
  }, [complaintId]);

  const fetchActivityCount = async () => {
    try {
      // Count history events
      const { count: historyCount } = await supabase
        .from('complaint_history')
        .select('*', { count: 'exact', head: true })
        .eq('complaint_id', complaintId);

      // Count comments
      const { count: commentsCount } = await supabase
        .from('complaint_comments')
        .select('*', { count: 'exact', head: true })
        .eq('complaint_id', complaintId);

      setActivityCount((historyCount || 0) + (commentsCount || 0));
    } catch (error) {
      console.error('Error fetching activity count:', error);
    }
  };

  if (activityCount === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            {activityCount}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{activityCount} timeline events</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
