import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import Navbar from "@/components/Navbar";
import AdminAvailabilityToggle from "@/components/AdminAvailabilityToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bell, Mail, Clock, Save, Loader2, Activity, User, FileText, Volume2, TrendingUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function AdminSettings() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  useRealtimeNotifications(); // Enable real-time notifications
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // System Preferences
  const [autoAssignComplaints, setAutoAssignComplaints] = useState(false);
  const [assignmentMethod, setAssignmentMethod] = useState("workload");
  const [requireApproval, setRequireApproval] = useState(false);
  const [maxComplaintsPerDay, setMaxComplaintsPerDay] = useState("10");
  const [defaultComplaintStatus, setDefaultComplaintStatus] = useState("pending");
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newComplaintNotification, setNewComplaintNotification] = useState(true);
  const [statusChangeNotification, setStatusChangeNotification] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");
  
  // Real-time Notification Preferences
  const [realtimeNotifications, setRealtimeNotifications] = useState(true);
  const [realtimeNewComplaint, setRealtimeNewComplaint] = useState(true);
  const [realtimeStatusChange, setRealtimeStatusChange] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);
  
  // SLA Settings
  const [slaEnabled, setSlaEnabled] = useState(true);
  const [slaResponseTimeHours, setSlaResponseTimeHours] = useState("24");
  const [slaResolutionTimeHours, setSlaResolutionTimeHours] = useState("72");
  const [slaCriticalResponseHours, setSlaCriticalResponseHours] = useState("4");
  const [slaCriticalResolutionHours, setSlaCriticalResolutionHours] = useState("24");
  
  // Escalation Settings
  const [escalationEnabled, setEscalationEnabled] = useState(true);
  const [escalationSlaBreachAuto, setEscalationSlaBreachAuto] = useState(true);
  const [escalationUnresolvedHours, setEscalationUnresolvedHours] = useState("48");
  const [escalationMaxLevel, setEscalationMaxLevel] = useState("3");
  const [escalationAutoPriority, setEscalationAutoPriority] = useState(true);
  
  // Activity Logs
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user) {
      setNotificationEmail(user.email || "");
      loadSettings();
      loadActivityLogs();

      // Set up realtime subscription for activity logs
      const channel = supabase
        .channel('activity-logs-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activity_logs'
          },
          () => {
            loadActivityLogs();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (error: any) {
      console.error("Error loading activity logs:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  const logActivity = async (actionType: string, description: string, entityType?: string, entityId?: string) => {
    if (!user) return;

    try {
      await supabase
        .from("activity_logs")
        .insert({
          user_id: user.id,
          action_type: actionType,
          action_description: description,
          entity_type: entityType,
          entity_id: entityId,
        });
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setAutoAssignComplaints(data.auto_assign_complaints);
        setAssignmentMethod(data.assignment_method || "workload");
        setRequireApproval(data.require_approval);
        setMaxComplaintsPerDay(String(data.max_complaints_per_day));
        setDefaultComplaintStatus(data.default_complaint_status);
        setEmailNotifications(data.email_notifications);
        setNewComplaintNotification(data.new_complaint_notification);
        setStatusChangeNotification(data.status_change_notification);
        setDailyDigest(data.daily_digest);
        setRealtimeNotifications(data.realtime_notifications ?? true);
        setRealtimeNewComplaint(data.realtime_new_complaint ?? true);
        setRealtimeStatusChange(data.realtime_status_change ?? true);
        setNotificationSound(data.notification_sound ?? true);
        setSlaEnabled(data.sla_enabled ?? true);
        setSlaResponseTimeHours(String(data.sla_response_time_hours ?? 24));
        setSlaResolutionTimeHours(String(data.sla_resolution_time_hours ?? 72));
        setSlaCriticalResponseHours(String(data.sla_critical_response_hours ?? 4));
        setSlaCriticalResolutionHours(String(data.sla_critical_resolution_hours ?? 24));
        setEscalationEnabled(data.escalation_enabled ?? true);
        setEscalationSlaBreachAuto(data.escalation_sla_breach_auto ?? true);
        setEscalationUnresolvedHours(String(data.escalation_unresolved_hours ?? 48));
        setEscalationMaxLevel(String(data.escalation_max_level ?? 3));
        setEscalationAutoPriority(data.escalation_auto_priority ?? true);
        if (data.notification_email) {
          setNotificationEmail(data.notification_email);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error loading settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const settingsData = {
        user_id: user.id,
        auto_assign_complaints: autoAssignComplaints,
        assignment_method: assignmentMethod,
        require_approval: requireApproval,
        max_complaints_per_day: parseInt(maxComplaintsPerDay),
        default_complaint_status: defaultComplaintStatus,
        email_notifications: emailNotifications,
        new_complaint_notification: newComplaintNotification,
        status_change_notification: statusChangeNotification,
        daily_digest: dailyDigest,
        notification_email: notificationEmail,
        realtime_notifications: realtimeNotifications,
        realtime_new_complaint: realtimeNewComplaint,
        realtime_status_change: realtimeStatusChange,
        notification_sound: notificationSound,
        sla_enabled: slaEnabled,
        sla_response_time_hours: parseInt(slaResponseTimeHours),
        sla_resolution_time_hours: parseInt(slaResolutionTimeHours),
        sla_critical_response_hours: parseInt(slaCriticalResponseHours),
        sla_critical_resolution_hours: parseInt(slaCriticalResolutionHours),
        escalation_enabled: escalationEnabled,
        escalation_sla_breach_auto: escalationSlaBreachAuto,
        escalation_unresolved_hours: parseInt(escalationUnresolvedHours),
        escalation_max_level: parseInt(escalationMaxLevel),
        escalation_auto_priority: escalationAutoPriority,
      };

      const { error } = await supabase
        .from("admin_settings")
        .upsert(settingsData, { onConflict: "user_id" });

      if (error) throw error;

      await logActivity(
        "settings_update",
        "Updated admin settings and preferences",
        "admin_settings",
        user.id
      );

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
      
      loadActivityLogs();
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Admin Settings
            </h1>
            <p className="text-muted-foreground">
              Configure system preferences and notification settings
            </p>
          </div>

          <AdminAvailabilityToggle />

          {/* System Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Preferences
              </CardTitle>
              <CardDescription>
                Configure how the complaint management system operates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-assign">Auto-assign complaints</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign new complaints to available admins
                  </p>
                </div>
                <Switch
                  id="auto-assign"
                  checked={autoAssignComplaints}
                  onCheckedChange={setAutoAssignComplaints}
                />
              </div>

              {autoAssignComplaints && (
                <>
                  <div className="space-y-2 pl-4 border-l-2 border-muted">
                    <Label htmlFor="assignment-method">Assignment method</Label>
                    <Select value={assignmentMethod} onValueChange={setAssignmentMethod}>
                      <SelectTrigger className="max-w-[250px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="workload">Workload-based (Least busy admin)</SelectItem>
                        <SelectItem value="round_robin">Round-robin (Rotate equally)</SelectItem>
                        <SelectItem value="manual">Manual (No auto-assignment)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Choose how complaints are distributed among admins
                    </p>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-approval">Require approval</Label>
                  <p className="text-sm text-muted-foreground">
                    New complaints need admin approval before being visible
                  </p>
                </div>
                <Switch
                  id="require-approval"
                  checked={requireApproval}
                  onCheckedChange={setRequireApproval}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="max-complaints">Max complaints per day per user</Label>
                <Input
                  id="max-complaints"
                  type="number"
                  min="1"
                  max="50"
                  value={maxComplaintsPerDay}
                  onChange={(e) => setMaxComplaintsPerDay(e.target.value)}
                  className="max-w-[200px]"
                />
                <p className="text-sm text-muted-foreground">
                  Limit the number of complaints a user can submit per day
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="default-status">Default complaint status</Label>
                <Select value={defaultComplaintStatus} onValueChange={setDefaultComplaintStatus}>
                  <SelectTrigger className="max-w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Initial status for new complaints
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="notification-email">Notification email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="notification-email"
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Email address where notifications will be sent
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new-complaint">New complaint alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a new complaint is submitted
                  </p>
                </div>
                <Switch
                  id="new-complaint"
                  checked={newComplaintNotification}
                  onCheckedChange={setNewComplaintNotification}
                  disabled={!emailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="status-change">Status change alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when complaint status changes
                  </p>
                </div>
                <Switch
                  id="status-change"
                  checked={statusChangeNotification}
                  onCheckedChange={setStatusChangeNotification}
                  disabled={!emailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-digest" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Daily digest
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily summary of all complaints at 9:00 AM
                  </p>
                </div>
                <Switch
                  id="daily-digest"
                  checked={dailyDigest}
                  onCheckedChange={setDailyDigest}
                  disabled={!emailNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Real-time Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Real-time Notifications
              </CardTitle>
              <CardDescription>
                Configure in-app toast notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="realtime-enabled" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Enable real-time notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Master toggle for all in-app notification alerts
                  </p>
                </div>
                <Switch
                  id="realtime-enabled"
                  checked={realtimeNotifications}
                  onCheckedChange={setRealtimeNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="realtime-new-complaint">New complaint alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Show toast notification when a new complaint is submitted
                  </p>
                </div>
                <Switch
                  id="realtime-new-complaint"
                  checked={realtimeNewComplaint}
                  onCheckedChange={setRealtimeNewComplaint}
                  disabled={!realtimeNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="realtime-status-change">Status change alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Show toast notification when complaint status changes
                  </p>
                </div>
                <Switch
                  id="realtime-status-change"
                  checked={realtimeStatusChange}
                  onCheckedChange={setRealtimeStatusChange}
                  disabled={!realtimeNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notification-sound" className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Notification sound
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Play a sound effect with notifications
                  </p>
                </div>
                <Switch
                  id="notification-sound"
                  checked={notificationSound}
                  onCheckedChange={setNotificationSound}
                  disabled={!realtimeNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* SLA Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                SLA (Service Level Agreement) Settings
              </CardTitle>
              <CardDescription>
                Configure response and resolution time targets with automated alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sla-enabled" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Enable SLA tracking
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Monitor and enforce service level agreements
                  </p>
                </div>
                <Switch
                  id="sla-enabled"
                  checked={slaEnabled}
                  onCheckedChange={setSlaEnabled}
                />
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sla-response-time">Standard Response Time (hours)</Label>
                  <p className="text-sm text-muted-foreground">
                    Time allowed for first response to non-critical complaints
                  </p>
                  <Input
                    id="sla-response-time"
                    type="number"
                    value={slaResponseTimeHours}
                    onChange={(e) => setSlaResponseTimeHours(e.target.value)}
                    disabled={!slaEnabled}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sla-resolution-time">Standard Resolution Time (hours)</Label>
                  <p className="text-sm text-muted-foreground">
                    Time allowed to resolve non-critical complaints
                  </p>
                  <Input
                    id="sla-resolution-time"
                    type="number"
                    value={slaResolutionTimeHours}
                    onChange={(e) => setSlaResolutionTimeHours(e.target.value)}
                    disabled={!slaEnabled}
                    min="1"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="sla-critical-response">Critical Response Time (hours)</Label>
                  <p className="text-sm text-muted-foreground">
                    Faster response time for critical priority complaints
                  </p>
                  <Input
                    id="sla-critical-response"
                    type="number"
                    value={slaCriticalResponseHours}
                    onChange={(e) => setSlaCriticalResponseHours(e.target.value)}
                    disabled={!slaEnabled}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sla-critical-resolution">Critical Resolution Time (hours)</Label>
                  <p className="text-sm text-muted-foreground">
                    Faster resolution time for critical priority complaints
                  </p>
                  <Input
                    id="sla-critical-resolution"
                    type="number"
                    value={slaCriticalResolutionHours}
                    onChange={(e) => setSlaCriticalResolutionHours(e.target.value)}
                    disabled={!slaEnabled}
                    min="1"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">SLA Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Notifications will be sent to assigned admins when SLA thresholds are breached. 
                  Visual indicators will appear on complaints approaching or exceeding SLA targets.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Escalation Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Complaint Escalation Workflow
              </CardTitle>
              <CardDescription>
                Configure automatic escalation for unresolved complaints and SLA breaches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="escalation-enabled" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Enable escalation workflow
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically escalate complaints based on rules
                  </p>
                </div>
                <Switch
                  id="escalation-enabled"
                  checked={escalationEnabled}
                  onCheckedChange={setEscalationEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="escalation-sla-auto">Auto-escalate on SLA breach</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically escalate when response or resolution SLA is breached
                  </p>
                </div>
                <Switch
                  id="escalation-sla-auto"
                  checked={escalationSlaBreachAuto}
                  onCheckedChange={setEscalationSlaBreachAuto}
                  disabled={!escalationEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="escalation-auto-priority">Auto-increase priority</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically increase priority level when escalating complaints
                  </p>
                </div>
                <Switch
                  id="escalation-auto-priority"
                  checked={escalationAutoPriority}
                  onCheckedChange={setEscalationAutoPriority}
                  disabled={!escalationEnabled}
                />
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="escalation-unresolved">Unresolved escalation threshold (hours)</Label>
                  <p className="text-sm text-muted-foreground">
                    Escalate if complaint remains unresolved for this many hours
                  </p>
                  <Input
                    id="escalation-unresolved"
                    type="number"
                    value={escalationUnresolvedHours}
                    onChange={(e) => setEscalationUnresolvedHours(e.target.value)}
                    disabled={!escalationEnabled}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="escalation-max-level">Maximum escalation level</Label>
                  <p className="text-sm text-muted-foreground">
                    Maximum number of times a complaint can be escalated
                  </p>
                  <Input
                    id="escalation-max-level"
                    type="number"
                    value={escalationMaxLevel}
                    onChange={(e) => setEscalationMaxLevel(e.target.value)}
                    disabled={!escalationEnabled}
                    min="1"
                    max="5"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">Escalation Workflow</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Complaints are automatically escalated when SLA is breached or unresolved for too long</li>
                  <li>Escalated complaints are reassigned to senior admins with lowest workload</li>
                  <li>Priority is automatically increased if enabled (Low → Medium → High → Critical)</li>
                  <li>All senior admins receive notifications about escalated complaints</li>
                  <li>Escalation stops after reaching the maximum level</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <CardTitle>Activity Log</CardTitle>
              </div>
              <CardDescription>
                Recent admin actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {logsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : activityLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No activity logs yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 pb-4 border-b last:border-0"
                      >
                        <div className="mt-1">
                          {log.action_type === "settings_update" && (
                            <Settings className="h-4 w-4 text-muted-foreground" />
                          )}
                          {log.action_type === "user_action" && (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                          {log.action_type === "complaint_action" && (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                          {!["settings_update", "user_action", "complaint_action"].includes(log.action_type) && (
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {log.action_description}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {log.action_type.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} size="lg" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
