import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bell, Mail, Clock, Save, Loader2 } from "lucide-react";

export default function AdminSettings() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // System Preferences
  const [autoAssignComplaints, setAutoAssignComplaints] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [maxComplaintsPerDay, setMaxComplaintsPerDay] = useState("10");
  const [defaultComplaintStatus, setDefaultComplaintStatus] = useState("pending");
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newComplaintNotification, setNewComplaintNotification] = useState(true);
  const [statusChangeNotification, setStatusChangeNotification] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");

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
    }
  }, [user]);

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
        setRequireApproval(data.require_approval);
        setMaxComplaintsPerDay(String(data.max_complaints_per_day));
        setDefaultComplaintStatus(data.default_complaint_status);
        setEmailNotifications(data.email_notifications);
        setNewComplaintNotification(data.new_complaint_notification);
        setStatusChangeNotification(data.status_change_notification);
        setDailyDigest(data.daily_digest);
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
        require_approval: requireApproval,
        max_complaints_per_day: parseInt(maxComplaintsPerDay),
        default_complaint_status: defaultComplaintStatus,
        email_notifications: emailNotifications,
        new_complaint_notification: newComplaintNotification,
        status_change_notification: statusChangeNotification,
        daily_digest: dailyDigest,
        notification_email: notificationEmail,
      };

      const { error } = await supabase
        .from("admin_settings")
        .upsert(settingsData, { onConflict: "user_id" });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
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
