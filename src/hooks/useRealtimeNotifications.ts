import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface NotificationPreferences {
  realtime_notifications: boolean;
  realtime_new_complaint: boolean;
  realtime_status_change: boolean;
  notification_sound: boolean;
}

export function useRealtimeNotifications() {
  const { toast } = useToast();
  const { isAdmin, user } = useAuth();
  const channelRef = useRef<any>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    realtime_notifications: true,
    realtime_new_complaint: true,
    realtime_status_change: true,
    notification_sound: true,
  });

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

  const createNotification = async (title: string, message: string, type: string, entityType?: string, entityId?: string) => {
    if (!user) return;

    try {
      await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          title,
          message,
          type,
          entity_type: entityType,
          entity_id: entityId,
          is_read: false,
        });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  // Load notification preferences
  useEffect(() => {
    if (!user) return;

    const loadPreferences = async () => {
      const { data } = await supabase
        .from("admin_settings")
        .select("realtime_notifications, realtime_new_complaint, realtime_status_change, notification_sound")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setPreferences({
          realtime_notifications: data.realtime_notifications ?? true,
          realtime_new_complaint: data.realtime_new_complaint ?? true,
          realtime_status_change: data.realtime_status_change ?? true,
          notification_sound: data.notification_sound ?? true,
        });
      }
    };

    loadPreferences();
  }, [user]);

  useEffect(() => {
    // Only set up realtime for admins and if notifications are enabled
    if (!isAdmin || !preferences.realtime_notifications) return;

    // Create a channel for complaint changes
    const channel = supabase
      .channel('complaint-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'complaints'
        },
        async (payload) => {
          const complaint = payload.new as any;
          
          // Check if new complaint notifications are enabled
          if (preferences.realtime_new_complaint) {
            toast({
              title: "New Complaint Submitted",
              description: `${complaint.student_name} submitted a complaint (${complaint.ticket_id})`,
              duration: 5000,
            });

            // Play notification sound if enabled
            if (preferences.notification_sound) {
              playNotificationSound();
            }
          }

          // Create notification record
          await createNotification(
            "New Complaint Submitted",
            `${complaint.student_name} submitted a complaint (${complaint.ticket_id})`,
            "complaint_action",
            "complaint",
            complaint.id
          );

          // Log the activity
          logActivity(
            "complaint_action",
            `New complaint submitted by ${complaint.student_name}`,
            "complaint",
            complaint.id
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'complaints'
        },
        async (payload) => {
          const oldComplaint = payload.old as any;
          const newComplaint = payload.new as any;

          // Only notify if status changed
          if (oldComplaint.status !== newComplaint.status) {
            // Check if status change notifications are enabled
            if (preferences.realtime_status_change) {
              toast({
                title: "Complaint Status Updated",
                description: `Complaint ${newComplaint.ticket_id} status changed to ${newComplaint.status}`,
                duration: 5000,
              });

              // Play notification sound if enabled
              if (preferences.notification_sound) {
                playNotificationSound();
              }
            }

            // Create notification record
            await createNotification(
              "Complaint Status Updated",
              `Complaint ${newComplaint.ticket_id} status changed to ${newComplaint.status}`,
              "complaint_action",
              "complaint",
              newComplaint.id
            );

            // Log the activity
            logActivity(
              "complaint_action",
              `Complaint ${newComplaint.ticket_id} status changed from ${oldComplaint.status} to ${newComplaint.status}`,
              "complaint",
              newComplaint.id
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [isAdmin, user, toast, preferences]);
}

function playNotificationSound() {
  try {
    // Create a simple notification beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    // Silently fail if audio is not supported
    console.log("Audio notification not available");
  }
}
