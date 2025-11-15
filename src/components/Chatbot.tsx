import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chatbot() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
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
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
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
    await streamChat(userMessage);
  };

  const placeholders: Record<string, string> = {
    en: "Ask me anything...",
    hi: "मुझसे कुछ भी पूछें...",
    ml: "എന്തും എന്നോട് ചോദിക്കുക...",
    ta: "என்னிடம் எதையும் கேளுங்கள்..."
  };

  const aiAssistantLabels: Record<string, string> = {
    en: "AI Assistant",
    hi: "AI सहायक",
    ml: "AI അസിസ്റ്റന്റ്",
    ta: "AI உதவியாளர்"
  };

  const alwaysHereLabels: Record<string, string> = {
    en: "Always here to help",
    hi: "हमेशा मदद के लिए यहां",
    ml: "എപ്പോഴും സഹായിക്കാൻ ഇവിടെ",
    ta: "எப்போதும் உதவ இங்கே"
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
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
                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                      message.role === "assistant"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 max-w-[75%]",
                      message.role === "assistant"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-lg px-4 py-2 bg-muted">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce [animation-delay:0.4s]" />
                    </div>
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
