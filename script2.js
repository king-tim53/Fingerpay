document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. MOBILE NAVIGATION TOGGLE
    // ==========================================
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('#primary-nav');
    const icon = navToggle.querySelector('i');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            
            // Toggle Icon between Menu and Close
            if (navMenu.classList.contains('open')) {
                icon.classList.remove('bi-list');
                icon.classList.add('bi-x-lg');
            } else {
                icon.classList.remove('bi-x-lg');
                icon.classList.add('bi-list');
            }
        });
    }

    // Close menu when clicking a link (mobile UX)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            icon.classList.remove('bi-x-lg');
            icon.classList.add('bi-list');
        });
    });

    // ==========================================
    // 2. STICKY HEADER ON SCROLL
    // ==========================================
    const header = document.querySelector('.site-header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // ==========================================
    // 3. FEATURE SPOTLIGHT TABS (Panic Pinky, Vault, etc.)
    // ==========================================
    const featureTabs = document.querySelectorAll('.feature-tab');
    const featurePanes = document.querySelectorAll('.feature-pane');

    featureTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 1. Remove active state from all tabs
            featureTabs.forEach(t => t.classList.remove('active'));
            
            // 2. Add active state to clicked tab
            tab.classList.add('active');

            // 3. Hide all content panes
            featurePanes.forEach(pane => {
                pane.classList.remove('active');
                pane.classList.add('d-none');
            });

            // 4. Show the target pane
            const targetId = tab.getAttribute('data-target');
            const targetPane = document.querySelector(targetId);
            
            if (targetPane) {
                targetPane.classList.remove('d-none');
                // Small timeout to allow CSS transition to catch the display change
                setTimeout(() => {
                    targetPane.classList.add('active');
                }, 50);
            }
        });
    });

    // ==========================================
    // 4. SCROLL REVEAL ANIMATIONS
    // ==========================================
    // Adds a 'show' class to elements when they scroll into view
    
    const observerOptions = {
        threshold: 0.15 // Trigger when 15% of element is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply to Step Cards and Testimonials
    const animatedElements = document.querySelectorAll('.step-card, .hero-text, .section h2');
    
    animatedElements.forEach(el => {
        // Set initial state via JS to ensure graceful degradation if JS fails
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s ease-out';
        observer.observe(el);
    });

    // ==========================================
    // AGENT FINDER SEARCH LOGIC
    // ==========================================
    const agentSearch = document.getElementById('agentSearch');
    const agentItems = document.querySelectorAll('.agent-item');
    const noAgentsMsg = document.getElementById('noAgentsFound');

    if (agentSearch) {
        agentSearch.addEventListener('keyup', (e) => {
            const term = e.target.value.toLowerCase();
            let hasResult = false;

            agentItems.forEach(item => {
                const text = item.innerText.toLowerCase();
                if (text.includes(term)) {
                    item.classList.remove('d-none');
                    item.classList.add('d-block');
                    hasResult = true;
                } else {
                    item.classList.add('d-none');
                    item.classList.remove('d-block');
                }
            });

            if (hasResult) {
                noAgentsMsg.classList.add('d-none');
            } else {
                noAgentsMsg.classList.remove('d-none');
            }
        });
    }

    // ==========================================
    // 5. SMOOTH SCROLLING FOR ANCHOR LINKS
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Calculate header offset
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

});
// ==========================================
// AI DEMO SIMULATION
// ==========================================

const aiScenarios = {
    'credit': [
        "> Initializing Credit AI Core...",
        "> Fetching Merchant Transaction History (ID: MER-882)...",
        "> Analyzing 450 transactions...",
        "> Detecting Biometric Consistency: 99.8% (Verified)",
        "> Calculating Risk Score...",
        "> SUCCESS: Score 785/900 generated.",
        "> ACTION: Pre-approving Loan Offer: N200,000.",
        "> Status: Ready for Disbursement."
    ],
    'agent': [
        "> Booting FinAgent Operations...",
        "> Locating Field Agent (GPS: Yaba, Lagos)...",
        "> Analyzing Route Traffic...",
        "> OPTIMIZATION: Visit Merchant A -> Merchant B -> Merchant C.",
        "> Detecting Language Preference: Pidgin English.",
        "> TRANSLATING PITCH: 'Oga, use FingerPay make sales easy.'",
        "> Ready for deployment."
    ],
    'coach': [
        "> Connecting to FinCoach...",
        "> Analyzing Spending Habits...",
        "> ALERT: Transport Budget Exceeded by 15%.",
        "> Scanning Savings Opportunities...",
        "> SUGGESTION: Move N5,000 from 'Entertainment' to 'Transport'.",
        "> TRANSLATION (Yoruba): A ti ṣatunṣe isuna rẹ.",
        "> Awaiting User Confirmation..."
    ]
};

function openAiDemo(type) {
    const modal = new bootstrap.Modal(document.getElementById('aiDemoModal'));
    const output = document.getElementById('terminalOutput');
    const title = document.getElementById('terminalTitle');
    
    // Clear previous text
    output.innerHTML = "";
    
    // Set Title
    if(type === 'credit') title.textContent = "root@credit-ai:~#";
    if(type === 'agent') title.textContent = "root@fin-agent:~#";
    if(type === 'coach') title.textContent = "root@fin-coach:~#";

    modal.show();

    // Start Typing Simulation
    const lines = aiScenarios[type];
    let i = 0;

    function typeLine() {
        if (i < lines.length) {
            const line = document.createElement('div');
            line.className = "mb-1";
            line.textContent = lines[i];
            output.appendChild(line);
            
            // Randomize typing speed for realism
            const speed = Math.floor(Math.random() * 500) + 300;
            i++;
            setTimeout(typeLine, speed);
        }
    }
    
    // Start after modal animation
    setTimeout(typeLine, 500);
}