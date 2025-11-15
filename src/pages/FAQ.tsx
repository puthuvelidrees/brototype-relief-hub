import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { HelpCircle, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function FAQ() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = t.faqs.filter((faq: any) => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t.faqTitle}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t.faqSubtitle}
            </p>
          </div>

          {/* Search */}
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.searchFaq}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* FAQ Accordion */}
          <Card className="p-6">
            {filteredFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq: any, index: number) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t.noFaqFound}
              </div>
            )}
          </Card>

          {/* Contact Support */}
          <Card className="p-6 bg-muted/50">
            <h3 className="font-semibold text-lg mb-2">{t.stillNeedHelp}</h3>
            <p className="text-muted-foreground mb-4">
              {t.contactSupport}
            </p>
            <a 
              href="tel:+918714124666" 
              className="text-primary hover:underline font-medium"
            >
              +91 8714 124 666
            </a>
          </Card>
        </div>
      </main>
    </div>
  );
}
