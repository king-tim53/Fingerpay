🖐️ FingerPay: Biometric AI Financial System
"Your Finger is Your Password."
FingerPay is a revolutionary cardless and phoneless payment infrastructure built for the Nigerian financial landscape. By combining 10-finger biometric enrollment with generative AI, it ensures that financial services are secure, inclusive, and intelligent.
👥 The Edu Matrix Team
•	Mr. Timofe Segun-ojo: Project Manager & Lead Front-End Developer.
•	Mr. Aladetan Fortune: Backend Developer, AI Architect, and Security Infrastructure.
Technology Stack:
•	AI Engine: Gemini Developer AI Studio (Generative AI Integration).
•	Frontend: Bootstrap 5.3, Outfit & Plus Jakarta Sans Typography, FontAwesome.
•	Architecture: Multi-tenant (Customer, Agent, Merchant) with context-aware JS logic.

📂 Project Architecture
Component	Files	AI System	Primary Purpose
Landing Hub	index2.html, log.html	N/A	Market presence and secure gateway.
Customer	pack.html, pack.js	FinCoach AI	Personal budgeting & Biometric Vaults.
Merchant	merchantDB.html, merchant.js	Credit AI	Business loans & Inventory growth.
Agent	agDB.html, agentDB.js	FinAgent AI	Field enrollment & Liquidity forecasting.
________________________________________
📖 Detailed User Manual & Feature Guide
1. Customer User Manual (pack.html)
Primary Feature: FinCoach AI & The FingerVault
•	Step 1: Universal Onboarding: Visit a FingerPay Agent. You must register all 10 fingers. Your Finger ID (FID) is generated here.
•	Step 2: Account Mapping: Open your dashboard. In the "Ledger" section, link your fingers to specific banks (e.g., Right Index = GTBank, Left Index = Opay).
•	Step 3: Using the FingerVault:
1.	Navigate to "Vault" in your dashboard.
2.	Transfer funds from your "Spending Balance" to the Vault.
3.	To Withdraw: Click "Withdraw" and scan your Ring Finger. This is a hardware-enforced lock; no other finger can release these funds.
•	Step 4: Panic Pinky Activation:
1.	Go to Security Settings.
2.	Ensure "Panic Mode" is linked to your Left Pinky.
3.	In Danger: If forced to pay at a terminal, use your Left Pinky. The terminal will show "Success," but your money is safe, and a silent GPS alert is sent to security.
2. Merchant User Manual (merchantDB.html)
Primary Feature: Credit AI & Business Simulation
•	Step 1: Point-of-Sale (POS) Setup: Link your merchant ID to the physical FingerPay scanner.
•	Step 2: Accepting Payments: When a customer buys goods, they place their finger on your scanner. The system instantly identifies their bank and processes the payment in 2.5 seconds.
•	Step 3: Credit AI Loan Application:
1.	Click on "Merchant AI Hub."
2.	Select "Check Loan Eligibility."
3.	The Credit AI reads your sales data for the last 30 days and generates a "What-If" simulation (e.g., "If you stock 20% more, your credit limit increases by N50k").
•	Step 4: Staff Management: Add employees in the "Staff Manager." You can set individual withdrawal limits for each staff member's fingerprint.
3. Agent User Manual (agDB.html)
Primary Feature: FinAgent AI & Enrollment Station
•	Step 1: New Registration:
1.	Open the "Registration" tab.
2.	Capture high-resolution scans of all 10 customer fingers.
3.	The system uses Gemini AI Studio logic to verify that the prints aren't duplicates (preventing fraud).
•	Step 2: Liquidity Management:
1.	Monitor the "Cash-Out Predictor" on your dashboard.
2.	If the AI shows a "High Demand" alert (red), move to a high-traffic area like a local market to maximize commissions.
•	Step 3: Educational Outreach: Use the "Jargon Buster" feature to explain loan terms to customers in their local language (Pidgin, Yoruba, Igbo, or Hausa).

🤖 AI Logic & Functionality (Gemini Integration)
The Edu Matrix Team has designed the AI to be "Context-Aware." This means the JavaScript doesn't just display static text; it "reads" the page content.
•	FinCoach Logic: It monitors the balanceValue in pack.js. If spending exceeds 70% of the monthly average, the AI triggers a "Budget Alert" toast notification.
•	Credit AI Logic: In merchantDB.js, the AI calculates the ratio of "Successful Sales" to "Refunds" to determine a Merchant's creditworthiness.
•	FinAgent Logic: It uses real-time registration counts to update the "Agent Level" (AG-LV2 to AG-LV3), which dynamically changes the commission payout percentage in the backend.

🛡️ Security Architecture
Designed by Mr. Aladetan Fortune, the system follows a "Zero-Trust" biometric model:
1.	SHA-256 Hashing: Biometric templates are never stored as images; they are converted into irreversible mathematical hashes.
2.	Multi-Finger Logic: Access is tiered. The Index finger is for small payments; the Ring finger is for large savings; the Pinky is for emergencies.
3.	End-to-End Encryption: Data moving from the Agent's scanner to the Merchant's dashboard is encrypted using bank-grade protocols.

🛠️ Installation for Developers
1.	Clone the Repo: Ensure all HTML, CSS, and JS files remain in their respective branch folders.
2.	Link the AI: Replace the simulated response functions in pack.js, merchantDB.js, and agentDB.js with your Gemini API Key from AI Studio.
3.	Dependencies: Ensure Bootstrap 5.3 and Chart.js are loaded via CDN (included in the headers).

FingerPay — Redefining the future of Nigerian Fintech through the power of Biometrics and AI. © 2024 Edu Matrix Team

