import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User, FileText, List, FolderOpen, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import brobotAvatar from "@/assets/brobot-avatar.png";

interface Message {
  role: "user" | "assistant";
  content: string;
  status?: "sending" | "sent" | "delivered" | "read";
  timestamp?: string;
}

export default function Chatbot() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  
  const welcomeMessages: Record<string, string> = {
    en: "Hi! I'm here to help you with the complaint process. Ask me anything about submitting complaints, tracking them, or understanding the system.",
    hi: "नमस्ते! मैं शिकायत प्रक्रिया में आपकी मदद करने के लिए यहां हूं। शिकायत दर्ज करने, उन्हें ट्रैक करने या सिस्टम को समझने के बारे में मुझसे कुछ भी पूछें।",
    ml: "ഹായ്! പരാതി പ്രക്രിയയിൽ നിങ്ങളെ സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്. പരാതികൾ സമർപ്പിക്കുന്നതിനെക്കുറിച്ചോ അവ ട്രാക്ക് ചെയ്യുന്നതിനെക്കുറിച്ചോ സിസ്റ്റം മനസ്സിലാക്കുന്നതിനെക്കുറിച്ചോ എന്തും എന്നോട് ചോദിക്കുക.",
    ta: "வணக்கம்! புகார் செயல்முறையில் உங்களுக்கு உதவ நான் இங்கே இருக்கிறேன். புகார்களை சமர்ப்பிப்பது, அவற்றைக் கண்காணிப்பது அல்லது அமைப்பைப் புரிந்துகொள்வது பற்றி என்னிடம் எதையும் கேளுங்கள்."
  };
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: welcomeMessages[language] || welcomeMessages.en,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Update welcome message when language changes
  useEffect(() => {
    setMessages([{
      role: "assistant",
      content: welcomeMessages[language] || welcomeMessages.en,
    }]);
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const userMsg: Message = { 
      role: "user", 
      content: userMessage, 
      status: "sending",
      timestamp: new Date().toISOString()
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    
    // Update to "sent" status
    setTimeout(() => {
      setMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 && msg.role === "user" 
          ? { ...msg, status: "sent" as const } 
          : msg
      ));
    }, 100);
    
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: newMessages, language }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to start stream");
      }

      // Update to "delivered" status
      setMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 && msg.role === "user" 
          ? { ...msg, status: "delivered" as const } 
          : msg
      ));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantMessage = "";

      // Add empty assistant message that we'll update
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantMessage += content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
      
      // Update user message to "read" status
      setMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 2 && msg.role === "user" 
          ? { ...msg, status: "read" as const } 
          : msg
      ));
      
      // Mark as unread if chat is closed
      if (!isOpen) {
        setHasUnreadMessages(true);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setShowQuickActions(false);
    await streamChat(userMessage);
  };

  const placeholders: Record<string, string> = {
    en: "Ask me anything...",
    hi: "मुझसे कुछ भी पूछें...",
    ml: "എന്തും എന്നോട് ചോദിക്കുക...",
    ta: "என்னிடம் எதையும் கேளுங்கள்..."
  };

  const typingTexts: Record<string, string> = {
    en: "AI is typing...",
    hi: "AI टाइप कर रहा है...",
    ml: "AI ടൈപ്പ് ചെയ്യുന്നു...",
    ta: "AI தட்டச்சு செய்கிறது..."
  };

  const aiAssistantLabels: Record<string, string> = {
    en: "BroBot",
    hi: "BroBot",
    ml: "BroBot",
    ta: "BroBot"
  };

  const alwaysHereLabels: Record<string, string> = {
    en: "Always here to help",
    hi: "हमेशा मदद के लिए यहां",
    ml: "എപ്പോഴും സഹായിക്കാൻ ഇവിടെ",
    ta: "எப்போதும் உதவ இங்கே"
  };

  const quickActions = [
    {
      labels: {
        en: "Submit Complaint",
        hi: "शिकायत दर्ज करें",
        ml: "പരാതി സമർപ്പിക്കുക",
        ta: "புகார் சமர்ப்பிக்கவும்"
      },
      icon: FileText,
      action: () => {
        navigate("/");
        setIsOpen(false);
      }
    },
    {
      labels: {
        en: "My Complaints",
        hi: "मेरी शिकायतें",
        ml: "എന്റെ പരാതികൾ",
        ta: "எனது புகார்கள்"
      },
      icon: List,
      action: () => {
        navigate("/my-complaints");
        setIsOpen(false);
      }
    },
    {
      labels: {
        en: "View Categories",
        hi: "श्रेणियां देखें",
        ml: "വിഭാഗങ്ങൾ കാണുക",
        ta: "வகைகளைக் காண்க"
      },
      icon: FolderOpen,
      action: async () => {
        const categoryInfo = language === 'en' 
          ? "Our complaint system has the following categories:\n\n1. Academic - Course content, exams, grades\n2. Infrastructure - Buildings, classrooms, facilities\n3. Hostel - Accommodation issues\n4. Transportation - Bus services, parking\n5. Library - Books, resources, access\n6. Sports - Facilities, equipment\n7. Mess/Canteen - Food quality, service\n8. IT/Technical - Network, computers\n9. Health - Medical services\n10. Other - General complaints"
          : language === 'hi'
          ? "हमारी शिकायत प्रणाली में निम्नलिखित श्रेणियां हैं:\n\n1. शैक्षणिक - पाठ्यक्रम सामग्री, परीक्षा, ग्रेड\n2. बुनियादी ढांचा - भवन, कक्षाएं, सुविधाएं\n3. छात्रावास - आवास के मुद्दे\n4. परिवहन - बस सेवाएं, पार्किंग\n5. पुस्तकालय - किताबें, संसाधन, पहुंच\n6. खेल - सुविधाएं, उपकरण\n7. मेस/कैंटीन - भोजन की गुणवत्ता, सेवा\n8. IT/तकनीकी - नेटवर्क, कंप्यूटर\n9. स्वास्थ्य - चिकित्सा सेवाएं\n10. अन्य - सामान्य शिकायतें"
          : language === 'ml'
          ? "ഞങ്ങളുടെ പരാതി സിസ്റ്റത്തിൽ ഇനിപ്പറയുന്ന വിഭാഗങ്ങളുണ്ട്:\n\n1. അക്കാദമിക് - കോഴ്സ് ഉള്ളടക്കം, പരീക്ഷകൾ, ഗ്രേഡുകൾ\n2. അടിസ്ഥാന സൗകര്യം - കെട്ടിടങ്ങൾ, ക്ലാസ്റൂമുകൾ, സൗകര്യങ്ങൾ\n3. ഹോസ്റ്റൽ - താമസ പ്രശ്നങ്ങൾ\n4. ഗതാഗതം - ബസ് സേവനങ്ങൾ, പാർക്കിംഗ്\n5. ലൈബ്രറി - പുസ്തകങ്ങൾ, വിഭവങ്ങൾ, പ്രവേശനം\n6. കായികം - സൗകര്യങ്ങൾ, ഉപകരണങ്ങൾ\n7. മെസ്/കാന്റീൻ - ഭക്ഷണ നിലവാരം, സേവനം\n8. IT/സാങ്കേതികം - നെറ്റ്‌വർക്ക്, കമ്പ്യൂട്ടറുകൾ\n9. ആരോഗ്യം - മെഡിക്കൽ സേവനങ്ങൾ\n10. മറ്റുള്ളവ - പൊതു പരാതികൾ"
          : "எங்கள் புகார் அமைப்பில் பின்வரும் வகைகள் உள்ளன:\n\n1. கல்வி - பாடத்திட்ட உள்ளடக்கம், தேர்வுகள், மதிப்பெண்கள்\n2. உட்கட்டமைப்பு - கட்டிடங்கள், வகுப்பறைகள், வசதிகள்\n3. விடுதி - தங்குமிட பிரச்சினைகள்\n4. போக்குவரத்து - பேருந்து சேவைகள், வாகன நிறுத்துமிடம்\n5. நூலகம் - புத்தகங்கள், வளங்கள், அணுகல்\n6. விளையாட்டு - வசதிகள், உபகரணங்கள்\n7. உணவகம் - உணவு தரம், சேவை\n8. IT/தொழில்நுட்பம் - நெட்வொர்க், கணினிகள்\n9. சுகாதாரம் - மருத்துவ சேவைகள்\n10. மற்றவை - பொதுவான புகார்கள்";
        
        setMessages(prev => [...prev, 
          { role: "assistant", content: categoryInfo }
        ]);
        setShowQuickActions(false);
        
        // Mark as unread if chat is closed
        if (!isOpen) {
          setHasUnreadMessages(true);
        }
      }
    }
  ];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => {
            setIsOpen(true);
            setHasUnreadMessages(false);
          }}
          className={cn(
            "fixed bottom-6 right-0 h-16 w-16 rounded-full shadow-2xl z-50 relative ring-2 ring-primary/20",
            hasUnreadMessages && "animate-pulse-glow"
          )}
          size="icon"
        >
          <MessageCircle className="h-7 w-7" />
          {hasUnreadMessages && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full animate-ping" />
          )}
          {hasUnreadMessages && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full" />
          )}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-4 w-[380px] h-[600px] shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-background flex items-center justify-center group">
                <img 
                  src={brobotAvatar} 
                  alt="BroBot" 
                  className="h-full w-full object-cover animate-float group-hover:animate-wave cursor-pointer" 
                />
              </div>
              <div>
                <h3 className="font-semibold">{aiAssistantLabels[language] || aiAssistantLabels.en}</h3>
                <p className="text-xs opacity-90">{alwaysHereLabels[language] || alwaysHereLabels.en}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-primary-foreground/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {/* Quick Actions */}
              {showQuickActions && messages.length === 1 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    {language === 'en' && "Quick Actions"}
                    {language === 'hi' && "त्वरित क्रियाएं"}
                    {language === 'ml' && "വേഗത്തിലുള്ള പ്രവർത്തനങ്ങൾ"}
                    {language === 'ta' && "விரைவு செயல்கள்"}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {quickActions.map((action, idx) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={idx}
                          variant="outline"
                          className="justify-start gap-2 h-auto py-3"
                          onClick={action.action}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{action.labels[language] || action.labels.en}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3 items-start",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
                      message.role === "assistant"
                        ? "bg-background border-2 border-primary"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <img 
                        src={brobotAvatar} 
                        alt="BroBot" 
                        className="h-full w-full object-cover animate-bounce-in animate-blink" 
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 max-w-[75%]">
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2",
                        message.role === "assistant"
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex items-center gap-1 justify-end text-xs text-muted-foreground">
                        {message.timestamp && (
                          <span>
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                        {message.status === "sent" && <Check className="w-3 h-3" />}
                        {message.status === "delivered" && <CheckCheck className="w-3 h-3" />}
                        {message.status === "read" && <CheckCheck className="w-3 h-3 text-primary" />}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 items-start animate-fade-in">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-background border-2 border-primary flex items-center justify-center">
                    <img 
                      src={brobotAvatar} 
                      alt="BroBot" 
                      className="h-full w-full object-cover animate-thinking" 
                    />
                  </div>
                  <div className="rounded-lg px-4 py-3 bg-muted/80 backdrop-blur-sm border border-border/50 shadow-sm">
                    <div className="flex gap-1.5 items-center mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-typing-dot" />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-typing-dot [animation-delay:0.2s]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-typing-dot [animation-delay:0.4s]" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {typingTexts[language] || typingTexts.en}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholders[language] || placeholders.en}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}
    </>
  );
}
