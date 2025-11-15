import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Calendar, MapPin, Building2, GraduationCap, Home, Bus, BookOpen, Trophy, Utensils, Laptop, Heart, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

const iconMap: Record<string, any> = {
  Building2, GraduationCap, Home, Bus, BookOpen, Trophy, Utensils, Laptop, Heart, MoreHorizontal
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
  locations: { name: string };
  domains: { name: string };
  categories: { name: string; icon_name: string } | null;
}

export default function MyComplaints() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("complaints")
      .select(`
        *,
        locations (name),
        domains (name),
        categories (name, icon_name)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComplaints(data);
    }
    setIsLoading(false);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning text-warning-foreground";
      case "in_progress": return "bg-primary text-primary-foreground";
      case "resolved": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return t.pending;
      case "in_progress": return t.inProgress;
      case "resolved": return t.resolved;
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">{t.myComplaintsTitle}</h1>
            <p className="text-muted-foreground">
              {t.welcomeSubtitle}
            </p>
          </div>

          {complaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">{t.noComplaints}</p>
                <Button onClick={() => navigate("/")} className="mt-4">
                  {t.submitComplaint}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 flex-wrap">
                          Ticket #{complaint.ticket_id}
                          <Badge className={getStatusColor(complaint.status)}>
                            {getStatusText(complaint.status).toUpperCase()}
                          </Badge>
                          <Badge className={getPriorityBadge(complaint.priority)}>
                            {complaint.priority.toUpperCase()}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-2 flex flex-wrap items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(complaint.created_at), "PPP")}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {complaint.locations.name}
                          </span>
                          {complaint.domains && (
                            <Badge variant="outline">
                              {complaint.domains.name}
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                      {complaint.categories && (() => {
                        const Icon = iconMap[complaint.categories.icon_name] || MoreHorizontal;
                        return (
                          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
                            <Icon className="h-5 w-5 text-primary" />
                            <span className="text-xs font-medium">{complaint.categories.name}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{complaint.description}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/complaint/${complaint.id}`)}
                      >
                        View Details & Comments
                      </Button>
                      {complaint.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(complaint.file_url!, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Attachment
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}