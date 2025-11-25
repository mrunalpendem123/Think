# Deployment Guide for Private Search AI

This guide covers deployment of the Morphic-based private search AI using Venice AI and Parallel AI.

## Prerequisites

- Venice AI API Key: Get from [https://venice.ai/](https://venice.ai/)
- Parallel AI API Key: Get from [https://parallel.ai/](https://parallel.ai/)

## Local Development

The application is currently running locally at `http://localhost:3000`.

### Start the Development Server

```bash
cd /Users/mrunalpendem/Desktop/think/morphic
npm run dev
```

The application should be accessible at `http://localhost:3000`.

## Vercel Deployment

### 1. Push to GitHub

First, push your code to a GitHub repository:

```bash
cd /Users/mrunalpendem/Desktop/think/morphic
git add .
git commit -m "Integrated Venice AI and Parallel AI"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Configure Environment Variables

In the Vercel dashboard, add these environment variables:

#### Required Variables

```
VENICE_API_KEY=5veQ8IP7eF-x9xvpn-XK0vQPvRC3L8QoyDW-q8o1pX
PARALLEL_API_KEY=sawKl_nOFldN78HAQHFwxixaj90aySp4PTa6trRx
```

#### Optional Variables (for authentication and chat history)

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
```

### 4. Deploy

Click "Deploy" and Vercel will build and deploy your application.

## Setting Up Optional Features

### Supabase Authentication (Optional)

If you want user authentication and chat history:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy the Project URL and anon key
4. Add them to your environment variables

### Redis for Chat History (Optional)

If you want to persist chat history:

1. Create an Upstash Redis database at [upstash.com](https://upstash.com)
2. Go to your database dashboard
3. Copy the REST URL and REST Token
4. Add them to your environment variables

## Available Venice AI Models

The following models are available in the UI:

- **Llama 3.3 70B**: Balanced performance, great for most use cases
- **Qwen3 235B**: Most powerful flagship model for complex tasks
- **Mistral 31 24B**: Vision + function calling support
- **Venice Uncensored**: No content filtering
- **Qwen3 4B**: Smaller, faster model

Users can switch between these models using the dropdown selector in the UI.

## Search Provider

The application uses **Parallel AI** as the sole search provider for web scraping and search results.

## Troubleshooting

### Build Errors

If you encounter dependency issues during build:

```bash
npm install --legacy-peer-deps
npm run build
```

### API Errors

- Verify that your API keys are correct in the environment variables
- Check that the API keys have sufficient credits/permissions
- Review the Vercel deployment logs for detailed error messages

## Architecture

- **LLM Provider**: Venice AI (OpenAI-compatible API)
- **Search Provider**: Parallel AI
- **Frontend**: Next.js 15 with React 19
- **Authentication**: Supabase (optional)
- **Chat Storage**: Redis via Upstash (optional)

## Support

For Venice AI: [https://docs.venice.ai](https://docs.venice.ai)
For Parallel AI: [https://docs.parallel.ai](https://docs.parallel.ai)

