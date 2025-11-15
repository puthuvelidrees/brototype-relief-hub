import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import CommentsSection from "@/components/CommentsSection";
import ComplaintTimeline from "@/components/ComplaintTimeline";
import RatingForm from "@/components/RatingForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, MapPin, Phone, User, Building2, FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Complaint {
  id: string;
  ticket_id: string;
  student_name: string;
  mobile: string;
  description: string;
  status: "pending" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high" | "critical";
  file_url: string | null;
  file_type: string | null;
  created_at: string;
  user_id: string;
  locations: { name: string };
  domains: { name: string };
  categories: { name: string; icon_name: string } | null;
}

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchComplaint();
    }
  }, [id, user]);

  const fetchComplaint = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          locations (name),
          domains (name),
          categories (name, icon_name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Check if user has permission to view
      if (!isAdmin && data.user_id !== user?.id) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this complaint",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setComplaint(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load complaint",
        variant: "destructive",
      });
      navigate(isAdmin ? "/admin" : "/my-complaints");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: "pending" | "in_progress" | "resolved") => {
    if (!complaint) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status: newStatus })
        .eq("id", complaint.id);

      if (error) throw error;

      setComplaint({ ...complaint, status: newStatus });
      toast({
        title: "Status Updated",
        description: `Complaint status changed to ${newStatus.replace("_", " ")}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    return variants[priority as keyof typeof variants] || variants.medium;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning text-warning-foreground";
      case "in_progress": return "bg-primary text-primary-foreground";
      case "resolved": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate(isAdmin ? "/admin" : "/my-complaints")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">
                    Ticket #{complaint.ticket_id}
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getStatusColor(complaint.status)}>
                      {complaint.status.replace("_", " ").toUpperCase()}
                    </Badge>
                    <Badge className={getPriorityBadge(complaint.priority)}>
                      {complaint.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                {isAdmin && (
                  <Select
                    value={complaint.status}
                    onValueChange={handleStatusUpdate}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Student:</span>
                  <span>{complaint.student_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Mobile:</span>
                  <span>{complaint.mobile}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Submitted:</span>
                  <span>{format(new Date(complaint.created_at), "PPP")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Location:</span>
                  <span>{complaint.locations.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Domain:</span>
                  <span>{complaint.domains.name}</span>
                </div>
                {complaint.categories && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Category:</span>
                    <span>{complaint.categories.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>

              {complaint.file_url && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Attachment</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={complaint.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Attachment
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <ComplaintTimeline complaintId={complaint.id} />

          <CommentsSection complaintId={complaint.id} />

          <RatingForm 
            complaintId={complaint.id} 
            complaintStatus={complaint.status}
          />
        </div>
      </main>
    </div>
  );
}
