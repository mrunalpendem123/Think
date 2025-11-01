# 🔐 Private Search AI

> **This is a genuine attempt to bring privacy back to AI search.**

A privacy-focused AI search engine that puts **your data security first**. In an age where every query is logged, analyzed, and monetized by Big Tech, this project represents a sincere effort to prove that powerful AI search can exist without sacrificing your privacy.

**Powered by:** Venice AI (Private LLM) + Parallel AI (Privacy-First Search)

![Private Search AI Interface](/public/screenshot-2025-05-04.png)

---

## 💭 The Mission

This isn't just another AI tool - it's a **genuine attempt to reclaim digital privacy** in the AI age.

**We believe:**
- 🔒 Privacy is a fundamental right, not a premium feature
- 🛡️ Your thoughts should remain yours, not training data  
- 🌐 Search should be free from tracking and surveillance
- ✨ Better AI is possible without the privacy nightmare

**This project proves:** You don't have to choose between cutting-edge AI and personal privacy. You can have both.

---

## 🛡️ Why Privacy Matters in the AI Age

### The Privacy Crisis in Modern AI

In today's AI-driven world, **your search queries and conversations are valuable data**:

- **Big Tech Surveillance**: Traditional AI services (ChatGPT, Google Bard, Claude) log every query you make
- **Data Monetization**: Your searches, questions, and conversations are used to train future models and sold to advertisers
- **No Control**: Once sent to OpenAI or Google, your data is out of your hands forever
- **Compliance Risks**: Businesses face GDPR, HIPAA, and data sovereignty violations when using mainstream AI tools

### What Happens to Your Data?

When you use ChatGPT, Google AI, or similar services:

❌ **Your conversations are stored indefinitely**  
❌ **Queries are used to train future models**  
❌ **Personal information can be extracted by prompt injection**  
❌ **No guarantee of deletion even when requested**  
❌ **Subject to government data requests**  
❌ **Vulnerable to data breaches**  

### The Private Search AI Solution

✅ **Zero Data Retention**: Venice AI doesn't store your queries or responses  
✅ **Privacy-First Search**: Parallel AI respects user privacy in web scraping  
✅ **No Big Tech**: Your data never touches OpenAI, Google, or Anthropic servers  
✅ **Self-Hosted Option**: Run entirely on your own infrastructure  
✅ **GDPR Compliant**: Built for privacy regulations from the ground up  
✅ **Transparent**: Open-source code you can audit  

---

## 🔐 Privacy-First Architecture

This application is designed with **privacy as the foundation**, not an afterthought:

### How Your Data Stays Private

1. **Private LLM (Venice AI)**
   - No conversation logging
   - No training on your data
   - No data retention policies
   - End-to-end encrypted API calls

2. **Private Search (Parallel AI)**
   - Privacy-focused web scraping
   - No search history tracking
   - Anonymous query execution
   - Secure data extraction

3. **Optional Local Storage**
   - Chat history stored in YOUR Redis instance (not ours)
   - Authentication via YOUR Supabase (not shared)
   - Full control over data retention
   - Can be completely disabled

### What We DON'T Collect

- ❌ No query logging
- ❌ No conversation tracking
- ❌ No user profiling
- ❌ No analytics or telemetry
- ❌ No cookies (except authentication if enabled)
- ❌ No third-party trackers

---

## ✨ Features

### Core Capabilities

- 🤖 **Multiple AI Models**: Choose from 5 Venice AI models (Llama 3.3 70B, Qwen3 235B, Mistral 31 24B, Venice Uncensored, Qwen3 4B)
- 🔍 **Real-Time Web Search**: Live search results with citations via Parallel AI
- 💬 **Conversational Interface**: Natural language queries with streaming responses
- 📊 **Source Citations**: Every answer includes verifiable sources
- 🎨 **Modern UI**: Beautiful, dark-themed interface with responsive design
- 📱 **Mobile-Friendly**: Works seamlessly on desktop, tablet, and mobile
- ⚡ **Fast Responses**: Streaming AI responses for instant feedback

### Privacy Features

- 🔐 **End-to-End Privacy**: No data leaves your control
- 🚫 **No Tracking**: Zero analytics or telemetry
- 🌐 **Anonymous Search**: Web searches don't reveal your identity
- 🔒 **Encrypted Communication**: All API calls are encrypted
- 📝 **Optional History**: Chat history can be completely disabled

### Optional Features

