# FingerPay AI Integration Guide

## Overview

FingerPay uses Google's Gemini AI to power three intelligent features:
- **FinCoach AI**: Personal financial advisor for customers
- **Credit AI**: Business loan advisor for merchants
- **FinAgent AI**: Field operations optimizer for agents

## Setup

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Backend

Add your API key to `.env`:

```bash
# AI Configuration
GEMINI_API_KEY=your-actual-api-key-here
```

### 3. No Frontend Configuration Needed!

All AI requests go through the backend for security. The frontend just calls the API endpoints.

## API Endpoints

All AI endpoints require authentication. Include the JWT token in the Authorization header.

### FinCoach AI (Customer)

#### 1. Analyze Budget
```http
POST /api/ai/fincoach/analyze-budget
Authorization: Bearer <token>
Content-Type: application/json

{
  "monthlyIncome": 100000,
  "monthlyAverage": 80000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "AI-generated budget analysis...",
    "customerData": {
      "balance": 50000,
      "spending": 65000,
      "income": 100000,
      "spendingPercentage": "65.0"
    }
  }
}
```

#### 2. Check Overspending
```http
POST /api/ai/fincoach/check-overspending
Authorization: Bearer <token>
Content-Type: application/json

{
  "spending": 75000,
  "monthlyAverage": 60000
}
```

#### 3. Suggest Vault Deposit
```http
POST /api/ai/fincoach/suggest-vault
Authorization: Bearer <token>
Content-Type: application/json

{
  "balance": 100000,
  "spending": 60000,
  "savingsGoal": 50000
}
```

### Credit AI (Merchant)

#### 1. Calculate Loan Eligibility
```http
POST /api/ai/credit/loan-eligibility
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "AI-generated loan analysis...",
    "businessMetrics": {
      "monthlyRevenue": 500000,
      "transactionCount": 150,
      "refundRate": "2.5",
      "businessAge": 6
    }
  }
}
```

#### 2. Generate What-If Scenario
```http
POST /api/ai/credit/what-if
Authorization: Bearer <token>
Content-Type: application/json

{
  "scenario": "stock",
  "currentRevenue": 500000
}
```

**Valid scenarios:**
- `stock` - Increase inventory by 20%
- `staff` - Hire additional staff member
- `marketing` - Invest in marketing campaign
- `expansion` - Open second location

#### 3. Analyze Business Health
```http
POST /api/ai/credit/business-health
Authorization: Bearer <token>
```

### FinAgent AI (Agent)

#### 1. Predict Liquidity
```http
POST /api/ai/finagent/predict-liquidity
Authorization: Bearer <token>
Content-Type: application/json

{
  "weather": "Rainy"
}
```

#### 2. Explain Financial Jargon
```http
POST /api/ai/finagent/explain-jargon
Authorization: Bearer <token>
Content-Type: application/json

{
  "term": "compound interest",
  "language": "pidgin"
}
```

**Valid languages:**
- `pidgin` - Nigerian Pidgin English
- `yoruba` - Yoruba
- `igbo` - Igbo
- `hausa` - Hausa
- `english` - Simple English

#### 3. Optimize Commissions
```http
POST /api/ai/finagent/optimize-commissions
Authorization: Bearer <token>
```

#### 4. Detect Duplicate Enrollment
```http
POST /api/ai/finagent/detect-duplicate
Authorization: Bearer <token>
Content-Type: application/json

{
  "fingerprintCount": 10,
  "quality": 85,
  "speed": 45
}
```

## Frontend Usage

### Using FingerPayAPI

