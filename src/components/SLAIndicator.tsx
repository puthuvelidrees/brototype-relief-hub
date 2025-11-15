import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { differenceInHours, differenceInMinutes } from "date-fns";

interface SLAIndicatorProps {
  createdAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  status: string;
  priority: string;
  slaResponseBreached: boolean;
  slaResolutionBreached: boolean;
  slaSettings?: {
    sla_response_time_hours: number;
    sla_resolution_time_hours: number;
    sla_critical_response_hours: number;
    sla_critical_resolution_hours: number;
  };
}

export default function SLAIndicator({
  createdAt,
  firstResponseAt,
  resolvedAt,
  status,
  priority,
  slaResponseBreached,
  slaResolutionBreached,
  slaSettings,
}: SLAIndicatorProps) {
  if (!slaSettings) return null;

  const created = new Date(createdAt);
  const now = new Date();
  
  // Calculate response time
  const responseDeadlineHours =
    priority === "critical"
      ? slaSettings.sla_critical_response_hours
      : slaSettings.sla_response_time_hours;
  
  const resolutionDeadlineHours =
    priority === "critical"
      ? slaSettings.sla_critical_resolution_hours
      : slaSettings.sla_resolution_time_hours;

  const responseTime = firstResponseAt
    ? differenceInHours(new Date(firstResponseAt), created)
    : differenceInHours(now, created);

  const resolutionTime = resolvedAt
    ? differenceInHours(new Date(resolvedAt), created)
    : differenceInHours(now, created);

  const responseTimeRemaining = responseDeadlineHours - responseTime;
  const resolutionTimeRemaining = resolutionDeadlineHours - resolutionTime;

  const formatTimeRemaining = (hours: number) => {
    if (hours < 0) {
      return `${Math.abs(Math.floor(hours))}h overdue`;
    }
    if (hours < 1) {
      return `${Math.round(hours * 60)}m remaining`;
    }
    return `${Math.floor(hours)}h remaining`;
  };

  const getResponseStatus = () => {
    if (firstResponseAt) {
      return slaResponseBreached ? "breached" : "met";
    }
    if (slaResponseBreached) {
      return "breached";
    }
    if (responseTimeRemaining < responseDeadlineHours * 0.2) {
      return "warning";
    }
    return "on-track";
  };

  const getResolutionStatus = () => {
    if (status === "resolved") {
      return slaResolutionBreached ? "breached" : "met";
    }
    if (slaResolutionBreached) {
      return "breached";
    }
    if (resolutionTimeRemaining < resolutionDeadlineHours * 0.2) {
      return "warning";
    }
    return "on-track";
  };

  const responseStatus = getResponseStatus();
  const resolutionStatus = getResolutionStatus();

  const statusConfig = {
    "on-track": {
      className: "bg-success/20 text-success border-success/40",
      icon: Clock,
    },
    warning: {
      className: "bg-warning/20 text-warning border-warning/40",
      icon: AlertTriangle,
    },
    breached: {
      className: "bg-destructive/20 text-destructive border-destructive/40",
      icon: AlertTriangle,
    },
    met: {
      className: "bg-success/20 text-success border-success/40",
      icon: CheckCircle,
    },
  };

  const ResponseIcon = statusConfig[responseStatus].icon;
  const ResolutionIcon = statusConfig[resolutionStatus].icon;

  return (
    <div className="flex gap-2 flex-wrap">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={statusConfig[responseStatus].className}>
              <ResponseIcon className="h-3 w-3 mr-1" />
              Response: {formatTimeRemaining(responseTimeRemaining)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              {firstResponseAt
                ? `Responded in ${responseTime}h`
                : `Response SLA: ${responseDeadlineHours}h`}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {status !== "resolved" && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={statusConfig[resolutionStatus].className}>
                <ResolutionIcon className="h-3 w-3 mr-1" />
                Resolution: {formatTimeRemaining(resolutionTimeRemaining)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Resolution SLA: {resolutionDeadlineHours}h</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {status === "resolved" && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={statusConfig[resolutionStatus].className}>
                <ResolutionIcon className="h-3 w-3 mr-1" />
                Resolved in {resolutionTime}h
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Resolution SLA: {resolutionDeadlineHours}h</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
