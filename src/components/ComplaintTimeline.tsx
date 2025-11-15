import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  MessageSquare, 
  FileText,
  ArrowRight,
  UserPlus
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface TimelineEvent {
  id: string;
  type: 'created' | 'status_change' | 'priority_change' | 'assignment' | 'escalation' | 'comment';
  timestamp: string;
  user_name: string | null;
  old_value?: string | null;
  new_value?: string | null;
  comment?: string;
  metadata?: any;
}

interface ComplaintTimelineProps {
  complaintId: string;
}

export default function ComplaintTimeline({ complaintId }: ComplaintTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();

    // Set up realtime subscription for updates
    const channel = supabase
      .channel(`complaint-timeline-${complaintId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'complaint_history',
        filter: `complaint_id=eq.${complaintId}`
      }, () => {
        fetchTimeline();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'complaint_comments',
        filter: `complaint_id=eq.${complaintId}`
      }, () => {
        fetchTimeline();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [complaintId]);

  const fetchTimeline = async () => {
    try {
      // Fetch history events
      const { data: historyData, error: historyError } = await supabase
        .from('complaint_history')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('complaint_comments')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Get user profiles for all events
      const userIds = [
        ...historyData.map(h => h.changed_by).filter(Boolean),
        ...commentsData.map(c => c.user_id)
      ];
      const uniqueUserIds = [...new Set(userIds)];

      let profilesMap: Record<string, string> = {};
      if (uniqueUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', uniqueUserIds);

        if (profiles) {
          profilesMap = profiles.reduce((acc, p) => {
            acc[p.id] = p.full_name || 'Unknown User';
            return acc;
          }, {} as Record<string, string>);
        }
      }

      // Combine and format events
      const historyEvents: TimelineEvent[] = historyData.map(h => ({
        id: h.id,
        type: h.event_type as any,
        timestamp: h.created_at,
        user_name: h.changed_by ? profilesMap[h.changed_by] : null,
        old_value: h.old_value,
        new_value: h.new_value,
        metadata: h.metadata
      }));

      const commentEvents: TimelineEvent[] = commentsData.map(c => ({
        id: c.id,
        type: 'comment',
        timestamp: c.created_at,
        user_name: profilesMap[c.user_id] || 'Unknown User',
        comment: c.comment
      }));

      // Combine and sort by timestamp
      const allEvents = [...historyEvents, ...commentEvents].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <FileText className="h-4 w-4" />;
      case 'status_change':
        return <CheckCircle className="h-4 w-4" />;
      case 'priority_change':
        return <AlertCircle className="h-4 w-4" />;
      case 'assignment':
        return <UserPlus className="h-4 w-4" />;
      case 'escalation':
        return <TrendingUp className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'created':
        return 'text-blue-600 dark:text-blue-400';
      case 'status_change':
        return 'text-green-600 dark:text-green-400';
      case 'priority_change':
        return 'text-orange-600 dark:text-orange-400';
      case 'assignment':
        return 'text-purple-600 dark:text-purple-400';
      case 'escalation':
        return 'text-red-600 dark:text-red-400';
      case 'comment':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatEventDescription = (event: TimelineEvent) => {
    switch (event.type) {
      case 'created':
        return 'Complaint submitted';
      case 'status_change':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span>Status changed from</span>
            <Badge variant="outline" className="text-xs">
              {event.old_value?.replace('_', ' ')}
            </Badge>
            <ArrowRight className="h-3 w-3" />
            <Badge variant="outline" className="text-xs">
              {event.new_value?.replace('_', ' ')}
            </Badge>
          </div>
        );
      case 'priority_change':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span>Priority changed from</span>
            <Badge variant="outline" className="text-xs">
              {event.old_value}
            </Badge>
            <ArrowRight className="h-3 w-3" />
            <Badge variant="outline" className="text-xs">
              {event.new_value}
            </Badge>
          </div>
        );
      case 'assignment':
        if (event.old_value && event.new_value) {
          return `Reassigned from ${event.old_value} to ${event.new_value}`;
        } else if (event.new_value) {
          return `Assigned to ${event.new_value}`;
        } else {
          return 'Assignment removed';
        }
      case 'escalation':
        return (
          <div>
            <span className="font-medium">Escalated to Level {event.new_value}</span>
            {event.metadata?.reason && (
              <span className="text-sm text-muted-foreground block mt-1">
                Reason: {event.metadata.reason}
              </span>
            )}
          </div>
        );
      case 'comment':
        return (
          <div className="mt-2 p-3 bg-muted/50 rounded-md">
            <p className="text-sm whitespace-pre-wrap">{event.comment}</p>
          </div>
        );
      default:
        return 'Unknown event';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No timeline events yet
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {events.map((event, index) => (
                  <div key={event.id} className="relative flex gap-4 pl-10">
                    {/* Event icon */}
                    <div className={`absolute left-0 p-2 rounded-full bg-background border-2 border-border ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>

                    {/* Event content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {event.user_name && (
                              <span className="font-medium text-sm flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {event.user_name}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="text-sm">
                            {formatEventDescription(event)}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(event.timestamp), 'PPp')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