```javascript
// 1. Ensure user is authenticated
if (!FingerPayAPI.auth.isAuthenticated()) {
  window.location.href = 'log.html';
  return;
}

// 2. Call AI endpoints

// FinCoach - Analyze Budget
try {
  const result = await FingerPayAPI.ai.finCoach.analyzeBudget({
    monthlyIncome: 100000,
    monthlyAverage: 80000
  });
  
  console.log(result.data.analysis);
  displayAnalysis(result.data.analysis);
} catch (error) {
  console.error('AI Error:', error);
  alert(error.message);
}

// Credit AI - Check Loan Eligibility
try {
  const result = await FingerPayAPI.ai.creditAI.loanEligibility();
  console.log(result.data.analysis);
} catch (error) {
  console.error('AI Error:', error);
}

// Credit AI - What-If Scenario
try {
  const result = await FingerPayAPI.ai.creditAI.whatIf('stock', 500000);
  console.log(result.data.prediction);
} catch (error) {
  console.error('AI Error:', error);
}

// FinAgent - Predict Liquidity
try {
  const result = await FingerPayAPI.ai.finAgent.predictLiquidity({
    weather: 'Sunny'
  });
  console.log(result.data.prediction);
} catch (error) {
  console.error('AI Error:', error);
}

// FinAgent - Explain Jargon
try {
  const result = await FingerPayAPI.ai.finAgent.explainJargon(
    'compound interest',
    'pidgin'
  );
  console.log(result.data.explanation);
} catch (error) {
  console.error('AI Error:', error);
}
```

### Example: Customer Dashboard Integration

```javascript
// pack.js - Customer Dashboard

async function loadAIInsights() {
  try {
    // Show loading state
    document.getElementById('ai-insights').innerHTML = 
      '<div class="spinner-border text-primary"></div> Loading AI insights...';
    
    // Get AI budget analysis
    const analysis = await FingerPayAPI.ai.finCoach.analyzeBudget({
      monthlyIncome: 150000,
      monthlyAverage: 100000
    });
    
    // Display AI insights
    document.getElementById('ai-insights').innerHTML = `
      <div class="alert alert-info">
        <h5><i class="bi bi-robot"></i> FinCoach AI Says:</h5>
        <p>${analysis.data.analysis}</p>
      </div>
    `;
    
    // Check for overspending
    const spending = getCurrentMonthSpending();
    const avgSpending = getAverageMonthlySpending();
    
    const overspendingCheck = await FingerPayAPI.ai.finCoach.checkOverspending({
      spending: spending,
      monthlyAverage: avgSpending
    });
    
    if (overspendingCheck.data.shouldAlert) {
      showAlert(overspendingCheck.data.message, 'warning');
    }
    
  } catch (error) {
    console.error('Failed to load AI insights:', error);
    document.getElementById('ai-insights').innerHTML = 
      '<p class="text-muted">AI insights temporarily unavailable</p>';
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', loadAIInsights);
```

### Example: Merchant Dashboard Integration

```javascript
// merchantDB.js - Merchant Dashboard

async function loadCreditAI() {
  const aiButton = document.getElementById('check-loan-btn');
  
  aiButton.addEventListener('click', async () => {
    try {
      // Show loading
      aiButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Calculating...';
      aiButton.disabled = true;
      
      // Get loan eligibility
      const result = await FingerPayAPI.ai.creditAI.loanEligibility();
      
      // Display result
      document.getElementById('loan-result').innerHTML = `
        <div class="card">
          <div class="card-body">
            <h5 class="card-title"><i class="bi bi-graph-up"></i> Credit AI Analysis</h5>
            <p>${result.data.analysis}</p>
            <hr>
            <small class="text-muted">
              Based on ${result.data.businessMetrics.transactionCount} transactions
            </small>
          </div>
        </div>
      `;
      
      // Reset button
      aiButton.innerHTML = '<i class="bi bi-robot"></i> Check Eligibility';
      aiButton.disabled = false;
      
    } catch (error) {
      console.error('Credit AI Error:', error);
      alert('Failed to analyze loan eligibility: ' + error.message);
      
      aiButton.innerHTML = '<i class="bi bi-robot"></i> Check Eligibility';
      aiButton.disabled = false;
    }
  });
}

// What-If Scenarios
async function generateWhatIfScenario(scenario) {
  try {
    const currentRevenue = getCurrentMonthRevenue();
    
    const result = await FingerPayAPI.ai.creditAI.whatIf(scenario, currentRevenue);
    
    displayScenario(result.data.prediction);
  } catch (error) {
    console.error('What-If Error:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadCreditAI);
```