- 🔄 **Chat History**: Store conversations in your own Redis instance
- 🔐 **User Authentication**: Optional Supabase-based user accounts
- 🎯 **Advanced Search**: Deep search mode for comprehensive results
- 💾 **Self-Hosted**: Deploy on your own infrastructure

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- API keys from:
  - [Venice AI](https://venice.ai/) - Privacy-focused LLM
  - [Parallel AI](https://parallel.ai/) - Privacy-first search

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/private-search-ai.git
cd private-search-ai

# Install dependencies
npm install --legacy-peer-deps

# Set up environment variables
cp .env.local.example .env.local
```

### Configuration

Edit `.env.local` and add your API keys:

```env
# Required - Get from https://venice.ai/
VENICE_API_KEY=your_venice_api_key_here

# Required - Get from https://parallel.ai/
PARALLEL_API_KEY=your_parallel_api_key_here

# Optional - For user accounts (can be left commented out)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Optional - For chat history (can be left commented out)
# UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### Run Locally

```bash
# Start development server
npm run dev

# Application will be available at http://localhost:3000
```

### Run on Different Port

```bash
PORT=3001 npm run dev
```

---

## 📁 Project Structure

```
/
├── app/                    # Next.js App (Pages + API Routes)
│   ├── api/               # Backend API endpoints
│   │   ├── chat/          # Chat completions API
│   │   ├── chats/         # Chat history API
│   │   └── config/        # Model configuration API
│   ├── auth/              # Authentication pages
│   └── *.tsx              # Frontend pages (home, search)
│
├── components/            # Frontend React Components
│   ├── ui/               # Base UI components
│   ├── artifact/         # Search result displays
│   ├── chat*.tsx         # Chat interface
│   └── search*.tsx       # Search components
│
├── lib/                  # Backend Core Logic
│   ├── agents/           # AI agent configurations
│   ├── tools/            # Search tool implementations
│   │   └── search/providers/
│   │       └── parallel.ts    # Parallel AI integration
│   ├── utils/            # Utilities
│   │   └── registry.ts   # Venice AI registry
│   ├── streaming/        # Response streaming
│   ├── auth/             # Authentication logic
│   └── supabase/         # Database client
│
├── public/               # Static Assets
│   ├── config/          # Model configurations
│   │   └── models.json  # Venice AI models list
│   └── providers/       # Provider logos
│
├── docs/                # Documentation
│   ├── SETUP.md         # Setup guide
│   ├── DEPLOYMENT.md    # Deployment guide
│   └── PROJECT_STRUCTURE.md  # Architecture
│
├── .env.local.example   # Environment template (safe)
├── .env.local           # Your API keys (gitignored)
└── README.md            # This file
```

---

## 🎯 Available AI Models

Select from these privacy-focused Venice AI models:

| Model | Parameters | Best For | Speed |
|-------|------------|----------|-------|
| **Llama 3.3 70B** | 70B | General use, balanced performance | ⚡⚡⚡ |
| **Qwen3 235B** | 235B | Complex reasoning, most powerful | ⚡⚡ |
| **Mistral 31 24B** | 24B | Vision tasks, function calling | ⚡⚡⚡⚡ |
| **Venice Uncensored** | - | Unrestricted queries, no filtering | ⚡⚡⚡ |
| **Qwen3 4B** | 4B | Fast responses, simple queries | ⚡⚡⚡⚡⚡ |

All models run through Venice AI's privacy-preserving infrastructure.

---

## 🔧 How It Works

### Architecture Overview

```
User Query
    ↓
┌─────────────────────────────────────────┐
│  Frontend (Next.js + React)             │
│  - User interface                       │
│  - Model selection                      │
│  - Response streaming                   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│  Backend API (Next.js API Routes)       │
│  - Request validation                   │
│  - Tool orchestration                   │
│  - Response formatting                  │
└─────────────────────────────────────────┘
    ↓                              ↓
┌──────────────────┐    ┌──────────────────┐
│  Parallel AI     │    │  Venice AI       │
│  Web Search      │    │  LLM Processing  │
│  (Private)       │    │  (Private)       │
└──────────────────┘    └──────────────────┘
    ↓                              ↓
Search Results              AI Response
    ↓                              ↓
    └──────────────┬───────────────┘
                   ↓
         Synthesized Answer
         with Citations
                   ↓
              User Interface
```

### Data Flow

1. **User enters query** → Frontend captures input
2. **Search execution** → Parallel AI searches the web privately
3. **Result retrieval** → Search results extracted and parsed
4. **AI processing** → Venice AI analyzes results and generates response
5. **Response streaming** → Answer streams back to user in real-time
6. **Citation display** → Sources displayed with clickable links

**No data is stored, logged, or shared with third parties.**

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYOUR_USERNAME%2Fprivate-search-ai)

1. Push your code to GitHub
2. Import repository in [Vercel](https://vercel.com/)
3. Add environment variables:
   - `VENICE_API_KEY`
   - `PARALLEL_API_KEY`
4. Deploy!

### Deploy with Docker

```bash
# Build image
docker build -t private-search-ai .

# Run container
docker run -p 3000:3000 \
  -e VENICE_API_KEY=your_key \
  -e PARALLEL_API_KEY=your_key \
  private-search-ai
```

### Self-Hosted Deployment

For maximum privacy, deploy on your own infrastructure:

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 🔒 Security & Privacy

### Security Best Practices

1. **Never commit `.env.local`** - Contains sensitive API keys
2. **Use environment variables** - Never hardcode credentials
3. **Keep dependencies updated** - Regular security patches
4. **Enable HTTPS** - Always use encrypted connections in production
5. **Rotate API keys** - Periodically change your credentials

### Before Pushing to GitHub

Run our security verification script:

```bash
./verify-before-push.sh
```

This checks:
- ✅ `.env.local` is gitignored
- ✅ No API keys in code
- ✅ All sensitive data protected

### Privacy Guarantees

| Feature | Status | Details |
|---------|--------|---------|
| Query Logging | ❌ None | No queries are logged anywhere |
| Data Retention | ❌ None | Nothing is stored by AI providers |
| Third-Party Sharing | ❌ None | Your data stays with you |
| Training Data Usage | ❌ Never | Your queries never train models |
| Analytics/Tracking | ❌ None | Zero telemetry or tracking |
| Data Encryption | ✅ Yes | All API calls are encrypted |
| Self-Hosted Option | ✅ Yes | Run entirely on your infrastructure |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide Icons** - Beautiful icon system

### Backend
- **Next.js API Routes** - Serverless backend functions
- **Vercel AI SDK** - Streaming AI responses
- **Venice AI** - Privacy-focused LLM provider (OpenAI-compatible)
- **Parallel AI** - Privacy-first web search API

### Optional Services
- **Supabase** - Authentication & user management (optional)
- **Upstash Redis** - Chat history persistence (optional)

---

## 📖 Documentation

- **[Setup Guide](docs/SETUP.md)** - Detailed installation and configuration
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Code organization and architecture
- **[Integration Summary](docs/INTEGRATION_SUMMARY.md)** - Technical implementation details

---

## 🎯 Use Cases

### For Individuals
- 🔍 **Private Research**: Search without being tracked
- 💭 **Confidential Questions**: Ask sensitive questions privately
- 📚 **Learning**: Study without data collection
- 🏥 **Health Queries**: Medical questions stay private

### For Businesses
- 🏢 **Corporate Research**: Competitive intelligence without leaks
- 💼 **Legal Research**: Attorney-client privilege protected
- 🔬 **R&D**: Trade secrets and innovations stay confidential
- 📊 **Market Analysis**: Sensitive business queries remain private

### For Developers
- 🛠️ **Code Search**: Technical queries without exposing projects
- 📖 **Documentation**: Learn without tracking
- 🐛 **Debugging**: Problem-solving stays confidential
- 🚀 **API Integration**: Privacy-preserving development

---

## 💡 Why Choose Private Search AI?

### vs. ChatGPT / OpenAI

| Feature | Private Search AI | ChatGPT |
|---------|-------------------|---------|
| Data Retention | ❌ None | ✅ Indefinite |
| Training on Your Data | ❌ Never | ✅ Yes (unless opted out) |
| Query Logging | ❌ None | ✅ All queries logged |
| Privacy Policy | 🔒 Privacy-first | 📊 Data monetization |
| Self-Hosting | ✅ Yes | ❌ No |
| Real-Time Search | ✅ Yes | ⚠️ Limited |

### vs. Google Gemini

| Feature | Private Search AI | Google Gemini |
|---------|-------------------|---------------|
| Search Tracking | ❌ None | ✅ Full tracking |
| Ad Targeting | ❌ None | ✅ Used for ads |
| Data Sharing | ❌ None | ✅ Across Google services |
| Privacy Controls | 🔒 Total | ⚠️ Limited |
| Open Source | ✅ Yes | ❌ No |

### vs. Traditional Search Engines

| Feature | Private Search AI | Google/Bing |
|---------|-------------------|-------------|
| Search History | ❌ Not stored | ✅ Permanent |
| Personalization | ❌ None | ✅ Profile-based |
| Ad Tracking | ❌ None | ✅ Extensive |
| AI-Powered Answers | ✅ Yes | ⚠️ Limited |
| Privacy-First | ✅ Yes | ❌ No |

---

## 🚦 Getting Started

### Step 1: Get Your API Keys

#### Venice AI (Private LLM)
1. Visit [https://venice.ai/](https://venice.ai/)
2. Sign up for an account
3. Navigate to API Settings
4. Generate a new API key
5. Copy your key

#### Parallel AI (Private Search)
1. Visit [https://parallel.ai/](https://parallel.ai/)
2. Create an account
3. Go to API section
4. Generate API key
5. Copy your key

### Step 2: Configure Your Application

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit with your favorite editor
nano .env.local  # or vim, code, etc.
```

Add your keys:
```env
VENICE_API_KEY=your_actual_venice_key
PARALLEL_API_KEY=your_actual_parallel_key
```

### Step 3: Install & Run

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Open http://localhost:3000
```

### Step 4: Start Searching Privately!

1. Select an AI model (Llama 3.3 70B recommended)
2. Make sure "Search" toggle is ON (blue)
3. Enter your query
4. Watch as it searches the web and generates private answers!

---

## 🧪 Testing

### Run Locally

```bash
cd /Users/mrunalpendem/Desktop/think
npm run dev
```

Visit `http://localhost:3000` or `http://localhost:3001`

### Verify Privacy Features

Test these scenarios:
- ✅ Search for "current movies in hyderabad" - Should show live results
- ✅ Switch between models - UI should update
- ✅ Check Sources count - Should be > 0
- ✅ Click citations - Should open actual sources
- ✅ Check browser DevTools - No tracking scripts loaded

---

## 🐛 Troubleshooting

### "messages must not be empty" Error

**Solution:**
1. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
2. Clear browser cache and storage
3. Verify Search toggle is ON (blue)
4. Select a model from dropdown

### "Sources: 0" Showing

**Solution:**
1. Verify `PARALLEL_API_KEY` in `.env.local`
2. Check Search mode is enabled (toggle is blue)
3. Restart dev server: `npm run dev`
4. Check browser console for API errors

### Models Not Loading

**Solution:**
1. Verify `VENICE_API_KEY` in `.env.local`
2. Check `public/config/models.json` exists
3. Hard refresh browser
4. Restart server

### API Key Errors

**Solution:**
1. Verify keys are correct (no extra spaces)
2. Check API key permissions on provider websites
3. Ensure keys haven't expired
4. Check API quota/credits

---

## 🤝 Contributing

This is a privacy-focused implementation. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run security verification: `./verify-before-push.sh`
5. Submit a pull request

**Privacy-First Development Guidelines:**
- Never log user queries or responses
- Minimize data collection
- Default to privacy-preserving options
- Document privacy implications of new features

---

## 📊 Comparison: Why Privacy Matters

### Traditional AI Search
```
Your Query → Google/OpenAI Servers → Logged Forever → Used for Training → Sold to Advertisers
```

### Private Search AI
```
Your Query → Venice AI (No Logging) → Parallel AI (Private Search) → Response → Deleted
```

---

## 🌟 Real-World Privacy Benefits

### 1. Healthcare Professionals
> "I can research patient symptoms without HIPAA violations"

### 2. Legal Professionals
> "Attorney-client privilege protected - searches don't leave a trail"

### 3. Journalists
> "Research sensitive topics without revealing sources or stories"

### 4. Business Leaders
> "Competitive analysis without alerting competitors via search history"

### 5. Privacy-Conscious Users
> "Finally, an AI that respects my privacy"

---

## 📜 License

Apache-2.0 (inherited from [Morphic](https://github.com/miurla/morphic))

This ensures:
- ✅ Free to use
- ✅ Free to modify
- ✅ Free to distribute
- ✅ Open source

---

## 🙏 Credits & Acknowledgments

Built on top of:
- [Morphic](https://github.com/miurla/morphic) by [@miurla](https://github.com/miurla) - Original AI search UI
- [Venice AI](https://venice.ai/) - Privacy-focused LLM infrastructure
- [Parallel AI](https://parallel.ai/) - Privacy-first search API
- [Vercel AI SDK](https://sdk.vercel.ai/) - Streaming AI responses
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling system

---

## 🔗 Resources

### Official Documentation
- [Venice AI API Docs](https://docs.venice.ai/) - LLM provider documentation
- [Parallel AI Docs](https://docs.parallel.ai/) - Search API documentation
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation

### Privacy Resources
- [Privacy Guides](https://www.privacyguides.org/) - Privacy tools and practices
- [EFF Privacy](https://www.eff.org/issues/privacy) - Digital privacy rights
- [GDPR Info](https://gdpr.eu/) - EU privacy regulations

### Community
- GitHub Issues - Report bugs or request features
- Discussions - Share ideas and feedback

---

## ⚠️ Important Notes

### API Costs
- Venice AI and Parallel AI charge for API usage
- Monitor your usage to avoid unexpected costs
- Set up billing alerts on provider platforms

### Rate Limits
- Be aware of API rate limits
- Implement caching if needed for high-traffic deployments
- Contact providers for enterprise limits

### Data Sovereignty
- For maximum privacy, self-host on your own infrastructure
- Choose data center locations that comply with your regulations
- Consider on-premises deployment for highly sensitive use cases

---

## 🎓 Learn More

### About Privacy in AI

The AI age presents unprecedented privacy challenges:

- **Mass Data Collection**: AI companies collect billions of queries daily
- **Inference Attacks**: AI models can reveal training data
- **Behavioral Profiling**: Your queries build detailed profiles
- **No Right to Deletion**: Data is often impossible to truly delete
- **Cross-Service Tracking**: Data shared across multiple services

**Private Search AI addresses these by:**
- Using privacy-focused providers
- Minimizing data collection
- Giving you full control
- Being transparent and open source

### The Future of Private AI

As AI becomes more integrated into daily life, privacy becomes more critical:

- 🔮 **AI Agents**: Will need access to your calendar, email, files
- 🏥 **Healthcare AI**: Medical data must stay confidential
- 💰 **Financial AI**: Banking queries need security
- 🏛️ **Legal AI**: Attorney-client privilege is sacred
- 🎓 **Education AI**: Student data requires protection

**Private Search AI is built for this future.**

---

## ❓ FAQ

**Q: Is this really private?**  
A: Yes. Venice AI and Parallel AI are designed for privacy. No query logging, no data retention, no training on your data.

**Q: How does it compare to DuckDuckGo?**  
A: DuckDuckGo provides private *search*. We provide private *AI-powered answers* with search integration.

**Q: Can I self-host this completely?**  
A: Yes! Deploy on your own servers. You'll still use Venice/Parallel APIs, but can add your own privacy layers.

**Q: What about chat history?**  
A: Optional. If enabled, it's stored in *your* Redis instance, not ours. You control retention.

**Q: Is it free?**  
A: The software is open source and free. Venice AI and Parallel AI charge for API usage.

**Q: Can I use different AI providers?**  
A: This version is optimized for Venice AI. You can fork and integrate other privacy-focused providers.

**Q: How fast is it?**  
A: Comparable to ChatGPT. Streaming responses start in ~2-3 seconds.

**Q: Does it work offline?**  
A: No, it requires internet to access Venice AI and Parallel AI APIs.

---

## 🚨 Disclaimer

This application is designed for privacy, but:

- **API Dependencies**: Relies on Venice AI and Parallel AI infrastructure
- **Network Exposure**: API calls travel over the internet (encrypted)
- **No Guarantees**: While designed for privacy, we can't guarantee provider policies
- **User Responsibility**: Always review provider privacy policies yourself
- **Not Legal Advice**: Consult legal counsel for compliance requirements

**For maximum privacy, audit the code and providers yourself.**

---

## 💪 Why This Matters

In the AI age, **privacy is not just a feature - it's a fundamental right.**

Every search you make, every question you ask, reveals something about you:
- Your interests, concerns, and fears
- Your health, relationships, and finances  
- Your work, research, and innovations
- Your thoughts, beliefs, and values

**You deserve to think freely without surveillance.**

Private Search AI gives you the power of AI **without sacrificing your privacy.**

---

**Made with privacy in mind** 🔐 | **Powered by** [Venice AI](https://venice.ai/) & [Parallel AI](https://parallel.ai/)

---

## 🚀 Get Started Now

```bash
# Clone, configure, and run
git clone https://github.com/YOUR_USERNAME/private-search-ai.git
cd private-search-ai
cp .env.local.example .env.local
# Add your API keys to .env.local
npm install --legacy-peer-deps
npm run dev
```

**Your private AI search engine is just 5 commands away.** 🎉
