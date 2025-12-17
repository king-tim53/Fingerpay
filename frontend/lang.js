// ==========================================
// FINGERPAY LANGUAGE SYSTEM
// ==========================================

// 1. THE DICTIONARY (Translations)
const translations = {
    'en': {
        'tab_login': 'Login',
        'tab_register': 'Register',
        'label_email': 'Email Address',
        'label_password': 'Password',
        'remember_me': 'Remember me',
        'forgot_pass': 'Forgot Password?',
        'btn_login_secure': 'Login Securely',
        'btn_bio': 'Tap to Login',
        'label_fullname': 'Full Name',
        'label_phone': 'Phone Number',
        'label_create_pass': 'Create Password',
        'strength_text': 'Password strength',
        'label_otp': 'One-Time Password',
        'btn_get_code': 'Get Code',
        'btn_create_acct': 'Create Account',
        'authenticating': 'Authenticating...',
        'success_title': 'Success',
        'btn_continue': 'Continue to Dashboard',
        'load_msg': 'Translating to English...'
    },
    'pidgin': {
        'tab_login': 'Enter',
        'tab_register': 'Join Us',
        'label_email': 'Your Email',
        'label_password': 'Password',
        'remember_me': 'Remember me na',
        'forgot_pass': 'You forget password?',
        'btn_login_secure': 'Enter Inside',
        'btn_bio': 'Touch am to Enter',
        'label_fullname': 'Your Full Name',
        'label_phone': 'Phone Number',
        'label_create_pass': 'Put Password',
        'strength_text': 'How the password strong reach',
        'label_otp': 'Wait make we send code',
        'btn_get_code': 'Gimme Code',
        'btn_create_acct': 'Open Account',
        'authenticating': 'We dey check am...',
        'success_title': 'O don set!',
        'btn_continue': 'Go Dashboard',
        'load_msg': 'We dey change am to Pidgin...'
    },
    'yoruba': {
        'tab_login': 'Wọle',
        'tab_register': 'Forukọsilẹ',
        'label_email': 'Adirẹsi Imeeli',
        'label_password': 'Ọrọ iwọle',
        'remember_me': 'Ranti mi',
        'forgot_pass': 'Gbagbe ọrọ iwọle?',
        'btn_login_secure': 'Wọle ni Ailewu',
        'btn_bio': 'Fọwọ kan lati Wọle',
        'label_fullname': 'Orukọ Kikun',
        'label_phone': 'Nọmba Foonu',
        'label_create_pass': 'Ṣẹda Ọrọ iwọle',
        'strength_text': 'Agbara Ọrọ iwọle',
        'label_otp': 'Koodu Igba Kan',
        'btn_get_code': 'Gba Koodu',
        'btn_create_acct': 'Ṣii Akọọlẹ',
        'authenticating': 'N jẹrisi...',
        'success_title': 'Aṣeyọri',
        'btn_continue': 'Tẹsiwaju',
        'load_msg': 'N yipada si Yorùbá...'
    },
    'igbo': {
        'tab_login': 'Banye',
        'tab_register': 'Debanye aha',
        'label_email': 'Adreesị ozi-e',
        'label_password': 'Okwuntughe',
        'remember_me': 'Cheta m',
        'forgot_pass': 'Echefuru okwuntughe?',
        'btn_login_secure': 'Banye nke ọma',
        'btn_bio': 'Pịa ka ị banye',
        'label_fullname': 'Aha zuru ezu',
        'label_phone': 'Nọmba ekwentị',
        'label_create_pass': 'Mepụta Okwuntughe',
        'strength_text': 'Ike okwuntughe',
        'label_otp': 'Koodu Oge',
        'btn_get_code': 'Nweta Koodu',
        'btn_create_acct': 'Mepụta Akaụntụ',
        'authenticating': 'Na-enyocha...',
        'success_title': 'Ọ gara nke ọma',
        'btn_continue': 'Gaa n\'ihu',
        'load_msg': 'Na-atụgharị gaa n\'asụsụ Igbo...'
    },
    'hausa': {
        'tab_login': 'Shiga',
        'tab_register': 'Yi Rijista',
        'label_email': 'Adireshin Imel',
        'label_password': 'Kalmar sirri',
        'remember_me': 'Tuna da ni',
        'forgot_pass': 'Manta kalmar sirri?',
        'btn_login_secure': 'Shiga Lafiya',
        'btn_bio': 'Taɓa don Shiga',
        'label_fullname': 'Cikakken Suna',
        'label_phone': 'Lambar Waya',
        'label_create_pass': 'Ƙirƙiri Kalmar Sirri',
        'strength_text': 'Karfin kalmar sirri',
        'label_otp': 'Lambar Sirri',
        'btn_get_code': 'Samu Lamba',
        'btn_create_acct': 'Bude Asusun',
        'authenticating': 'Ana tantancewa...',
        'success_title': 'Nasara',
        'btn_continue': 'Ci gaba',
        'load_msg': 'Ana fassara zuwa Hausa...'
    }
};

// 2. THE FUNCTION TO CHANGE LANGUAGE
function setLanguage(lang, langName) {
    // A. Show the Loader Screen
    const loader = document.getElementById('langLoader');
    const loadingText = document.getElementById('loadingText');
    
    // Set the specific loading message (e.g., "We dey change am to Pidgin...")
    loadingText.innerText = translations[lang]['load_msg'];
    
    loader.classList.remove('d-none');
    loader.classList.add('d-flex');

    // B. Wait 1.5 seconds to fake the "Processing" time
    setTimeout(() => {
        // C. Find all elements with 'data-i18n' and swap text
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang][key]) {
                // If text is inside an input placeholder (like Email input)
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    // Note: Floating labels usually use <label>, not placeholder, 
                    // but we keep this just in case.
                } else {
                    // Regular text (Buttons, Labels, Headers)
                    element.innerText = translations[lang][key];
                }
            }
        });

        // D. Update the Dropdown Button Text
        document.getElementById('currentLang').innerText = langName;

        // E. Hide Loader
        loader.classList.remove('d-flex');
        loader.classList.add('d-none');

    }, 1500); // 1.5 seconds delay
}