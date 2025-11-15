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
  priority: z.enum(["low", "medium", "high", "critical"], { required_error: "Please select a priority" }),
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

interface FieldErrors {
  name?: string;
  mobile?: string;
  locationId?: string;
  domainId?: string;
  categoryId?: string;
  priority?: string;
  description?: string;
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
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  const validateField = (name: string, value: string) => {
    try {
      switch (name) {
        case "name":
          complaintSchema.shape.name.parse(value);
          break;
        case "mobile":
          complaintSchema.shape.mobile.parse(value);
          break;
        case "location":
          complaintSchema.shape.locationId.parse(value);
          break;
        case "domain":
          complaintSchema.shape.domainId.parse(value);
          break;
        case "category":
          complaintSchema.shape.categoryId.parse(value);
          break;
        case "priority":
          complaintSchema.shape.priority.parse(value);
          break;
        case "description":
          complaintSchema.shape.description.parse(value);
          break;
      }
      setErrors(prev => ({ ...prev, [name === "location" ? "locationId" : name === "domain" ? "domainId" : name === "category" ? "categoryId" : name]: undefined }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [name === "location" ? "locationId" : name === "domain" ? "domainId" : name === "category" ? "categoryId" : name]: err.errors[0].message }));
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSelectChange = (name: string, value: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
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
      priority: formData.get("priority") as "low" | "medium" | "high" | "critical",
      description: formData.get("description") as string,
    };

    try {
      complaintSchema.parse(data);
      setIsLoading(true);

      // Check rate limit before submitting
      const { data: { session } } = await supabase.auth.getSession();
      const { data: rateLimitData, error: rateLimitError } = await supabase.functions.invoke(
        'check-complaint-rate-limit',
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      if (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError);
        throw new Error('Failed to check rate limit');
      }

      if (!rateLimitData.allowed) {
        const resetDate = new Date(rateLimitData.resetTime);
        const hoursUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60));
        
        toast({
          title: "Rate Limit Exceeded",
          description: `You have reached the maximum of ${rateLimitData.maxPerDay} complaints per day. Please try again in ${hoursUntilReset} hour(s).`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Show remaining submissions warning
      if (rateLimitData.remainingSubmissions <= 3 && rateLimitData.remainingSubmissions > 0) {
        toast({
          title: "Rate Limit Warning",
          description: `You have ${rateLimitData.remainingSubmissions} complaint submission(s) remaining today.`,
        });
      }

      let fileUrl = null;
      let fileType = null;

      // Upload file using validated edge function
      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        const { data: uploadData, error: uploadError } = await supabase.functions.invoke(
          'validate-file-upload',
          {
            body: uploadFormData,
            headers: {
              Authorization: `Bearer ${session?.access_token}`
            }
          }
        );

        if (uploadError || !uploadData?.success) {
          console.error("Upload error:", uploadError || uploadData?.error);
          throw new Error(uploadData?.error || "Failed to upload file");
        }

        fileUrl = uploadData.path;
        fileType = uploadData.type;
      }

      const { data: insertData, error: insertError } = await supabase
        .from("complaints")
        .insert([{
          user_id: user.id,
          student_name: data.name,
          mobile: data.mobile,
          location_id: data.locationId,
          domain_id: data.domainId,
          category_id: data.categoryId,
          priority: data.priority,
          description: data.description,
          file_url: fileUrl,
          file_type: fileType,
        }] as any)
        .select()
        .single();

      if (insertError) throw insertError;

      // Trigger auto-assignment in background (don't wait for it)
      if (insertData?.id) {
        supabase.functions.invoke('auto-assign-complaint', {
          body: { complaintId: insertData.id }
        }).catch(err => console.error('Auto-assignment failed:', err));
      }

      toast({
        title: "Success!",
        description: "Your complaint has been submitted successfully.",
      });

      setFile(null);
      setErrors({});
      setTouched({});
      e.currentTarget?.reset();
      onSuccess();
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
              <Input 
                id="name" 
                name="name" 
                placeholder="Your name" 
                onBlur={handleBlur}
                className={touched.name && errors.name ? "border-destructive" : ""}
                required 
              />
              {touched.name && errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">{t.mobileNumber}</Label>
              <Input 
                id="mobile" 
                name="mobile" 
                type="tel" 
                placeholder="9876543210" 
                maxLength={10}
                onBlur={handleBlur}
                className={touched.mobile && errors.mobile ? "border-destructive" : ""}
                required 
              />
              {touched.mobile && errors.mobile && (
                <p className="text-sm text-destructive">{errors.mobile}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t.location}</Label>
            <Select name="location" onValueChange={(value) => handleSelectChange("location", value)} required>
              <SelectTrigger className={`bg-background ${touched.location && errors.locationId ? "border-destructive" : ""}`}>
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
            {touched.location && errors.locationId && (
              <p className="text-sm text-destructive">{errors.locationId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">{t.domain}</Label>
            <Select name="domain" onValueChange={(value) => handleSelectChange("domain", value)} required>
              <SelectTrigger className={`bg-background ${touched.domain && errors.domainId ? "border-destructive" : ""}`}>
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
            {touched.domain && errors.domainId && (
              <p className="text-sm text-destructive">{errors.domainId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select name="category" onValueChange={(value) => handleSelectChange("category", value)} required>
              <SelectTrigger className={`bg-background ${touched.category && errors.categoryId ? "border-destructive" : ""}`}>
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
            {touched.category && errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select name="priority" onValueChange={(value) => handleSelectChange("priority", value)} required>
              <SelectTrigger className={`bg-background ${touched.priority && errors.priority ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Low
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    High
                  </div>
                </SelectItem>
                <SelectItem value="critical">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Critical
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {touched.priority && errors.priority && (
              <p className="text-sm text-destructive">{errors.priority}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your complaint in detail..."
              rows={4}
              maxLength={1000}
              onBlur={handleBlur}
              className={touched.description && errors.description ? "border-destructive" : ""}
              required
            />
            {touched.description && errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
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