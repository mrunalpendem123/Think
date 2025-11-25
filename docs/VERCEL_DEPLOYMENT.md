# Vercel Deployment Guide

Complete guide to deploy your Private Search AI to Vercel.

## 🚀 Quick Deploy

### Prerequisites
- GitHub repository: https://github.com/mrunalpendem123/Think
- Vercel account: [Sign up at vercel.com](https://vercel.com/signup)
- API Keys from Venice AI and Parallel AI

---

## Step-by-Step Deployment

### 1. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select **`mrunalpendem123/Think`**
5. Click **"Import"**

### 2. Configure Project Settings

**Framework Preset:** Next.js (auto-detected)

**Build Settings:**
- **Build Command:** `npm run build` (default is fine)
- **Output Directory:** `.next` (default is fine)  
- **Install Command:** Uses `.npmrc` automatically

**Root Directory:** Leave as `/` (root)

### 3. Add Environment Variables

Click **"Environment Variables"** and add:

#### Required Variables

| Name | Value | Where to Get |
|------|-------|--------------|
| `VENICE_API_KEY` | Your Venice AI key | [venice.ai](https://venice.ai/) |
| `PARALLEL_API_KEY` | Your Parallel AI key | [parallel.ai](https://parallel.ai/) |

#### Optional Variables (Leave blank if not using)

| Name | Value | Purpose |
|------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | User authentication |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase key | User authentication |
| `UPSTASH_REDIS_REST_URL` | Your Redis URL | Chat history |
| `UPSTASH_REDIS_REST_TOKEN` | Your Redis token | Chat history |
| `ENABLE_SAVE_CHAT_HISTORY` | `false` | Disable chat history |

### 4. Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app will be live at: `https://your-project.vercel.app`

---

## 🔧 Configuration Files

We've included these files to ensure smooth deployment:

### `.npmrc`
```
legacy-peer-deps=true
```
Fixes React 19 peer dependency conflicts during build.

### `vercel.json`
```json
{
  "buildCommand": "npm install --legacy-peer-deps && npm run build",
  "framework": "nextjs",
  "installCommand": "npm install --legacy-peer-deps"
}
```
Ensures Vercel uses the correct install command.

---

## ⚙️ Post-Deployment Configuration

### 1. Add Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain (e.g., `search.yourdomain.com`)
3. Update DNS records as instructed
4. SSL certificate is automatic

### 2. Update Environment Variable

After deployment, update:
```
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

Redeploy for changes to take effect.

### 3. Monitor Usage

- Check Venice AI dashboard for API usage
- Check Parallel AI dashboard for search quota
- Monitor Vercel analytics

---

## 🐛 Troubleshooting

### Build Fails with "ERESOLVE unable to resolve dependency tree"

**Solution:** Already fixed with `.npmrc` file!

### "Invalid Supabase URL" Error

**Solution:** 
- Don't add Supabase variables if you're not using authentication
- Or use dummy values: `https://dummy.supabase.co` and `dummy-key`

### "Parallel AI API error"

**Solution:**
- Verify `PARALLEL_API_KEY` is correct in Vercel dashboard
- Check API key has sufficient quota
- Ensure no extra spaces in the key

### "Venice AI not responding"

**Solution:**
- Verify `VENICE_API_KEY` is correct
- Check API key is active on Venice dashboard
- Monitor API rate limits

### Build Takes Too Long / Times Out

**Solution:**
- This is normal for first build (can take 3-5 minutes)
- Subsequent builds are faster (1-2 minutes)
- Vercel caches dependencies

---

## 📊 Expected Build Output

```
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (7/7)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size
┌ ○ /                                   142 kB
├ ○ /api/chat
├ ○ /api/config/models
└ ○ /search

○  (Static)  prerendered as static content
```

---

## 🎯 Deployment Checklist

Before deploying:
- [x] `.npmrc` file created
- [x] `vercel.json` configured
- [x] API keys ready (Venice + Parallel)
- [x] `.env.local` not in repository
- [x] Security verified

After deploying:
- [ ] Test the live URL
- [ ] Try a search query
- [ ] Verify model selection works
- [ ] Check citations are clickable
- [ ] Monitor API usage

---

## 🔒 Security Notes

- **Never expose API keys** in environment variable screenshots
- **Use Vercel's encrypted environment variables** (they're secure)
- **Rotate keys** if accidentally exposed
- **Monitor usage** to detect unauthorized access

---

## 🚀 Your App Will Be Live At:

`https://your-project-name.vercel.app`

Or with custom domain:
`https://search.yourdomain.com`

---

## 📞 Support

- Vercel Issues: [Vercel Support](https://vercel.com/support)
- Venice AI: [docs.venice.ai](https://docs.venice.ai/)
- Parallel AI: [docs.parallel.ai](https://docs.parallel.ai/)

---

**Deployment should take 2-3 minutes. Your privacy-focused AI search will be live worldwide!** 🌐

