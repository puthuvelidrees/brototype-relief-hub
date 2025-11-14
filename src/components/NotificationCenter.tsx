import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Check, FileText, Settings as SettingsIcon, User as UserIcon, X, Filter, Archive, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
  archived?: boolean;
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (!user) return;

    loadNotifications();

    // Set up realtime subscription
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadNotifications = async (loadMore = false) => {
    if (!user) return;

    const from = loadMore ? page * ITEMS_PER_PAGE : 0;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error loading notifications:", error);
      return;
    }

    if (data && data.length < ITEMS_PER_PAGE) {
      setHasMore(false);
    }

    if (loadMore) {
      setNotifications(prev => [...prev, ...(data || [])]);
    } else {
      setNotifications(data || []);
    }
    
    const allData = loadMore ? [...notifications, ...(data || [])] : (data || []);
    setUnreadCount(allData.filter((n: any) => !n.is_read).length);
  };

  const applyFilters = useCallback(() => {
    let filtered = notifications;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Filter by read status
    if (filterRead === "unread") {
      filtered = filtered.filter(n => !n.is_read);
    } else if (filterRead === "read") {
      filtered = filtered.filter(n => n.is_read);
    }

    // Filter out archived
    filtered = filtered.filter(n => !n.archived);

    setFilteredNotifications(filtered);
  }, [notifications, filterType, filterRead]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      setPage(prev => prev + 1);
      loadNotifications(true);
    }
  }, [hasMore, page]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return;
    }

    loadNotifications();
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all as read:", error);
      return;
    }

    loadNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "complaint_action":
        return <FileText className="h-4 w-4" />;
      case "settings_update":
        return <SettingsIcon className="h-4 w-4" />;
      case "user_action":
        return <UserIcon className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "complaint_action":
        return "text-blue-500 bg-blue-50 dark:bg-blue-950/50";
      case "settings_update":
        return "text-purple-500 bg-purple-50 dark:bg-purple-950/50";
      case "user_action":
        return "text-green-500 bg-green-50 dark:bg-green-950/50";
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-950/50";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "complaint_action":
        return "text-blue-500 bg-blue-50 dark:bg-blue-950/50";
      case "settings_update":
        return "text-purple-500 bg-purple-50 dark:bg-purple-950/50";
      case "user_action":
        return "text-green-500 bg-green-50 dark:bg-green-950/50";
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-950/50";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-96 bg-background border shadow-lg z-50"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Filters */}
        <div className="px-2 py-3 space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Filter by Type
            </label>
            <Tabs value={filterType} onValueChange={setFilterType} className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-8">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="complaint_action" className="text-xs">Complaints</TabsTrigger>
                <TabsTrigger value="settings_update" className="text-xs">Settings</TabsTrigger>
                <TabsTrigger value="user_action" className="text-xs">Users</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Filter by Status
            </label>
            <Tabs value={filterRead} onValueChange={setFilterRead} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
                <TabsTrigger value="read" className="text-xs">Read</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <DropdownMenuSeparator />
        
        {filteredNotifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {notifications.length === 0 ? "No notifications yet" : "No notifications match the filters"}
          </div>
        ) : (
          <ScrollArea className="h-[350px]">
            {filteredNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-3 p-3 cursor-pointer ${
                  !notification.is_read ? "bg-accent/50" : ""
                }`}
                onSelect={(e) => e.preventDefault()}
              >
                <div className="mt-1 text-muted-foreground">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
