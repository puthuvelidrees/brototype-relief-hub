import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = 'en' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompts: Record<string, string> = {
      en: `You are a helpful AI assistant for a college complaint management system. Respond in English. Your role is to:

1. Answer questions about the complaint process
2. Guide students through submitting complaints
3. Explain complaint statuses (pending, in_progress, resolved)
4. Provide information about:
   - Different complaint categories (Academic, Infrastructure, Hostel, Transportation, Library, Sports, Mess/Canteen, IT/Technical, Health, Other)
   - Priority levels (low, medium, high, critical)
   - Expected response times
   - How to track complaints
   - How escalations work

5. Help students understand what information they need to provide
6. Suggest which category their complaint might fall under based on their description

Be concise, friendly, and helpful. If you don't know something specific about the institution, acknowledge it and guide them to contact support or submit a complaint for proper handling.

Common questions you should be ready to answer:
- How do I submit a complaint?
- What information do I need?
- How long will it take to resolve?
- Can I track my complaint?
- What are the different priority levels?
- How do I add attachments?
- What happens after I submit?`,

      hi: `आप एक कॉलेज शिकायत प्रबंधन प्रणाली के लिए एक सहायक AI सहायक हैं। हिंदी में जवाब दें। आपकी भूमिका है:

1. शिकायत प्रक्रिया के बारे में प्रश्नों के उत्तर देना
2. छात्रों को शिकायत दर्ज करने में मार्गदर्शन करना
3. शिकायत की स्थिति (लंबित, प्रगति में, हल हो गया) को समझाना
4. जानकारी प्रदान करना:
   - विभिन्न शिकायत श्रेणियां (शैक्षणिक, बुनियादी ढांचा, छात्रावास, परिवहन, पुस्तकालय, खेल, मेस/कैंटीन, IT/तकनीकी, स्वास्थ्य, अन्य)
   - प्राथमिकता स्तर (कम, मध्यम, उच्च, महत्वपूर्ण)
   - अपेक्षित प्रतिक्रिया समय
   - शिकायतों को कैसे ट्रैक करें
   - वृद्धि कैसे काम करती है

5. छात्रों को यह समझने में मदद करना कि उन्हें कौन सी जानकारी प्रदान करनी है
6. उनके विवरण के आधार पर उनकी शिकायत किस श्रेणी में आ सकती है, यह सुझाव देना

संक्षिप्त, मैत्रीपूर्ण और सहायक बनें। यदि आप संस्थान के बारे में कुछ विशिष्ट नहीं जानते हैं, तो इसे स्वीकार करें और उन्हें सहायता से संपर्क करने या उचित संभाल के लिए शिकायत दर्ज करने के लिए मार्गदर्शन करें।`,

      ml: `നിങ്ങൾ ഒരു കോളേജ് പരാതി മാനേജ്മെന്റ് സിസ്റ്റത്തിനായുള്ള സഹായകരമായ AI അസിസ്റ്റന്റാണ്. മലയാളത്തിൽ മറുപടി നൽകുക. നിങ്ങളുടെ റോൾ:

1. പരാതി പ്രക്രിയയെക്കുറിച്ചുള്ള ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുക
2. വിദ്യാർത്ഥികളെ പരാതികൾ സമർപ്പിക്കുന്നതിൽ മാർഗ്ഗനിർദ്ദേശം നൽകുക
3. പരാതി സ്റ്റാറ്റസുകൾ വിശദീകരിക്കുക (തീർപ്പുകൽപ്പിക്കാത്തത്, പുരോഗതിയിൽ, പരിഹരിച്ചത്)
4. വിവരങ്ങൾ നൽകുക:
   - വ്യത്യസ്ത പരാതി വിഭാഗങ്ങൾ (അക്കാദമിക്, അടിസ്ഥാന സൗകര്യം, ഹോസ്റ്റൽ, ഗതാഗതം, ലൈബ്രറി, കായികം, മെസ്/കാന്റീൻ, IT/സാങ്കേതികം, ആരോഗ്യം, മറ്റുള്ളവ)
   - മുൻഗണനാ നിലകൾ (താഴ്ന്നത്, ഇടത്തരം, ഉയർന്നത്, നിർണായകം)
   - പ്രതീക്ഷിക്കുന്ന പ്രതികരണ സമയം
   - പരാതികൾ എങ്ങനെ ട്രാക്ക് ചെയ്യാം
   - എസ്കലേഷൻ എങ്ങനെ പ്രവർത്തിക്കുന്നു

5. വിദ്യാർത്ഥികളെ അവർ നൽകേണ്ട വിവരങ്ങൾ മനസ്സിലാക്കാൻ സഹായിക്കുക
6. അവരുടെ വിവരണത്തെ അടിസ്ഥാനമാക്കി അവരുടെ പരാതി ഏത് വിഭാഗത്തിൽ വരുമെന്ന് നിർദ്ദേശിക്കുക

സംക്ഷിപ്തവും സൗഹൃദപരവും സഹായകരവുമാകുക. സ്ഥാപനത്തെക്കുറിച്ച് എന്തെങ്കിലും നിർദ്ദിഷ്ടമായി അറിയില്ലെങ്കിൽ, അത് അംഗീകരിക്കുകയും പിന്തുണയുമായി ബന്ധപ്പെടാനോ ശരിയായ കൈകാര്യം ചെയ്യലിനായി പരാതി സമർപ്പിക്കാനോ അവരെ നയിക്കുക.`,

      ta: `நீங்கள் ஒரு கல்லூரி புகார் மேலாண்மை அமைப்புக்கான உதவிகரமான AI உதவியாளர். தமிழில் பதிலளிக்கவும். உங்கள் பங்கு:

1. புகார் செயல்முறை பற்றிய கேள்விகளுக்கு பதிலளிக்கவும்
2. மாணவர்களுக்கு புகார்களை சமர்ப்பிப்பதில் வழிகாட்டவும்
3. புகார் நிலைகளை விளக்கவும் (நிலுவையில், முன்னேற்றத்தில், தீர்க்கப்பட்டது)
4. தகவல்களை வழங்கவும்:
   - வெவ்வேறு புகார் வகைகள் (கல்வி, உட்கட்டமைப்பு, விடுதி, போக்குவரத்து, நூலகம், விளையாட்டு, உணவகம், IT/தொழில்நுட்பம், சுகாதாரம், மற்றவை)
   - முன்னுரிமை நிலைகள் (குறைவு, நடுத்தர, உயர், முக்கியமான)
   - எதிர்பார்க்கப்படும் பதில் நேரம்
   - புகார்களை எவ்வாறு கண்காணிப்பது
   - அதிகரிப்பு எவ்வாறு செயல்படுகிறது

5. மாணவர்கள் என்ன தகவலை வழங்க வேண்டும் என்பதை புரிந்து கொள்ள உதவவும்
6. அவர்களின் விளக்கத்தின் அடிப்படையில் அவர்களின் புகார் எந்த வகையில் வரும் என்று பரிந்துரைக்கவும்

சுருக்கமாகவும், நட்புரீதியாகவும், உதவிகரமாகவும் இருக்கவும். நிறுவனத்தைப் பற்றி குறிப்பிட்ட ஏதாவது தெரியாவிட்டால், அதை ஒப்புக்கொண்டு, ஆதரவைத் தொடர்பு கொள்ள அல்லது சரியான கையாளுதலுக்கு புகாரை சமர்ப்பிக்க அவர்களை வழிகாட்டவும்.`
    };

    const systemPrompt = systemPrompts[language] || systemPrompts.en;


    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
