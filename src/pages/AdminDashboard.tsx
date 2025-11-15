import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, ExternalLink, CheckCircle, Calendar, MapPin, Phone, User, Building2, GraduationCap, Home, Bus, BookOpen, Trophy, Utensils, Laptop, Heart, MoreHorizontal, Filter } from "lucide-react";
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
  created_at: string;
  locations: { name: string };
  domains: { name: string };
  categories: { name: string; icon_name: string } | null;
}

interface Category {
  id: string;
  name: string;
  icon_name: string;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  useRealtimeNotifications(); // Enable real-time notifications
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user && isAdmin) {
      fetchComplaints();
      
      // Real-time updates
      const channel = supabase
        .channel("admin-complaints")
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "complaints",
        }, () => {
          fetchComplaints();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isAdmin]);

  useEffect(() => {
    let filtered = complaints;

    // Filter by search
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
          c.student_name.toLowerCase().includes(search.toLowerCase()) ||
          c.mobile.includes(search) ||
          c.locations.name.toLowerCase().includes(search.toLowerCase()) ||
          (c.domains && c.domains.name.toLowerCase().includes(search.toLowerCase())) ||
          (c.categories && c.categories.name.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((c) => c.categories?.name === selectedCategory);
    }

    // Filter by priority
    if (selectedPriority !== "all") {
      filtered = filtered.filter((c) => c.priority === selectedPriority);
    }

    setFilteredComplaints(filtered);
  }, [search, selectedCategory, selectedPriority, complaints]);

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select(`
        *,
        locations (name),
        domains (name),
        categories (name, icon_name)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComplaints(data);
      setFilteredComplaints(data);
    }
    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: "in_progress" | "resolved") => {
    const { error } = await supabase
      .from("complaints")
      .update({ status, resolved_at: status === "resolved" ? new Date().toISOString() : null })
      .eq("id", id);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Complaint marked as ${status.replace("_", " ")}`,
      });
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

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    inProgress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage and respond to student complaints</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{stats.resolved}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by ticket, name, mobile, location, domain, or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px] bg-background">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-[150px] bg-background">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">#{complaint.ticket_id}</h3>
                          <Badge
                            className={
                              complaint.status === "pending"
                                ? "bg-warning text-warning-foreground"
                                : complaint.status === "in_progress"
                                ? "bg-primary text-primary-foreground"
                                : "bg-success text-success-foreground"
                            }
                          >
                            {complaint.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge className={getPriorityBadge(complaint.priority)}>
                            {complaint.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {complaint.student_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {complaint.mobile}
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
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(complaint.created_at), "PPP")}
                          </span>
                        </div>
                      </div>
                      {complaint.categories && (() => {
                        const Icon = iconMap[complaint.categories.icon_name] || MoreHorizontal;
                        return (
                          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
                            <Icon className="h-6 w-6 text-primary" />
                            <span className="text-xs font-medium">{complaint.categories.name}</span>
                          </div>
                        );
                      })()}
                    </div>

                    <p className="text-sm">{complaint.description}</p>

                    <div className="flex items-center gap-2">
                      {complaint.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(complaint.file_url!, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View File
                        </Button>
                      )}
                      
                      {complaint.status !== "resolved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(complaint.id, "resolved")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Resolved
                        </Button>
                      )}

                      {complaint.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(complaint.id, "in_progress")}
                        >
                          Mark In Progress
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredComplaints.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No complaints found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}