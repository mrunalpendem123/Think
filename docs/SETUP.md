# Private Search AI Setup Guide

A privacy-focused search AI built with Venice AI (LLM) and Parallel AI (Search), based on Morphic frontend.

## 🔒 Security First

**IMPORTANT**: Never commit your `.env.local` file to Git! It contains sensitive API keys.

## 📋 Prerequisites

You'll need API keys from:
1. **Venice AI**: [https://venice.ai/](https://venice.ai/) - For private LLM
2. **Parallel AI**: [https://parallel.ai/](https://parallel.ai/) - For web search

Optional (for authentication & chat history):
3. **Supabase**: [https://supabase.com/](https://supabase.com/) - For user accounts
4. **Upstash Redis**: [https://upstash.com/](https://upstash.com/) - For chat persistence

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd morphic
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:

```bash
# Required
VENICE_API_KEY=your_venice_api_key_here
PARALLEL_API_KEY=your_parallel_api_key_here

# Optional (uncomment and configure if needed)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
# UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
```

### 4. Run Locally

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

To run on a different port:

```bash
PORT=3001 npm run dev
```

## 🎯 Features

- ✅ **Private LLM**: Venice AI models (Llama 3.3 70B, Qwen3 235B, Mistral 31 24B, etc.)
- ✅ **Private Search**: Parallel AI web search
- ✅ **Real-time Results**: Live search results with citations
- ✅ **Multiple Models**: Switch between Venice AI models from UI
- ✅ **Dark Theme**: Modern, privacy-focused interface
- ✅ **Authentication**: Optional Supabase integration
- ✅ **Chat History**: Optional Redis persistence

## 🔧 Configuration

### Available Venice AI Models

The following models are configured (selectable from UI):

- **Llama 3.3 70B** - Balanced performance (recommended)
- **Qwen3 235B** - Most powerful flagship model
- **Mistral 31 24B** - Vision + function calling support
- **Venice Uncensored** - No content filtering
- **Qwen3 4B** - Fast, smaller model

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VENICE_API_KEY` | Yes | Venice AI API key for LLM |
| `PARALLEL_API_KEY` | Yes | Parallel AI API key for search |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `UPSTASH_REDIS_REST_URL` | No | Redis URL for chat history |
| `UPSTASH_REDIS_REST_TOKEN` | No | Redis authentication token |
| `NEXT_PUBLIC_APP_URL` | No | Application URL (default: localhost:3000) |

## 📦 Deployment

### Vercel

1. Push your code to GitHub (make sure `.env.local` is not committed!)
2. Import your repository in [Vercel](https://vercel.com/)
3. Add environment variables in Vercel dashboard:
   - `VENICE_API_KEY`
   - `PARALLEL_API_KEY`
   - (Optional) Supabase and Redis variables
4. Deploy!

### Docker

```bash
# Build
docker build -t private-search-ai .

# Run
docker run -p 3000:3000 \
  -e VENICE_API_KEY=your_key \
  -e PARALLEL_API_KEY=your_key \
  private-search-ai
```

## 🛠️ Development

### Project Structure

```
morphic/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/
│   ├── agents/            # AI agent configurations
│   ├── tools/             # Search and tool implementations
│   │   └── search/
│   │       └── providers/ # Parallel AI integration
│   ├── utils/             # Venice AI registry
│   └── config/            # Model configurations
├── public/
│   └── config/            # Public model config
├── .env.local             # Your API keys (DO NOT COMMIT!)
├── .env.local.example     # Template for environment variables
└── SETUP.md               # This file
```

### Key Files Modified

- `lib/utils/registry.ts` - Venice AI provider integration
- `lib/tools/search/providers/parallel.ts` - Parallel AI search
- `lib/config/default-models.json` - Venice AI models
- `public/config/models.json` - UI model list
- `app/api/chat/route.ts` - Chat API with Venice AI default

## 🔒 Security Checklist

Before pushing to GitHub:

- [ ] `.env.local` is in `.gitignore`
- [ ] No API keys in code files
- [ ] `.env.local.example` has placeholders only
- [ ] `DEPLOYMENT.md` has no hardcoded keys
- [ ] Run: `git status` to check staged files

## 🐛 Troubleshooting

### "messages must not be empty" error
- Make sure Search toggle is ON (blue)
- Select a model from dropdown
- Hard refresh browser (Cmd+Shift+R)

### "Sources: 0" showing
- Verify `PARALLEL_API_KEY` is set correctly
- Check browser console for errors
- Make sure Search mode is enabled

### Models not loading
- Verify `VENICE_API_KEY` is set correctly
- Check `public/config/models.json` is valid
- Clear browser cache

## 📚 Documentation

- [Venice AI Docs](https://docs.venice.ai/)
- [Parallel AI Docs](https://docs.parallel.ai/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

Contributions welcome! Please open an issue or pull request on GitHub.

## 📄 License

Apache-2.0 (inherited from Morphic)

## ⚠️ Important Notes

1. **API Costs**: Both Venice AI and Parallel AI may charge for API usage
2. **Rate Limits**: Be aware of rate limits on both services
3. **Privacy**: This setup is designed for privacy - no data goes to OpenAI/Google
4. **Updates**: Keep your API clients updated for security patches

