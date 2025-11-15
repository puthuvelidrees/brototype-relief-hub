import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface EscalationBadgeProps {
  escalationLevel: number;
  escalatedAt: string | null;
  escalationReason: string | null;
}

export default function EscalationBadge({ 
  escalationLevel, 
  escalatedAt, 
  escalationReason 
}: EscalationBadgeProps) {
  if (escalationLevel === 0) return null;

  const getEscalationColor = (level: number) => {
    if (level >= 3) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-400";
    if (level === 2) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-400";
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-400";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${getEscalationColor(escalationLevel)} font-semibold gap-1`}
          >
            <TrendingUp className="h-3 w-3" />
            Escalated L{escalationLevel}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">Escalation Level {escalationLevel}</p>
            {escalationReason && (
              <p className="text-xs">Reason: {escalationReason}</p>
            )}
            {escalatedAt && (
              <p className="text-xs text-muted-foreground">
                Escalated {formatDistanceToNow(new Date(escalatedAt), { addSuffix: true })}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
