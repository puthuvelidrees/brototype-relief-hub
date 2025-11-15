import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import ComplaintForm from "@/components/ComplaintForm";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export default function StudentPortal() {
  const { user, isAdmin, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleEmergencyCall = () => {
    window.location.href = "tel:+918714124666";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t.welcomeTitle}
            </h1>
            <p className="text-muted-foreground">
              {t.welcomeSubtitle}
            </p>
          </div>

          <ComplaintForm onSuccess={() => navigate("/my-complaints")} />

          <div className="flex justify-center">
            <Button
              onClick={handleEmergencyCall}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Phone className="h-5 w-5" />
              24/7 Emergency Helpline
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}