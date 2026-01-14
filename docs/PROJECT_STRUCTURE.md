# Project Structure

## Overview

This is a **privacy-focused AI search engine** with a clean separation between frontend (UI), backend (API), and configuration.

```
morphic/
│
├── 🎨 FRONTEND (UI Components)
│   └── components/                 # React components
│       ├── ui/                    # Basic UI elements
│       ├── artifact/              # Search results display
│       ├── sidebar/               # Chat history sidebar
│       ├── chat.tsx               # Main chat interface
│       ├── model-selector.tsx     # Venice AI model picker
│       └── search-*.tsx           # Search components
│
├── ⚙️ BACKEND (API & Logic)
│   ├── app/api/                   # Next.js API routes
│   │   ├── chat/route.ts         # Main chat endpoint
│   │   ├── chats/route.ts        # Chat history
│   │   └── config/route.ts       # Configuration
│   │
│   └── lib/                       # Core business logic
│       ├── agents/                # AI agent configurations
│       │   ├── researcher.ts     # Main researcher agent
│       │   └── manual-researcher.ts  # Manual tool calling
│       │
│       ├── tools/                 # Tool implementations
│       │   ├── search.ts         # Search tool wrapper
│       │   └── search/providers/
│       │       ├── base.ts       # Base provider class
│       │       ├── parallel.ts   # ✅ Parallel AI (active)
│       │       └── index.ts      # Provider factory
│       │
│       ├── streaming/            # Response streaming
│       │   ├── create-tool-calling-stream.ts
│       │   ├── create-manual-tool-stream.ts
│       │   └── tool-execution.ts
│       │
│       ├── utils/                # Utilities
│       │   └── registry.ts       # ✅ Venice AI registry
│       │
│       ├── auth/                 # Authentication (optional)
│       ├── supabase/             # Supabase client (optional)
│       └── redis/                # Redis client (optional)
│
├── 📝 CONFIGURATION
│   ├── public/config/
│   │   └── models.json           # ✅ Venice AI models (UI)
│   │
│   ├── lib/config/
│   │   └── default-models.json   # ✅ Venice AI models (fallback)
│   │
│   ├── .env.local.example        # Environment template
│   └── .env.local                # Your API keys (gitignored)
│
├── 📚 DOCUMENTATION
│   └── docs/
│       ├── SETUP.md              # Setup instructions
│       ├── DEPLOYMENT.md         # Deployment guide
│       ├── PROJECT_STRUCTURE.md  # This file
│       └── INTEGRATION_SUMMARY.md # Technical details
│
├── 🔧 BUILD & DEPLOY
│   ├── package.json              # Dependencies
│   ├── next.config.mjs           # Next.js config
│   ├── tailwind.config.ts        # Tailwind config
│   ├── tsconfig.json             # TypeScript config
│   └── Dockerfile                # Docker build
│
└── 🎯 ENTRY POINTS
    ├── app/page.tsx              # Home page
    ├── app/layout.tsx            # Root layout
    └── middleware.ts             # Auth middleware
```

## Key Integrations

### Venice AI (LLM Provider)
- **File**: `lib/utils/registry.ts`
- **Purpose**: Manages AI model connections
- **Endpoint**: `https://api.venice.ai/api/v1`
- **Models**: Llama 3.3 70B, Qwen3 235B, Mistral 31 24B, etc.

### Parallel AI (Search Provider)
- **File**: `lib/tools/search/providers/parallel.ts`
- **Purpose**: Web search and data extraction
- **Endpoint**: `https://api.parallel.ai/v1beta/search`
- **Returns**: Search results with URLs and excerpts

## Data Flow

```
User Query (Frontend)
    ↓
components/chat.tsx
    ↓
app/api/chat/route.ts
    ↓
lib/agents/manual-researcher.ts
    ↓
lib/streaming/tool-execution.ts
    ↓
lib/tools/search/providers/parallel.ts → Parallel AI API
    ↓
lib/utils/registry.ts → Venice AI API
    ↓
Streaming Response (Frontend)
```

## What Was Removed

### Unused Providers (Cleaned Up)
- ❌ Tavily search provider
- ❌ SearXNG search provider
- ❌ Exa search provider
- ❌ Firecrawl search provider
- ❌ Anthropic LLM provider
- ❌ OpenAI LLM provider
- ❌ Google Gemini provider
- ❌ Azure OpenAI provider
- ❌ Groq provider
- ❌ DeepSeek provider
- ❌ Fireworks provider
- ❌ xAI provider
- ❌ Ollama integration

### Unused Files (Deleted)
- ❌ `CLAUDE.md`
- ❌ `CODE_OF_CONDUCT.md`
- ❌ `CONTRIBUTING.md`
- ❌ `bun.lock`
- ❌ `searxng-*.yml/toml`
- ❌ `docker-compose.yaml`

## Frontend Components

### Core UI
- `components/chat.tsx` - Main chat interface
- `components/model-selector.tsx` - Model dropdown
- `components/search-mode-toggle.tsx` - Enable/disable search
- `components/message.tsx` - Message display
- `components/chat-panel.tsx` - Input panel

### Search Display
- `components/search-section.tsx` - Search results
- `components/search-results.tsx` - Result list
- `components/artifact/search-artifact-content.tsx` - Search artifacts

### Auth (Optional)
- `app/auth/login/` - Login page
- `app/auth/sign-up/` - Sign up page
- `components/user-menu.tsx` - User menu

## Backend API Routes

### Main Endpoints
- `POST /api/chat` - Chat completions
- `GET /api/chats` - Chat history
- `GET /api/config` - Model configuration

### Optional Endpoints
- `/api/advanced-search` - Advanced search (if enabled)
- `/auth/*` - Authentication routes (Supabase)

## Configuration Files

### Models
- `public/config/models.json` - UI model list (what users see)
- `lib/config/default-models.json` - Fallback models

### Build
- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

### Environment
- `.env.local` - Your API keys (gitignored)
- `.env.local.example` - Template (safe to commit)

## Important Files to Never Commit

- ❌ `.env.local` - Contains real API keys
- ❌ `node_modules/` - Dependencies
- ❌ `.next/` - Build output
- ❌ Any file with API keys

## Clean & Organized ✅

The project is now:
- ✅ Properly structured (frontend/backend/docs)
- ✅ Cleaned of unused code
- ✅ Secure (no exposed keys)
- ✅ Ready for GitHub
- ✅ Well-documented

