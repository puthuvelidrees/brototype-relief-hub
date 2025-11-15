export type Language = 'en' | 'hi' | 'ml' | 'ta';

export type TranslationKeys = {
  // Navbar
  appTitle: string;
  submit: string;
  myComplaints: string;
  admin: string;
  signOut: string;
  
  // Auth Page
  signIn: string;
  signUp: string;
  email: string;
  password: string;
  fullName: string;
  mobileNumber: string;
  forgotPassword: string;
  sendResetLink: string;
  backToSignIn: string;
  resetPassword: string;
  
  // Student Portal
  welcomeTitle: string;
  welcomeSubtitle: string;
  submitComplaint: string;
  complaintType: string;
  location: string;
  selectLocation: string;
  domain: string;
  selectDomain: string;
  description: string;
  submitButton: string;
  
  // Complaint Types
  technical: string;
  facility: string;
  academic: string;
  administrative: string;
  other: string;
  
  // My Complaints
  myComplaintsTitle: string;
  status: string;
  pending: string;
  inProgress: string;
  resolved: string;
  noComplaints: string;
  
  // Admin Dashboard
  adminDashboard: string;
  allComplaints: string;
  complaintDetails: string;
  updateStatus: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save: string;
  
  // FAQ
  faqTitle: string;
  faqSubtitle: string;
  searchFaq: string;
  noFaqFound: string;
  stillNeedHelp: string;
  contactSupport: string;
  faqs: Array<{ question: string; answer: string }>;
  
  // Rating System
  rateResolution: string;
  rateResolutionDescription: string;
  rating: string;
  feedback: string;
  optional: string;
  feedbackPlaceholder: string;
  submitRating: string;
  updateRating: string;
  editRating: string;
  yourRating: string;
  yourFeedback: string;
  pleaseSelectRating: string;
  ratingSubmitted: string;
  ratingUpdated: string;
  submitting: string;
  ratingPoor: string;
  ratingFair: string;
  ratingGood: string;
  ratingVeryGood: string;
  ratingExcellent: string;
};

