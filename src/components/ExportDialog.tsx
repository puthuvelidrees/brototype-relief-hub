import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { exportToPDF, exportToExcel } from "@/lib/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaints: any[];
  categories: any[];
}

export default function ExportDialog({ open, onOpenChange, complaints, categories }: ExportDialogProps) {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    status: "all",
    priority: "all",
    category: "all",
  });

  const getFilteredComplaints = () => {
    return complaints.filter((complaint) => {
      // Date range filter
      if (filters.dateFrom && new Date(complaint.created_at) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(complaint.created_at) > new Date(filters.dateTo)) {
        return false;
      }

      // Status filter
      if (filters.status !== "all" && complaint.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== "all" && complaint.priority !== filters.priority) {
        return false;
      }

      // Category filter
      if (filters.category !== "all") {
        const categoryName = complaint.categories?.name || "";
        if (categoryName !== filters.category) {
          return false;
        }
      }

      return true;
    });
  };

  const handleExport = (format: "pdf" | "excel") => {
    const filteredComplaints = getFilteredComplaints();

    if (filteredComplaints.length === 0) {
      toast({
        title: "No Data to Export",
        description: "No complaints match the selected filters.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (format === "pdf") {
        exportToPDF(filteredComplaints, filters);
      } else {
        exportToExcel(filteredComplaints, filters);
      }

      toast({
        title: "Export Successful",
        description: `Successfully exported ${filteredComplaints.length} complaints to ${format.toUpperCase()}.`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the report.",
        variant: "destructive",
      });
    }
  };

  const filteredCount = getFilteredComplaints().length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Complaints Report</DialogTitle>
          <DialogDescription>
            Configure filters and choose export format. Currently showing {filteredCount} of {complaints.length}{" "}
            complaints.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={() => handleExport("pdf")} className="flex-1 gap-2" variant="default">
              <FileDown className="h-4 w-4" />
              Export as PDF
            </Button>
            <Button onClick={() => handleExport("excel")} className="flex-1 gap-2" variant="secondary">
              <FileSpreadsheet className="h-4 w-4" />
              Export as Excel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
