import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useRealtimeNotifications() {
  const { toast } = useToast();
  const { isAdmin, user } = useAuth();
  const channelRef = useRef<any>(null);

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

  useEffect(() => {
    // Only set up realtime for admins
    if (!isAdmin) return;

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
        (payload) => {
          const complaint = payload.new as any;
          toast({
            title: "New Complaint Submitted",
            description: `${complaint.student_name} submitted a complaint (${complaint.ticket_id})`,
            duration: 5000,
          });

          // Log the activity
          logActivity(
            "complaint_action",
            `New complaint submitted by ${complaint.student_name}`,
            "complaint",
            complaint.id
          );

          // Play notification sound
          playNotificationSound();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'complaints'
        },
        (payload) => {
          const oldComplaint = payload.old as any;
          const newComplaint = payload.new as any;

          // Only notify if status changed
          if (oldComplaint.status !== newComplaint.status) {
            toast({
              title: "Complaint Status Updated",
              description: `Complaint ${newComplaint.ticket_id} status changed to ${newComplaint.status}`,
              duration: 5000,
            });

            // Log the activity
            logActivity(
              "complaint_action",
              `Complaint ${newComplaint.ticket_id} status changed from ${oldComplaint.status} to ${newComplaint.status}`,
              "complaint",
              newComplaint.id
            );

            playNotificationSound();
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
  }, [isAdmin, user, toast]);
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