export const translations: Record<Language, TranslationKeys> = {
  en: {
    // Navbar
    appTitle: 'Brototype Complaints',
    submit: 'Submit',
    myComplaints: 'My Complaints',
    admin: 'Admin',
    signOut: 'Sign Out',
    
    // Auth Page
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    mobileNumber: 'Mobile Number',
    forgotPassword: 'Forgot Password?',
    sendResetLink: 'Send Reset Link',
    backToSignIn: 'Back to Sign In',
    resetPassword: 'Reset Password',
    
    // Student Portal
    welcomeTitle: 'Student Complaint Portal',
    welcomeSubtitle: 'Submit your complaints and track their status',
    submitComplaint: 'Submit a Complaint',
    complaintType: 'Complaint Type',
    location: 'Location',
    selectLocation: 'Select your location',
    domain: 'Domain',
    selectDomain: 'Select domain',
    description: 'Description',
    submitButton: 'Submit Complaint',
    
    // Complaint Types
    technical: 'Technical',
    facility: 'Facility',
    academic: 'Academic',
    administrative: 'Administrative',
    other: 'Other',
    
    // My Complaints
    myComplaintsTitle: 'My Complaints',
    status: 'Status',
    pending: 'Pending',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    noComplaints: 'No complaints found',
    
    // Admin Dashboard
    adminDashboard: 'Admin Dashboard',
    allComplaints: 'All Complaints',
    complaintDetails: 'Complaint Details',
    updateStatus: 'Update Status',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    
    // FAQ
    faqTitle: 'Help Center',
    faqSubtitle: 'Find answers to common questions about filing and tracking complaints',
    searchFaq: 'Search for questions...',
    noFaqFound: 'No questions found matching your search',
    stillNeedHelp: 'Still need help?',
    contactSupport: 'If you couldn\'t find an answer to your question, feel free to contact our support team:',
    faqs: [
      {
        question: 'How do I submit a complaint?',
        answer: 'Click on the "Submit" button in the navigation menu, fill out the complaint form with all required details including location, domain, and description, then click "Submit Complaint".'
      },
      {
        question: 'How can I track my complaint status?',
        answer: 'Go to "My Complaints" section from the navigation menu. You\'ll see all your submitted complaints with their current status (Pending, In Progress, or Resolved).'
      },
      {
        question: 'What are the different complaint statuses?',
        answer: 'Pending: Your complaint has been submitted and is waiting to be reviewed. In Progress: An admin is actively working on resolving your complaint. Resolved: Your complaint has been addressed and closed.'
      },
      {
        question: 'How long does it take to resolve a complaint?',
        answer: 'Resolution time depends on the priority and complexity of the issue. High priority complaints are typically addressed within 24 hours, while medium and low priority complaints may take 2-7 days.'
      },
      {
        question: 'Can I add comments to my complaint?',
        answer: 'Yes! Open your complaint from the "My Complaints" section and scroll down to the comments area. You can add updates or additional information there.'
      },
      {
        question: 'What should I include in my complaint description?',
        answer: 'Be as specific as possible. Include: What happened, When it happened, Where it happened, Who was involved (if applicable), and Any relevant details that will help us understand and resolve the issue.'
      },
      {
        question: 'Can I edit or delete my complaint after submission?',
        answer: 'Once submitted, complaints cannot be edited or deleted to maintain record integrity. However, you can add comments with additional information or corrections.'
      },
      {
        question: 'Will I receive notifications about my complaint?',
        answer: 'Yes, you\'ll receive real-time notifications when there are updates to your complaint status or when admins add comments.'
      },
      {
        question: 'What if my issue is urgent?',
        answer: 'For urgent matters, use the 24/7 Emergency Helpline button on the home page. For regular complaints, high priority issues are typically addressed first.'
      },
      {
        question: 'Who can see my complaint?',
        answer: 'Only you and the admin team can see your complaint details. Your information is kept confidential and used solely for resolving your issue.'
      }
    ],
    
    // Rating System
    rateResolution: 'Rate Resolution Quality',
    rateResolutionDescription: 'Help us improve by rating how satisfied you are with the resolution',
    rating: 'Rating',
    feedback: 'Feedback',
    optional: 'Optional',
    feedbackPlaceholder: 'Share your experience (optional)...',
    submitRating: 'Submit Rating',
    updateRating: 'Update Rating',
    editRating: 'Edit Rating',
    yourRating: 'Your Rating',
    yourFeedback: 'Your Feedback',
    pleaseSelectRating: 'Please select a rating',
    ratingSubmitted: 'Thank you for your feedback!',
    ratingUpdated: 'Rating updated successfully',
    submitting: 'Submitting...',
    ratingPoor: 'Poor',
    ratingFair: 'Fair',
    ratingGood: 'Good',
    ratingVeryGood: 'Very Good',
    ratingExcellent: 'Excellent'
  },
  hi: {
    // Navbar
    appTitle: 'ब्रोटोटाइप शिकायतें',
    submit: 'जमा करें',
    myComplaints: 'मेरी शिकायतें',
    admin: 'व्यवस्थापक',
    signOut: 'साइन आउट',
    
    // Auth Page
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    email: 'ईमेल',
    password: 'पासवर्ड',
    fullName: 'पूरा नाम',
    mobileNumber: 'मोबाइल नंबर',
    forgotPassword: 'पासवर्ड भूल गए?',
    sendResetLink: 'रीसेट लिंक भेजें',
    backToSignIn: 'साइन इन पर वापस जाएं',
    resetPassword: 'पासवर्ड रीसेट करें',
    
    // Student Portal
    welcomeTitle: 'छात्र शिकायत पोर्टल',
    welcomeSubtitle: 'अपनी शिकायतें जमा करें और उनकी स्थिति ट्रैक करें',
    submitComplaint: 'शिकायत दर्ज करें',
    complaintType: 'शिकायत का प्रकार',
    location: 'स्थान',
    selectLocation: 'अपना स्थान चुनें',
    domain: 'डोमेन',
    selectDomain: 'डोमेन चुनें',
    description: 'विवरण',
    submitButton: 'शिकायत जमा करें',
    
    // Complaint Types
    technical: 'तकनीकी',
    facility: 'सुविधा',
    academic: 'शैक्षणिक',
    administrative: 'प्रशासनिक',
    other: 'अन्य',
    
    // My Complaints
    myComplaintsTitle: 'मेरी शिकायतें',
    status: 'स्थिति',
    pending: 'लंबित',
    inProgress: 'प्रगति में',
    resolved: 'हल हो गया',
    noComplaints: 'कोई शिकायत नहीं मिली',
    
    // Admin Dashboard
    adminDashboard: 'व्यवस्थापक डैशबोर्ड',
    allComplaints: 'सभी शिकायतें',
    complaintDetails: 'शिकायत विवरण',
    updateStatus: 'स्थिति अपडेट करें',
    
    // Common
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    
    // FAQ
    faqTitle: 'सहायता केंद्र',
    faqSubtitle: 'शिकायत दर्ज करने और ट्रैक करने के बारे में सामान्य प्रश्नों के उत्तर खोजें',
    searchFaq: 'प्रश्न खोजें...',
    noFaqFound: 'आपकी खोज से मेल खाने वाला कोई प्रश्न नहीं मिला',
    stillNeedHelp: 'अभी भी मदद चाहिए?',
    contactSupport: 'यदि आपको अपने प्रश्न का उत्तर नहीं मिला, तो हमारी सहायता टीम से संपर्क करें:',
    faqs: [
      {
        question: 'मैं शिकायत कैसे दर्ज करूं?',
        answer: 'नेविगेशन मेनू में "जमा करें" बटन पर क्लिक करें, स्थान, डोमेन और विवरण सहित सभी आवश्यक विवरणों के साथ शिकायत फॉर्म भरें, फिर "शिकायत जमा करें" पर क्लिक करें।'
      },
      {
        question: 'मैं अपनी शिकायत की स्थिति कैसे ट्रैक कर सकता हूं?',
        answer: 'नेविगेशन मेनू से "मेरी शिकायतें" सेक्शन में जाएं। आप अपनी सभी प्रस्तुत शिकायतों को उनकी वर्तमान स्थिति के साथ देख पाएंगे।'
      },
      {
        question: 'विभिन्न शिकायत स्थितियां क्या हैं?',
        answer: 'लंबित: आपकी शिकायत जमा कर दी गई है और समीक्षा की प्रतीक्षा में है। प्रगति में: एक व्यवस्थापक आपकी शिकायत को हल करने पर सक्रिय रूप से काम कर रहा है। हल हो गई: आपकी शिकायत का समाधान कर दिया गया है।'
      },
      {
        question: 'शिकायत को हल होने में कितना समय लगता है?',
        answer: 'समाधान का समय मुद्दे की प्राथमिकता और जटिलता पर निर्भर करता है। उच्च प्राथमिकता वाली शिकायतों का आमतौर पर 24 घंटे के भीतर समाधान किया जाता है।'
      },
      {
        question: 'क्या मैं अपनी शिकायत में टिप्पणी जोड़ सकता हूं?',
        answer: 'हां! "मेरी शिकायतें" सेक्शन से अपनी शिकायत खोलें और टिप्पणी क्षेत्र तक स्क्रॉल करें। आप वहां अपडेट या अतिरिक्त जानकारी जोड़ सकते हैं।'
      },
      {
        question: 'मुझे अपनी शिकायत के विवरण में क्या शामिल करना चाहिए?',
        answer: 'जितना संभव हो उतना विशिष्ट रहें। शामिल करें: क्या हुआ, कब हुआ, कहां हुआ, कौन शामिल था, और कोई भी प्रासंगिक विवरण।'
      },
      {
        question: 'क्या मैं जमा करने के बाद अपनी शिकायत को संपादित या हटा सकता हूं?',
        answer: 'एक बार जमा करने के बाद, रिकॉर्ड अखंडता बनाए रखने के लिए शिकायतों को संपादित या हटाया नहीं जा सकता। हालांकि, आप अतिरिक्त जानकारी के साथ टिप्पणी जोड़ सकते हैं।'
      },
      {
        question: 'क्या मुझे अपनी शिकायत के बारे में सूचनाएं मिलेंगी?',
        answer: 'हां, जब आपकी शिकायत की स्थिति में अपडेट होगा या व्यवस्थापक टिप्पणी जोड़ेंगे तो आपको रीयल-टाइम सूचनाएं मिलेंगी।'
      },
      {
        question: 'अगर मेरा मुद्दा जरूरी है तो क्या करें?',
        answer: 'जरूरी मामलों के लिए, होम पेज पर 24/7 आपातकालीन हेल्पलाइन बटन का उपयोग करें।'
      },
      {
        question: 'मेरी शिकायत कौन देख सकता है?',
        answer: 'केवल आप और व्यवस्थापक टीम आपकी शिकायत का विवरण देख सकते हैं। आपकी जानकारी गोपनीय रखी जाती है।'
      }
    ],
    
    // Rating System
    rateResolution: 'समाधान की गुणवत्ता को रेट करें',
    rateResolutionDescription: 'समाधान से आप कितने संतुष्ट हैं, यह रेट करके हमें बेहतर बनाने में मदद करें',
    rating: 'रेटिंग',
    feedback: 'प्रतिक्रिया',
    optional: 'वैकल्पिक',
    feedbackPlaceholder: 'अपना अनुभव साझा करें (वैकल्पिक)...',
    submitRating: 'रेटिंग जमा करें',
    updateRating: 'रेटिंग अपडेट करें',
    editRating: 'रेटिंग संपादित करें',
    yourRating: 'आपकी रेटिंग',
    yourFeedback: 'आपकी प्रतिक्रिया',
    pleaseSelectRating: 'कृपया एक रेटिंग चुनें',
    ratingSubmitted: 'आपकी प्रतिक्रिया के लिए धन्यवाद!',
    ratingUpdated: 'रेटिंग सफलतापूर्वक अपडेट की गई',
    submitting: 'जमा हो रहा है...',
    ratingPoor: 'खराब',
    ratingFair: 'ठीक',
    ratingGood: 'अच्छा',
    ratingVeryGood: 'बहुत अच्छा',
    ratingExcellent: 'उत्कृष्ट'
  },
  ml: {
    // Navbar
    appTitle: 'ബ്രോടോടൈപ്പ് പരാതികൾ',
    submit: 'സമർപ്പിക്കുക',
    myComplaints: 'എന്റെ പരാതികൾ',
    admin: 'അഡ്മിൻ',
    signOut: 'സൈൻ ഔട്ട്',
    
    // Auth Page
    signIn: 'സൈൻ ഇൻ',
    signUp: 'സൈൻ അപ്പ്',
    email: 'ഇമെയിൽ',
    password: 'പാസ്‌വേഡ്',
    fullName: 'പൂർണ്ണമായ പേര്',
    mobileNumber: 'മൊബൈൽ നമ്പർ',
    forgotPassword: 'പാസ്‌വേഡ് മറന്നോ?',
    sendResetLink: 'റീസെറ്റ് ലിങ്ക് അയയ്ക്കുക',
    backToSignIn: 'സൈൻ ഇനിലേക്ക് മടങ്ങുക',
    resetPassword: 'പാസ്‌വേഡ് റീസെറ്റ് ചെയ്യുക',
    
    // Student Portal
    welcomeTitle: 'വിദ്യാർത്ഥി പരാതി പോർട്ടൽ',
    welcomeSubtitle: 'നിങ്ങളുടെ പരാതികൾ സമർപ്പിക്കുകയും അവയുടെ നില ട്രാക്ക് ചെയ്യുകയും ചെയ്യുക',
    submitComplaint: 'പരാതി സമർപ്പിക്കുക',
    complaintType: 'പരാതിയുടെ തരം',
    location: 'ലൊക്കേഷൻ',
    selectLocation: 'നിങ്ങളുടെ ലൊക്കേഷൻ തിരഞ്ഞെടുക്കുക',
    domain: 'ഡൊമെയ്ൻ',
    selectDomain: 'ഡൊമെയ്ൻ തിരഞ്ഞെടുക്കുക',
    description: 'വിവരണം',
    submitButton: 'പരാതി സമർപ്പിക്കുക',
    
    // Complaint Types
    technical: 'സാങ്കേതികം',
    facility: 'സൗകര്യം',
    academic: 'അക്കാദമിക്',
    administrative: 'അഡ്മിനിസ്ട്രേറ്റീവ്',
    other: 'മറ്റുള്ളവ',
    
    // My Complaints
    myComplaintsTitle: 'എന്റെ പരാതികൾ',
    status: 'നില',
    pending: 'തീർപ്പുകൽപ്പിക്കാത്തത്',
    inProgress: 'പുരോഗമിക്കുന്നു',
    resolved: 'പരിഹരിച്ചു',
    noComplaints: 'പരാതികളൊന്നും കണ്ടെത്തിയില്ല',
    
    // Admin Dashboard
    adminDashboard: 'അഡ്മിൻ ഡാഷ്‌ബോർഡ്',
    allComplaints: 'എല്ലാ പരാതികളും',
    complaintDetails: 'പരാതി വിശദാംശങ്ങൾ',
    updateStatus: 'നില അപ്ഡേറ്റ് ചെയ്യുക',
    
    // Common
    loading: 'ലോഡ് ചെയ്യുന്നു...',
    error: 'പിശക്',
    success: 'വിജയം',
    cancel: 'റദ്ദാക്കുക',
    save: 'സേവ് ചെയ്യുക',
    
    // FAQ
    faqTitle: 'സഹായ കേന്ദ്രം',
    faqSubtitle: 'പരാതി ഫയൽ ചെയ്യുന്നതും ട്രാക്ക് ചെയ്യുന്നതും സംബന്ധിച്ച സാധാരണ ചോദ്യങ്ങൾക്ക് ഉത്തരങ്ങൾ കണ്ടെത്തുക',
    searchFaq: 'ചോദ്യങ്ങൾക്കായി തിരയുക...',
    noFaqFound: 'നിങ്ങളുടെ തിരയലുമായി പൊരുത്തപ്പെടുന്ന ചോദ്യങ്ങളൊന്നും കണ്ടെത്തിയില്ല',
    stillNeedHelp: 'ഇനിയും സഹായം വേണോ?',
    contactSupport: 'നിങ്ങളുടെ ചോദ്യത്തിന് ഉത്തരം കണ്ടെത്താൻ കഴിഞ്ഞില്ലെങ്കിൽ, ഞങ്ങളുടെ സപ്പോർട്ട് ടീമിനെ ബന്ധപ്പെടുക:',
    faqs: [
      {
        question: 'ഞാൻ എങ്ങനെ ഒരു പരാതി സമർപ്പിക്കും?',
        answer: 'നാവിഗേഷൻ മെനുവിലെ "സമർപ്പിക്കുക" ബട്ടണിൽ ക്ലിക്ക് ചെയ്യുക, സ്ഥലം, ഡൊമെയ്ൻ, വിവരണം എന്നിവ ഉൾപ്പെടെ ആവശ്യമായ എല്ലാ വിശദാംശങ്ങളും നൽകി പരാതി ഫോറം പൂരിപ്പിക്കുക, തുടർന്ന് "പരാതി സമർപ്പിക്കുക" എന്നതിൽ ക്ലിക്ക് ചെയ്യുക.'
      },
      {
        question: 'എനിക്ക് എന്റെ പരാതി സ്റ്റാറ്റസ് എങ്ങനെ ട്രാക്ക് ചെയ്യാം?',
        answer: 'നാവിഗേഷൻ മെനുവിൽ നിന്ന് "എന്റെ പരാതികൾ" വിഭാഗത്തിലേക്ക് പോകുക. നിങ്ങൾ സമർപ്പിച്ച എല്ലാ പരാതികളും അവയുടെ നിലവിലെ സ്റ്റാറ്റസിനൊപ്പം കാണാൻ കഴിയും.'
      },
      {
        question: 'വ്യത്യസ്ത പരാതി സ്റ്റാറ്റസുകൾ എന്തൊക്കെയാണ്?',
        answer: 'പെൻഡിംഗ്: നിങ്ങളുടെ പരാതി സമർപ്പിച്ചു, അവലോകനം ചെയ്യാൻ കാത്തിരിക്കുകയാണ്. പുരോഗതിയിൽ: ഒരു അഡ്‌മിൻ നിങ്ങളുടെ പരാതി പരിഹരിക്കാൻ സജീവമായി പ്രവർത്തിക്കുന്നു. പരിഹരിച്ചു: നിങ്ങളുടെ പരാതി പരിഹരിച്ചു.'
      },
      {
        question: 'ഒരു പരാതി പരിഹരിക്കാൻ എത്ര സമയമെടുക്കും?',
        answer: 'പ്രശ്നത്തിന്റെ മുൻഗണനയും സങ്കീർണ്ണതയും അനുസരിച്ച് പരിഹാര സമയം വ്യത്യാസപ്പെടുന്നു. ഉയർന്ന മുൻഗണനയുള്ള പരാതികൾ സാധാരണയായി 24 മണിക്കൂറിനുള്ളിൽ പരിഹരിക്കപ്പെടുന്നു.'
      },
      {
        question: 'എനിക്ക് എന്റെ പരാതിയിൽ കമന്റുകൾ ചേർക്കാൻ കഴിയുമോ?',
        answer: 'അതെ! "എന്റെ പരാതികൾ" വിഭാഗത്തിൽ നിന്ന് നിങ്ങളുടെ പരാതി തുറന്ന് കമന്റ് ഏരിയയിലേക്ക് സ്ക്രോൾ ചെയ്യുക. അവിടെ നിങ്ങൾക്ക് അപ്‌ഡേറ്റുകളോ അധിക വിവരങ്ങളോ ചേർക്കാം.'
      },
      {
        question: 'എന്റെ പരാതി വിവരണത്തിൽ എന്തൊക്കെ ഉൾപ്പെടുത്തണം?',
        answer: 'കഴിയുന്നത്ര വിശദമായി ആയിരിക്കുക. ഉൾപ്പെടുത്തുക: എന്താണ് സംഭവിച്ചത്, എപ്പോൾ സംഭവിച്ചു, എവിടെ സംഭവിച്ചു, ആരൊക്കെ ഉൾപ്പെട്ടിരുന്നു, പ്രസക്തമായ എല്ലാ വിശദാംശങ്ങളും.'
      },
      {
        question: 'സമർപ്പിച്ചതിന് ശേഷം എനിക്ക് എന്റെ പരാതി എഡിറ്റ് ചെയ്യാനോ ഇല്ലാതാക്കാനോ കഴിയുമോ?',
        answer: 'ഒരിക്കൽ സമർപ്പിച്ചാൽ, റെക്കോർഡ് സമഗ്രത നിലനിർത്താൻ പരാതികൾ എഡിറ്റ് ചെയ്യാനോ ഇല്ലാതാക്കാനോ കഴിയില്ല. എന്നിരുന്നാലും, അധിക വിവരങ്ങൾക്കൊപ്പം കമന്റുകൾ ചേർക്കാം.'
      },
      {
        question: 'എന്റെ പരാതിയെക്കുറിച്ച് എനിക്ക് അറിയിപ്പുകൾ ലഭിക്കുമോ?',
        answer: 'അതെ, നിങ്ങളുടെ പരാതി സ്റ്റാറ്റസിൽ അപ്‌ഡേറ്റുകൾ ഉണ്ടാകുമ്പോഴോ അഡ്‌മിൻസ് കമന്റുകൾ ചേർക്കുമ്പോഴോ നിങ്ങൾക്ക് തത്സമയ അറിയിപ്പുകൾ ലഭിക്കും.'
      },
      {
        question: 'എന്റെ പ്രശ്നം അടിയന്തിരമാണെങ്കിൽ എന്തുചെയ്യും?',
        answer: 'അടിയന്തിര കാര്യങ്ങൾക്ക്, ഹോം പേജിലെ 24/7 എമർജൻസി ഹെൽപ്പ്‌ലൈൻ ബട്ടൺ ഉപയോഗിക്കുക.'
      },
      {
        question: 'എന്റെ പരാതി ആർക്കൊക്കെ കാണാൻ കഴിയും?',
        answer: 'നിങ്ങൾക്കും അഡ്‌മിൻ ടീമിനും മാത്രമേ നിങ്ങളുടെ പരാതി വിശദാംശങ്ങൾ കാണാൻ കഴിയൂ. നിങ്ങളുടെ വിവരങ്ങൾ രഹസ്യമായി സൂക്ഷിക്കുന്നു.'
      }
    ],
    
    // Rating System
    rateResolution: 'പരിഹാര നിലവാരം റേറ്റ് ചെയ്യുക',
    rateResolutionDescription: 'പരിഹാരത്തിൽ നിങ്ങൾ എത്രമാത്രം സംതൃപ്തരാണെന്ന് റേറ്റ് ചെയ്ത് ഞങ്ങളെ മെച്ചപ്പെടുത്താൻ സഹായിക്കുക',
    rating: 'റേറ്റിംഗ്',
    feedback: 'ഫീഡ്‌ബാക്ക്',
    optional: 'ഓപ്ഷണൽ',
    feedbackPlaceholder: 'നിങ്ങളുടെ അനുഭവം പങ്കിടുക (ഓപ്ഷണൽ)...',
    submitRating: 'റേറ്റിംഗ് സമർപ്പിക്കുക',
    updateRating: 'റേറ്റിംഗ് അപ്‌ഡേറ്റ് ചെയ്യുക',
    editRating: 'റേറ്റിംഗ് എഡിറ്റ് ചെയ്യുക',
    yourRating: 'നിങ്ങളുടെ റേറ്റിംഗ്',
    yourFeedback: 'നിങ്ങളുടെ ഫീഡ്‌ബാക്ക്',
    pleaseSelectRating: 'ദയവായി ഒരു റേറ്റിംഗ് തിരഞ്ഞെടുക്കുക',
    ratingSubmitted: 'നിങ്ങളുടെ ഫീഡ്‌ബാക്കിന് നന്ദി!',
    ratingUpdated: 'റേറ്റിംഗ് വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു',
    submitting: 'സമർപ്പിക്കുന്നു...',
    ratingPoor: 'മോശം',
    ratingFair: 'സാധാരണം',
    ratingGood: 'നല്ലത്',
    ratingVeryGood: 'വളരെ നല്ലത്',
    ratingExcellent: 'മികച്ചത്'
  },
  ta: {
    // Navbar
    appTitle: 'ப்ரோடோடைப் புகார்கள்',
    submit: 'சமர்ப்பிக்கவும்',
    myComplaints: 'எனது புகார்கள்',
    admin: 'நிர்வாகி',
    signOut: 'வெளியேறு',
    
    // Auth Page
    signIn: 'உள்நுழைக',
    signUp: 'பதிவு செய்க',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    fullName: 'முழு பெயர்',
    mobileNumber: 'கைபேசி எண்',
    forgotPassword: 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?',
    sendResetLink: 'மீட்டமை இணைப்பை அனுப்பு',
    backToSignIn: 'உள்நுழைவுக்குத் திரும்பு',
    resetPassword: 'கடவுச்சொல்லை மீட்டமை',
    
    // Student Portal
    welcomeTitle: 'மாணவர் புகார் போர்டல்',
    welcomeSubtitle: 'உங்கள் புகார்களைச் சமர்ப்பித்து அவற்றின் நிலையைக் கண்காணிக்கவும்',
    submitComplaint: 'புகார் சமர்ப்பிக்கவும்',
    complaintType: 'புகார் வகை',
    location: 'இடம்',
    selectLocation: 'உங்கள் இடத்தைத் தேர்ந்தெடுக்கவும்',
    domain: 'டொமைன்',
    selectDomain: 'டொமைனைத் தேர்ந்தெடுக்கவும்',
    description: 'விளக்கம்',
    submitButton: 'புகாரைச் சமர்ப்பிக்கவும்',
    
    // Complaint Types
    technical: 'தொழில்நுட்பம்',
    facility: 'வசதி',
    academic: 'கல்வி',
    administrative: 'நிர்வாக',
    other: 'மற்றவை',
    
    // My Complaints
    myComplaintsTitle: 'எனது புகார்கள்',
    status: 'நிலை',
    pending: 'நிலுவையில்',
    inProgress: 'முன்னேற்றத்தில்',
    resolved: 'தீர்க்கப்பட்டது',
    noComplaints: 'புகார்கள் இல்லை',
    
    // Admin Dashboard
    adminDashboard: 'நிர்வாக டாஷ்போர்டு',
    allComplaints: 'அனைத்து புகார்கள்',
    complaintDetails: 'புகார் விவரங்கள்',
    updateStatus: 'நிலையை புதுப்பிக்கவும்',
    
    // Common
    loading: 'ஏற்றுகிறது...',
    error: 'பிழை',
    success: 'வெற்றி',
    cancel: 'ரத்துசெய்',
    save: 'சேமி',
    
    // FAQ
    faqTitle: 'உதவி மையம்',
    faqSubtitle: 'புகார்களை தாக்கல் செய்தல் மற்றும் கண்காணிப்பு பற்றிய பொதுவான கேள்விகளுக்கான பதில்களைக் கண்டறியவும்',
    searchFaq: 'கேள்விகளுக்காக தேடுங்கள்...',
    noFaqFound: 'உங்கள் தேடலுக்குப் பொருந்தும் கேள்விகள் எதுவும் கிடைக்கவில்லை',
    stillNeedHelp: 'இன்னும் உதவி தேவையா?',
    contactSupport: 'உங்கள் கேள்விக்கான பதிலைக் கண்டுபிடிக்க முடியவில்லை என்றால், எங்கள் ஆதரவு குழுவைத் தொடர்பு கொள்ளுங்கள்:',
    faqs: [
      {
        question: 'நான் எப்படி புகார் சமர்ப்பிப்பது?',
        answer: 'வழிசெலுத்தல் மெனுவில் "சமர்ப்பிக்கவும்" பொத்தானைக் கிளிக் செய்யவும், இடம், டொமைன் மற்றும் விளக்கம் உட்பட அனைத்து தேவையான விவரங்களுடன் புகார் படிவத்தை நிரப்பவும், பின்னர் "புகார் சமர்ப்பிக்கவும்" என்பதைக் கிளிக் செய்யவும்.'
      },
      {
        question: 'எனது புகார் நிலையை எவ்வாறு கண்காணிக்க முடியும்?',
        answer: 'வழிசெலுத்தல் மெனுவில் இருந்து "எனது புகார்கள்" பிரிவுக்குச் செல்லவும். நீங்கள் சமர்ப்பித்த அனைத்து புகார்களையும் அவற்றின் தற்போதைய நிலையுடன் காண்பீர்கள்.'
      },
      {
        question: 'வெவ்வேறு புகார் நிலைகள் என்ன?',
        answer: 'நிலுவையில்: உங்கள் புகார் சமர்ப்பிக்கப்பட்டு மதிப்பாய்வு செய்யப்படுவதற்காக காத்திருக்கிறது. முன்னேற்றத்தில்: ஒரு நிர்வாகி உங்கள் புகாரைத் தீர்க்க தீவிரமாக வேலை செய்கிறார். தீர்க்கப்பட்டது: உங்கள் புகார் தீர்க்கப்பட்டது.'
      },
      {
        question: 'ஒரு புகாரை தீர்க்க எவ்வளவு நேரம் ஆகும்?',
        answer: 'தீர்வு நேரம் பிரச்சினையின் முன்னுரிமை மற்றும் சிக்கலானது சார்ந்தது. உயர் முன்னுரிமை புகார்கள் பொதுவாக 24 மணி நேரத்திற்குள் தீர்க்கப்படும்.'
      },
      {
        question: 'எனது புகாரில் கருத்துகளை சேர்க்க முடியுமா?',
        answer: 'ஆம்! "எனது புகார்கள்" பிரிவில் இருந்து உங்கள் புகாரைத் திறந்து கருத்துப் பகுதிக்கு ஸ்க்ரோல் செய்யவும். அங்கே புதுப்பிப்புகள் அல்லது கூடுதல் தகவல்களைச் சேர்க்கலாம்.'
      },
      {
        question: 'எனது புகார் விளக்கத்தில் என்ன சேர்க்க வேண்டும்?',
        answer: 'முடிந்தவரை குறிப்பிட்டதாக இருங்கள். சேர்க்கவும்: என்ன நடந்தது, எப்போது நடந்தது, எங்கே நடந்தது, யார் சம்பந்தப்பட்டார், மற்றும் தொடர்புடைய அனைத்து விவரங்களும்.'
      },
      {
        question: 'சமர்ப்பித்த பிறகு எனது புகாரை திருத்த அல்லது நீக்க முடியுமா?',
        answer: 'ஒருமுறை சமர்ப்பித்தவுடன், பதிவு ஒருமைப்பாட்டை பராமரிக்க புகார்களை திருத்த அல்லது நீக்க முடியாது. இருப்பினும், கூடுதல் தகவலுடன் கருத்துகளைச் சேர்க்கலாம்.'
      },
      {
        question: 'எனது புகார் பற்றி எனக்கு அறிவிப்புகள் கிடைக்குமா?',
        answer: 'ஆம், உங்கள் புகார் நிலையில் புதுப்பிப்புகள் இருக்கும்போது அல்லது நிர்வாகிகள் கருத்துகளைச் சேர்க்கும்போது உங்களுக்கு நேரடி அறிவிப்புகள் கிடைக்கும்.'
      },
      {
        question: 'எனது பிரச்சினை அவசரமானது என்றால் என்ன செய்வது?',
        answer: 'அவசர விஷயங்களுக்கு, முகப்புப் பக்கத்தில் 24/7 அவசர உதவி எண் பொத்தானைப் பயன்படுத்தவும்.'
      },
      {
        question: 'எனது புகாரை யார் பார்க்க முடியும்?',
        answer: 'நீங்களும் நிர்வாகக் குழுவும் மட்டுமே உங்கள் புகார் விவரங்களைப் பார்க்க முடியும். உங்கள் தகவல் ரகசியமாக வைக்கப்படுகிறது.'
      }
    ],
    
    // Rating System
    rateResolution: 'தீர்வு தரத்தை மதிப்பிடுங்கள்',
    rateResolutionDescription: 'தீர்வில் நீங்கள் எவ்வளவு திருப்தியடைந்தீர்கள் என்பதை மதிப்பிட்டு எங்களை மேம்படுத்த உதவுங்கள்',
    rating: 'மதிப்பீடு',
    feedback: 'கருத்து',
    optional: 'விருப்பமானது',
    feedbackPlaceholder: 'உங்கள் அனுபவத்தைப் பகிரவும் (விருப்பமானது)...',
    submitRating: 'மதிப்பீடு சமர்ப்பிக்கவும்',
    updateRating: 'மதிப்பீட்டை புதுப்பிக்கவும்',
    editRating: 'மதிப்பீட்டை திருத்தவும்',
    yourRating: 'உங்கள் மதிப்பீடு',
    yourFeedback: 'உங்கள் கருத்து',
    pleaseSelectRating: 'தயவுசெய்து ஒரு மதிப்பீட்டைத் தேர்ந்தெடுக்கவும்',
    ratingSubmitted: 'உங்கள் கருத்துக்கு நன்றி!',
    ratingUpdated: 'மதிப்பீடு வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
    submitting: 'சமர்ப்பிக்கிறது...',
    ratingPoor: 'மோசமானது',
    ratingFair: 'நியாயமானது',
    ratingGood: 'நல்லது',
    ratingVeryGood: 'மிகவும் நல்லது',
    ratingExcellent: 'சிறந்தது'
  },
};
