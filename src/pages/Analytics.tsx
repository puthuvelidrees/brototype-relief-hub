import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { TrendingUp, Activity, CheckCircle, Users, Clock, AlertTriangle } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface Complaint {
  id: string;
  status: string;
  priority: string;
  created_at: string;
  resolved_at: string | null;
  first_response_at: string | null;
  sla_response_breached: boolean;
  sla_resolution_breached: boolean;
  assigned_to: string | null;
  categories: { name: string } | null;
}

interface AdminProfile {
  id: string;
  full_name: string | null;
}

export default function Analytics() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [adminProfiles, setAdminProfiles] = useState<AdminProfile[]>([]);
  const [timeRange, setTimeRange] = useState("30");
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
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, timeRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const daysAgo = parseInt(timeRange);
      const startDate = startOfDay(subDays(new Date(), daysAgo));

      // Fetch complaints
      const { data: complaintsData, error: complaintsError } = await supabase
        .from("complaints")
        .select("id, status, priority, created_at, resolved_at, first_response_at, sla_response_breached, sla_resolution_breached, assigned_to, categories(name)")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (complaintsError) throw complaintsError;

      // Fetch admin profiles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (rolesData) {
        const adminIds = rolesData.map((r) => r.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", adminIds);

        if (profilesData) setAdminProfiles(profilesData);
      }

      setComplaints(complaintsData || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate trend data (complaints over time)
  const getTrendData = () => {
    const days = parseInt(timeRange);
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "MMM dd");
      const dayComplaints = complaints.filter((c) => 
        format(new Date(c.created_at), "MMM dd") === dateStr
      );

      data.push({
        date: dateStr,
        total: dayComplaints.length,
        pending: dayComplaints.filter((c) => c.status === "pending").length,
        in_progress: dayComplaints.filter((c) => c.status === "in_progress").length,
        resolved: dayComplaints.filter((c) => c.status === "resolved").length,
      });
    }

    return data;
  };

  // Calculate category distribution
  const getCategoryData = () => {
    const categoryMap: Record<string, number> = {};
    
    complaints.forEach((c) => {
      const category = c.categories?.name || "Uncategorized";
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  };

  // Calculate priority distribution
  const getPriorityData = () => {
    const priorities = ["low", "medium", "high", "critical"];
    return priorities.map((priority) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: complaints.filter((c) => c.priority === priority).length,
    }));
  };

  // Calculate admin performance
  const getAdminPerformance = () => {
    const adminStats = adminProfiles.map((admin) => {
      const assignedComplaints = complaints.filter((c) => c.assigned_to === admin.id);
      const resolved = assignedComplaints.filter((c) => c.status === "resolved");
      
      // Calculate average resolution time
      const resolvedWithTime = resolved.filter((c) => c.resolved_at);
      const avgResolutionTime = resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((sum, c) => {
            const created = new Date(c.created_at).getTime();
            const resolved = new Date(c.resolved_at!).getTime();
            return sum + (resolved - created) / (1000 * 60 * 60); // hours
          }, 0) / resolvedWithTime.length
        : 0;

      return {
        name: admin.full_name || "Unknown",
        assigned: assignedComplaints.length,
        resolved: resolved.length,
        resolutionRate: assignedComplaints.length > 0 
          ? Math.round((resolved.length / assignedComplaints.length) * 100) 
          : 0,
        avgHours: Math.round(avgResolutionTime),
      };
    }).filter((admin) => admin.assigned > 0);

    return adminStats.sort((a, b) => b.resolved - a.resolved);
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const trendData = getTrendData();
  const categoryData = getCategoryData();
  const priorityData = getPriorityData();
  const adminPerformance = getAdminPerformance();

  const stats = {
    total: complaints.length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    pending: complaints.filter((c) => c.status === "pending").length,
    avgResolutionRate: complaints.length > 0 
      ? Math.round((complaints.filter((c) => c.status === "resolved").length / complaints.length) * 100) 
      : 0,
    slaResponseMet: complaints.length > 0
      ? Math.round((complaints.filter((c) => !c.sla_response_breached).length / complaints.length) * 100)
      : 0,
    slaResolutionMet: complaints.length > 0
      ? Math.round((complaints.filter((c) => !c.sla_resolution_breached).length / complaints.length) * 100)
      : 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Insights and performance metrics</p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{stats.resolved}</div>
                <p className="text-xs text-muted-foreground">{stats.avgResolutionRate}% resolution rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <TrendingUp className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Awaiting action</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminPerformance.length}</div>
                <p className="text-xs text-muted-foreground">Handling complaints</p>
              </CardContent>
            </Card>
          </div>

          {/* SLA Performance Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response SLA Compliance</CardTitle>
                <Clock className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.slaResponseMet}%</div>
                <p className="text-xs text-muted-foreground">
                  {complaints.filter(c => !c.sla_response_breached).length} of {stats.total} within SLA
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolution SLA Compliance</CardTitle>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.slaResolutionMet}%</div>
                <p className="text-xs text-muted-foreground">
                  {complaints.filter(c => !c.sla_resolution_breached).length} of {stats.total} within SLA
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Complaint Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))" 
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" name="Total" strokeWidth={2} />
                  <Line type="monotone" dataKey="resolved" stroke="hsl(var(--success))" name="Resolved" strokeWidth={2} />
                  <Line type="monotone" dataKey="pending" stroke="hsl(var(--warning))" name="Pending" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribution Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))" 
                      }} 
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Admin Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={adminPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))" 
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="assigned" fill="hsl(var(--primary))" name="Assigned" />
                  <Bar dataKey="resolved" fill="hsl(var(--success))" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
              
              {/* Performance Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-2 font-medium">Admin</th>
                      <th className="pb-2 font-medium text-right">Assigned</th>
                      <th className="pb-2 font-medium text-right">Resolved</th>
                      <th className="pb-2 font-medium text-right">Rate</th>
                      <th className="pb-2 font-medium text-right">Avg Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminPerformance.map((admin, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{admin.name}</td>
                        <td className="py-2 text-right">{admin.assigned}</td>
                        <td className="py-2 text-right text-success">{admin.resolved}</td>
                        <td className="py-2 text-right">{admin.resolutionRate}%</td>
                        <td className="py-2 text-right">{admin.avgHours}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
