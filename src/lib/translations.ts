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
    cancel: 'ரத்து செய்',
    save: 'சேமி',
  },
};
