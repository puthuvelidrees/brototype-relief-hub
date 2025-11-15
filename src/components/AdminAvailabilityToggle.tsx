import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, UserX } from "lucide-react";

export default function AdminAvailabilityToggle() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAvailability();
    }
  }, [user, isAdmin]);

  const fetchAvailability = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("admin_availability")
        .select("is_available")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setIsAvailable(data.is_available);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("admin_availability")
        .upsert(
          {
            user_id: user.id,
            is_available: checked,
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      setIsAvailable(checked);
      toast({
        title: checked ? "You're now available" : "You're now unavailable",
        description: checked
          ? "You will receive new complaint assignments"
          : "New complaints won't be assigned to you",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin || isLoading) return null;

  return (
    <Card className={isAvailable ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isAvailable ? (
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <div className="space-y-0.5">
              <Label htmlFor="availability" className="text-base font-medium">
                {isAvailable ? "Available for assignments" : "Unavailable"}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isAvailable
                  ? "New complaints will be assigned to you"
                  : "You won't receive new assignments"}
              </p>
            </div>
          </div>
          <Switch
            id="availability"
            checked={isAvailable}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
}