### Example: Agent Dashboard Integration

```javascript
// agentDB.js - Agent Dashboard

async function loadAgentAI() {
  try {
    // Liquidity Prediction
    const liquidityResult = await FingerPayAPI.ai.finAgent.predictLiquidity();
    
    document.getElementById('liquidity-prediction').innerHTML = `
      <div class="alert alert-warning">
        <h6><i class="bi bi-lightning-fill"></i> Liquidity Forecast</h6>
        <p>${liquidityResult.data.prediction}</p>
        <small>Based on ${liquidityResult.data.agentData.registrationsToday} registrations today</small>
      </div>
    `;
    
    // Commission Optimization
    const commissionResult = await FingerPayAPI.ai.finAgent.optimizeCommissions();
    
    document.getElementById('commission-tips').innerHTML = `
      <div class="card">
        <div class="card-body">
          <h6><i class="bi bi-cash-stack"></i> Level Up Strategy</h6>
          <p>${commissionResult.data.optimization}</p>
          <div class="progress">
            <div class="progress-bar" style="width: ${commissionResult.data.currentStats.progress}%">
              ${commissionResult.data.currentStats.progress}%
            </div>
          </div>
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error('Agent AI Error:', error);
  }
}

// Jargon Buster Feature
async function explainTerm(term, language) {
  try {
    const result = await FingerPayAPI.ai.finAgent.explainJargon(term, language);
    
    document.getElementById('jargon-explanation').innerHTML = `
      <div class="alert alert-info">
        <h6>${term}</h6>
        <p>${result.data.explanation}</p>
      </div>
    `;
  } catch (error) {
    console.error('Jargon Error:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadAgentAI);
```

## Error Handling

All AI endpoints may throw errors. Always wrap calls in try-catch:

```javascript
try {
  const result = await FingerPayAPI.ai.finCoach.analyzeBudget(data);
  // Handle success
} catch (error) {
  // Handle error
  if (error.status === 401) {
    // Token expired
    window.location.href = 'log.html';
  } else if (error.status === 400) {
    // Bad request
    alert('Invalid data: ' + error.message);
  } else {
    // Server error
    alert('AI service temporarily unavailable');
  }
}
```

## Rate Limiting

To prevent abuse, consider implementing rate limiting on the backend:

```javascript
// In backend - add to aiRoutes.js
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many AI requests, please try again later'
});

router.use(aiLimiter);
```

## Testing Without API Key

The backend will use mock responses if `GEMINI_API_KEY` is not set. This allows you to test the integration without an API key.

## Production Considerations

1. **Secure API Key**: Never expose your Gemini API key in frontend code
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Caching**: Cache AI responses for similar requests to reduce API calls
4. **Error Handling**: Always provide fallback UI when AI is unavailable
5. **User Feedback**: Show loading states during AI processing
6. **Cost Management**: Monitor your Gemini API usage and set quotas

## Troubleshooting

### "AI service temporarily unavailable"
- Check that `GEMINI_API_KEY` is set in `.env`
- Verify your API key is valid at [Google AI Studio](https://makersuite.google.com/)
- Check backend logs for detailed error messages

### "Authentication failed"
- Ensure JWT token is included in requests
- Check token hasn't expired
- Verify user is logged in

### Slow responses
- AI generation can take 2-5 seconds
- Always show loading indicators
- Consider implementing timeouts

## Next Steps

1. Add your Gemini API key to backend `.env`
2. Test each AI endpoint using the examples above
3. Integrate AI features into your dashboards
4. Monitor usage and adjust as needed

For more information, see:
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [FingerPay API Documentation](../backend/README.md)
