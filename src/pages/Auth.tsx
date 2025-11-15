import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Check, X, Eye, EyeOff } from "lucide-react";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";

const signUpSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  mobile: z.string().trim().regex(/^\d{10}$/, "Mobile must be 10 digits"),
});

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type PasswordStrength = "weak" | "medium" | "strong" | null;

interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) return null;
  
  let strength = 0;
  if (password.length >= 12) strength++;
  if (password.length >= 16) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  if (strength <= 2) return "weak";
  if (strength <= 4) return "medium";
  return "strong";
};

const checkPasswordRequirements = (password: string): PasswordRequirements => {
  return {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[^A-Za-z0-9]/.test(password),
  };
};

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <div className="flex items-center gap-2 text-xs transition-all duration-300">
    <div className={`transition-all duration-300 ${met ? "scale-100 rotate-0" : "scale-90 opacity-70"}`}>
      {met ? (
        <Check className="h-4 w-4 text-success transition-all duration-300" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground transition-all duration-300" />
      )}
    </div>
    <span className={`transition-all duration-300 ${met ? "text-success font-medium" : "text-muted-foreground"}`}>
      {text}
    </span>
  </div>
);

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(null);
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirements>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const hasShownConfetti = useRef(false);
  const { user, isAdmin, loading, signUp, signIn, resetPassword, updatePassword, isPasswordRecovery } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Trigger confetti when password becomes strong
  useEffect(() => {
    if (passwordStrength === "strong" && !hasShownConfetti.current) {
      hasShownConfetti.current = true;
      
      // Play success sound
      playSuccessSound();
      
      // Fire confetti from multiple angles
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    } else if (passwordStrength !== "strong") {
      // Reset confetti flag when password becomes weak/medium again
      hasShownConfetti.current = false;
    }
  }, [passwordStrength]);

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a pleasant success melody
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      
      // Play a pleasant ascending melody (C-E-G major chord arpeggio)
      const now = audioContext.currentTime;
      playTone(523.25, now, 0.15); // C5
      playTone(659.25, now + 0.1, 0.15); // E5
      playTone(783.99, now + 0.2, 0.25); // G5
    } catch (error) {
      console.log("Audio playback not supported");
    }
  };

  useEffect(() => {
    if (!loading && user && !isPasswordRecovery) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, isAdmin, loading, isPasswordRecovery, navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      email: formData.get("signupEmail") as string,
      password: formData.get("signupPassword") as string,
      fullName: formData.get("fullName") as string,
      mobile: formData.get("mobile") as string,
    };

    try {
      signUpSchema.parse(data);
      setIsLoading(true);

      const { error } = await signUp(data.email, data.password, {
        full_name: data.fullName,
        mobile: data.mobile,
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success!",
          description: "Your account has been created. Welcome to Brototype!",
        });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: err.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      email: formData.get("signinEmail") as string,
      password: formData.get("signinPassword") as string,
    };

    try {
      signInSchema.parse(data);
      setIsLoading(true);

      // Check if account is locked before attempting login
      const { data: checkData, error: checkError } = await supabase.functions.invoke(
        'check-login-attempt',
        {
          body: {
            email: data.email,
            success: false, // We're checking before knowing if it will succeed
            userAgent: navigator.userAgent
          }
        }
      );

      if (checkError || !checkData?.allowed) {
        toast({
          title: "Account Locked",
          description: checkData?.message || "Too many failed login attempts. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await signIn(data.email, data.password);

      // Log the attempt result
      await supabase.functions.invoke('check-login-attempt', {
        body: {
          email: data.email,
          success: !error,
          userAgent: navigator.userAgent
        }
      });

      if (error) {
        const attemptsRemaining = checkData?.attemptsRemaining || 0;
        
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login failed",
            description: attemptsRemaining > 0 
              ? `Invalid email or password. ${attemptsRemaining - 1} attempt(s) remaining before account lockout.`
              : "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: err.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      email: formData.get("resetEmail") as string,
    };

    try {
      const emailSchema = z.string().trim().email("Invalid email address");
      emailSchema.parse(data.email);
      setIsLoading(true);

      const { error } = await resetPassword(data.email);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Password reset link sent to your email. Please check your inbox.",
        });
        setShowResetForm(false);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: err.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    try {
      const passwordSchema = z.object({
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
      }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });

      passwordSchema.parse(data);
      setIsLoading(true);

      const { error } = await updatePassword(data.newPassword);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Your password has been updated successfully.",
        });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: err.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show password update form if user is in recovery mode
  if (isPasswordRecovery) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <Card className="w-full max-w-md shadow-lg my-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Set New Password
            </CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-lg my-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t.appTitle}
          </CardTitle>
          <CardDescription>{t.welcomeSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t.signIn}</TabsTrigger>
              <TabsTrigger value="signup">{t.signUp}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              {!showResetForm ? (
                <form onSubmit={handleSignIn} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="signinEmail">{t.email}</Label>
                    <Input
                      id="signinEmail"
                      name="signinEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signinPassword">{t.password}</Label>
                    <div className="relative">
                      <Input
                        id="signinPassword"
                        name="signinPassword"
                        type={showSignInPassword ? "text" : "password"}
                        placeholder="••••••"
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showSignInPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-sm"
                      onClick={() => setShowResetForm(true)}
                    >
                      {t.forgotPassword}
                    </Button>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t.loading : t.signIn}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="resetEmail">{t.email}</Label>
                    <Input
                      id="resetEmail"
                      name="resetEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowResetForm(false)}
                    >
                      {t.backToSignIn}
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? t.loading : t.sendResetLink}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="fullName">{t.fullName}</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mobile">{t.mobileNumber}</Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    placeholder="9876543210"
                    maxLength={10}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signupEmail">{t.email}</Label>
                  <Input
                    id="signupEmail"
                    name="signupEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signupPassword">{t.password}</Label>
                  <div className="relative">
                    <Input
                      id="signupPassword"
                      name="signupPassword"
                      type={showSignUpPassword ? "text" : "password"}
                      placeholder="At least 12 characters"
                      required
                      className="pr-10"
                      onChange={(e) => {
                        const password = e.target.value;
                        setPasswordStrength(calculatePasswordStrength(password));
                        setPasswordRequirements(checkPasswordRequirements(password));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showSignUpPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordStrength && (
                    <div className="space-y-1 mt-2 animate-fade-in">
                      <div className="flex gap-1 mb-2">
                        <div className={`h-1.5 flex-1 rounded-full origin-left transition-all duration-500 ease-out ${
                          passwordStrength === "weak" ? "bg-destructive scale-x-100 animate-strength-fill" : 
                          passwordStrength === "medium" ? "bg-warning scale-x-100 animate-strength-fill" : 
                          "bg-success scale-x-100 animate-strength-fill"
                        } ${passwordStrength === "strong" ? "animate-pulse-glow" : ""}`} />
                        <div className={`h-1.5 flex-1 rounded-full origin-left transition-all duration-500 ease-out delay-75 ${
                          passwordStrength === "medium" ? "bg-warning scale-x-100 animate-strength-fill" : 
                          passwordStrength === "strong" ? "bg-success scale-x-100 animate-strength-fill" : 
                          "bg-muted/30 scale-x-0"
                        }`} />
                        <div className={`h-1.5 flex-1 rounded-full origin-left transition-all duration-500 ease-out delay-150 ${
                          passwordStrength === "strong" ? "bg-success scale-x-100 animate-strength-fill" : "bg-muted/30 scale-x-0"
                        }`} />
                      </div>
                      <div className="space-y-1 transition-all duration-300">
                        <RequirementItem 
                          met={passwordRequirements.minLength} 
                          text="At least 12 characters" 
                        />
                        <RequirementItem 
                          met={passwordRequirements.hasUppercase} 
                          text="One uppercase letter (A-Z)" 
                        />
                        <RequirementItem 
                          met={passwordRequirements.hasLowercase} 
                          text="One lowercase letter (a-z)" 
                        />
                        <RequirementItem 
                          met={passwordRequirements.hasNumber} 
                          text="One number (0-9)" 
                        />
                        <RequirementItem 
                          met={passwordRequirements.hasSpecialChar} 
                          text="One special character (!@#$%...)" 
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t.loading : t.signUp}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}