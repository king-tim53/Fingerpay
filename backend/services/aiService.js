/**
 * FingerPay AI Service
 * Core AI functionality using Google Gemini API
 * Handles FinCoach, Credit AI, and FinAgent features
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        
        if (!this.apiKey) {
            console.warn('⚠️ GEMINI_API_KEY not found in environment variables. AI features will use mock responses.');
            this.useMock = true;
        } else {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({
              model: "gemini-2.5-flash",
            });
            this.useMock = false;
        }
    }

    /**
     * Generic method to call Gemini API
     */
    async generateContent(prompt, systemContext = '') {
        if (this.useMock) {
            return this.getMockResponse(prompt);
        }

        try {
            const fullPrompt = systemContext ? `${systemContext}\n\n${prompt}` : prompt;
            
            const result = await this.model.generateContent(fullPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error('AI service temporarily unavailable');
        }
    }

    /**
     * Mock responses for testing without API key
     */
    getMockResponse(prompt) {
        if (prompt.includes('budget') || prompt.includes('spending')) {
            return 'Based on your spending patterns, I recommend reducing entertainment expenses by 15% and allocating more to savings. Your current spending trend shows you might exceed your budget by ₦12,000 this month.';
        } else if (prompt.includes('loan') || prompt.includes('credit') || prompt.includes('eligibility')) {
            return 'Your business shows strong growth potential. Based on your sales data, you qualify for a loan of up to ₦150,000. A 20% stock increase could boost your monthly revenue by ₦45,000.';
        } else if (prompt.includes('liquidity') || prompt.includes('agent') || prompt.includes('demand')) {
            return 'Current liquidity prediction: HIGH DEMAND expected in your area between 2 PM - 6 PM today. Consider positioning near markets or transportation hubs to maximize commissions.';
        } else if (prompt.includes('jargon') || prompt.includes('explain')) {
            return 'This term means managing your money wisely to achieve your financial goals.';
        } else {
            return 'I\'m here to help with financial insights and recommendations.';
        }
    }

    // ==================== FINCOACH AI (CUSTOMER) ====================
    
    /**
     * Analyze customer spending and provide budget recommendations
     */
    async analyzeBudget(customerData) {
        const { balance, spending, income, monthlyAverage } = customerData;
        
        const systemContext = `You are FinCoach AI, a personal financial advisor for Nigerian users. 
Provide practical, culturally relevant advice in simple English. Use Naira (₦) for currency.
Be encouraging but honest about financial habits.`;

        const prompt = `Analyze this customer's financial situation:
- Current Balance: ₦${balance.toLocaleString()}
- Monthly Income: ₦${income.toLocaleString()}
- This Month's Spending: ₦${spending.toLocaleString()}
- Monthly Average Spending: ₦${monthlyAverage.toLocaleString()}
- Spending vs Income: ${((spending/income) * 100).toFixed(1)}%

Provide:
1. A brief assessment (2-3 sentences)
2. One specific actionable recommendation
3. A savings goal for next month

Keep it under 100 words and friendly.`;

        return await this.generateContent(prompt, systemContext);
    }

    /**
     * Detect if user is overspending
     */
    async checkOverspending(spending, monthlyAverage) {
        const percentage = (spending / monthlyAverage) * 100;
        
        if (percentage < 70) {
            return null; // No alert needed
        }

        const systemContext = `You are FinCoach AI. Provide a brief, friendly warning about overspending.
Keep it under 40 words. Be supportive, not judgmental.`;

        const prompt = `User has spent ₦${spending.toLocaleString()} this month, which is ${percentage.toFixed(0)}% of their monthly average (₦${monthlyAverage.toLocaleString()}). Give a short alert message.`;

        return await this.generateContent(prompt, systemContext);
    }

    /**
     * Suggest vault deposits based on spending patterns
     */
    async suggestVaultDeposit(balance, spending, savingsGoal) {
        const systemContext = `You are FinCoach AI helping users save money using the FingerVault feature.
Suggest an amount to move to their secure vault.`;

        const prompt = `User has ₦${balance.toLocaleString()} in spending balance, spent ₦${spending.toLocaleString()} recently, and wants to save ₦${savingsGoal.toLocaleString()}.
Suggest how much to deposit in their vault now. Be specific with the amount and give a brief reason (under 50 words).`;

        return await this.generateContent(prompt, systemContext);
    }

    // ==================== CREDIT AI (MERCHANT) ====================
    
    /**
     * Calculate merchant loan eligibility
     */
    async calculateLoanEligibility(merchantData) {
        const { sales, refunds, monthlyRevenue, businessAge, transactionCount } = merchantData;
        
        const systemContext = `You are Credit AI, a business loan advisor for Nigerian merchants.
Analyze business data and provide loan recommendations. Be realistic and conservative with loan amounts.
Use Naira (₦) for currency.`;

        const prompt = `Analyze this merchant's business:
- Monthly Revenue: ₦${monthlyRevenue.toLocaleString()}
- Successful Transactions: ${transactionCount}
- Refund Rate: ${((refunds/sales) * 100).toFixed(1)}%
- Business Age: ${businessAge} months

Provide:
1. Maximum loan amount they qualify for
2. Why this amount is recommended
3. One specific business improvement suggestion

Keep it under 120 words and businesslike but encouraging.`;

        return await this.generateContent(prompt, systemContext);
    }

    /**
     * Generate "What-If" business scenarios
     */
    async generateWhatIfScenario(scenario, currentRevenue) {
        const systemContext = `You are Credit AI creating business growth simulations for Nigerian merchants.
Provide realistic projections based on the scenario. Use actual numbers.`;

        const prompts = {
            'stock': `If a merchant currently makes ₦${currentRevenue.toLocaleString()}/month and increases stock by 20%, predict their new monthly revenue, the loan amount needed for stock, and expected ROI timeline. Keep it under 80 words.`,
            'staff': `If a merchant currently makes ₦${currentRevenue.toLocaleString()}/month and hires 1 additional staff member (₦30,000/month salary), predict revenue increase, break-even timeline, and net benefit. Keep it under 80 words.`,
            'marketing': `If a merchant currently makes ₦${currentRevenue.toLocaleString()}/month and invests ₦50,000 in marketing, predict the potential revenue increase, customer growth, and ROI timeline. Keep it under 80 words.`,
            'expansion': `If a merchant currently makes ₦${currentRevenue.toLocaleString()}/month and opens a second location, predict required investment, new revenue potential, and months to profitability. Keep it under 80 words.`
        };

        const prompt = prompts[scenario] || prompts['stock'];
        return await this.generateContent(prompt, systemContext);
    }

    /**
     * Analyze business health score
     */
    async analyzeBusinessHealth(merchantData) {
        const { sales, refunds, avgTransactionValue, customerRetention } = merchantData;
        
        const systemContext = `You are Credit AI analyzing business health for Nigerian merchants.
Provide a health score (0-100) and brief analysis.`;

        const prompt = `Rate this business's health (0-100):
- Total Sales: ₦${sales.toLocaleString()}
- Refund Rate: ${((refunds/sales) * 100).toFixed(1)}%
- Average Transaction: ₦${avgTransactionValue.toLocaleString()}
- Customer Retention: ${customerRetention}%

Provide:
1. Health Score (0-100)
2. One strength
3. One area for improvement

Keep it under 60 words.`;

        return await this.generateContent(prompt, systemContext);
    }

    // ==================== FINAGENT AI (AGENT) ====================
    
    /**
     * Predict liquidity demand in agent's area
     */
    async predictLiquidity(agentData) {
        const { location, currentTime, registrationsToday, dayOfWeek, weather } = agentData;
        
        const systemContext = `You are FinAgent AI helping agents optimize their field operations.
Predict cash-out demand and suggest locations. Be specific and actionable.`;

        const prompt = `Predict liquidity demand for an agent:
- Location: ${location}
- Current Time: ${currentTime}
- Day: ${dayOfWeek}
- Registrations Today: ${registrationsToday}
- Weather: ${weather || 'Normal'}

Provide:
1. Demand Level (LOW/MEDIUM/HIGH)
2. Best time window today
3. Recommended location type (market, transport hub, etc.)

Keep it under 70 words and be specific.`;

        return await this.generateContent(prompt, systemContext);
    }

    /**
     * Explain financial jargon in local languages
     */
    async explainJargon(term, language = 'pidgin') {
        const systemContext = `You are FinAgent AI helping explain financial terms in Nigerian languages.
Make complex terms simple and relatable. Use local examples.`;

        const languageInstructions = {
            'pidgin': 'Explain in Nigerian Pidgin English',
            'yoruba': 'Explain in Yoruba with English translation',
            'igbo': 'Explain in Igbo with English translation',
            'hausa': 'Explain in Hausa with English translation',
            'english': 'Explain in simple English'
        };

        const instruction = languageInstructions[language] || languageInstructions['english'];
        const prompt = `${instruction}: What does "${term}" mean in simple terms for someone who is new to banking? Use an everyday example. Keep it under 60 words.`;

        return await this.generateContent(prompt, systemContext);
    }

    /**
     * Calculate agent commission optimization
     */
    async optimizeCommissions(agentData) {
        const { currentLevel, registrations, earnings, target } = agentData;
        
        const systemContext = `You are FinAgent AI helping agents maximize their earnings.
Provide specific, actionable advice for reaching the next level.`;

        const prompt = `Help this agent level up:
- Current Level: ${currentLevel}
- Registrations This Month: ${registrations}
- Current Earnings: ₦${earnings.toLocaleString()}
- Target for Next Level: ${target} registrations

Provide:
1. Registrations needed to level up
2. Estimated additional earnings
3. One specific strategy to hit target faster

Keep it under 80 words and motivational.`;

        return await this.generateContent(prompt, systemContext);
    }

    /**
     * Fraud detection on biometric enrollment
     */
    async detectDuplicateEnrollment(fingerprintData) {
        const systemContext = `You are FinAgent AI verifying biometric enrollment integrity.
Analyze if this enrollment seems legitimate or potentially fraudulent.`;

        const prompt = `Analyze biometric enrollment:
- Fingerprints Captured: ${fingerprintData.count}
- Quality Score: ${fingerprintData.quality}/100
- Previous Enrollments in Area: ${fingerprintData.recentEnrollments}
- Enrollment Speed: ${fingerprintData.speed} seconds

Is this enrollment legitimate? Provide confidence level (0-100) and brief reason. Keep it under 40 words.`;

        return await this.generateContent(prompt, systemContext);
    }
}

module.exports = new AIService();
