import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText } from "lucide-react";
import { z } from "zod";

const complaintSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  mobile: z.string().trim().regex(/^\d{10}$/, "Mobile must be 10 digits"),
  locationId: z.string().uuid("Please select a location"),
  domainId: z.string().uuid("Please select a domain"),
  categoryId: z.string().uuid("Please select a category"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(1000),
});

interface Location {
  id: string;
  name: string;
}

interface Domain {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  icon_name: string;
}

export default function ComplaintForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [locationsRes, domainsRes, categoriesRes] = await Promise.all([
        supabase.from("locations").select("*").order("name"),
        supabase.from("domains").select("*").order("name"),
        supabase.from("categories").select("*").order("name"),
      ]);
      if (locationsRes.data) setLocations(locationsRes.data);
      if (domainsRes.data) setDomains(domainsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (selectedFile.size > maxSize) {
        toast({
          title: "File too large",
          description: "File size must be less than 20MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      mobile: formData.get("mobile") as string,
      locationId: formData.get("location") as string,
      domainId: formData.get("domain") as string,
      categoryId: formData.get("category") as string,
      description: formData.get("description") as string,
    };

    try {
      complaintSchema.parse(data);
      setIsLoading(true);

      let fileUrl = null;
      let fileType = null;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("complaint-files")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("complaint-files")
          .getPublicUrl(fileName);
        
        fileUrl = urlData.publicUrl;
        fileType = file.type;
      }

      const { error: insertError } = await supabase.from("complaints").insert([{
        user_id: user.id,
        student_name: data.name,
        mobile: data.mobile,
        location_id: data.locationId,
        domain_id: data.domainId,
        category_id: data.categoryId,
        description: data.description,
        file_url: fileUrl,
        file_type: fileType,
      }] as any);

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: "Your complaint has been submitted successfully.",
      });

      onSuccess();
      setFile(null);
      e.currentTarget.reset();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: err.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission failed",
          description: err.message || "Please try again later",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.submitComplaint}</CardTitle>
        <CardDescription>{t.welcomeSubtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t.fullName}</Label>
              <Input id="name" name="name" placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">{t.mobileNumber}</Label>
              <Input id="mobile" name="mobile" type="tel" placeholder="9876543210" maxLength={10} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t.location}</Label>
            <Select name="location" required>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={t.selectLocation} />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">{t.domain}</Label>
            <Select name="domain" required>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={t.selectDomain} />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id}>
                    {domain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" required>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your complaint in detail..."
              rows={4}
              maxLength={1000}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Attachment (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept="image/*,video/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {file ? file.name : "Upload file (Max 20MB)"}
              </Button>
            </div>
            {file && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t.loading : t.submitComplaint}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}