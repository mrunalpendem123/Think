# ⚡ Vercel Environment Variables - DO THIS NOW!

## 🎯 Your code is pushed! Vercel is deploying...

**BUT** it will **FAIL** without these environment variables!

---

## 🚨 STEP 1: Get WalletConnect Project ID (2 minutes)

**This fixes the 403 Forbidden error!**

1. Go to: **https://cloud.walletconnect.com/sign-in**
2. **Sign in** with GitHub or Email
3. Click **"+ Create"** or **"New Project"**
4. Enter:
   - **Name:** `Private Search AI`
   - **Description:** `Privacy-focused AI search`
5. Click **Create**
6. **COPY the Project ID** - it looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

## 🔥 STEP 2: Add to Vercel (3 minutes)

### Go to Vercel:
1. Open your project: **https://vercel.com/dashboard**
2. Click your project name
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)

### Add ALL 6 variables:

**For EACH variable:**
- Click **"Add New"**
- Enter the **Key** (left box)
- Enter the **Value** (right box)
- Check **ALL 3 boxes:** Production ✓ Preview ✓ Development ✓
- Click **Save**

---

### 🔑 **COPY-PASTE THESE:**

**Variable 1:**
```
Key: VENICE_API_KEY
Value: 5veQ8IP7eF-x9xvpn-XK0vQPvRC3L8QoyDW-q8o1pX
```

**Variable 2:**
```
Key: PARALLEL_API_KEY
Value: sawKl_nOFldN78HAQHFwxixaj90aySp4PTa6trRx
```

**Variable 3:**
```
Key: UPSTASH_REDIS_REST_URL
Value: https://safe-oriole-32099.upstash.io
```

**Variable 4:**
```
Key: UPSTASH_REDIS_REST_TOKEN
Value: AX1jAAIncDJkNmVkMzgxNDQ5N2M0Y2M3YjdlYjQ5NTQyNTA0ZTYyY3AyMzIwOTk
```

**Variable 5:**
```
Key: ENABLE_SAVE_CHAT_HISTORY
Value: true
```

**Variable 6:** ⚠️ **USE YOUR PROJECT ID FROM STEP 1!**
```
Key: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
Value: YOUR_PROJECT_ID_HERE
```

---

## 🔄 STEP 3: Redeploy

After adding all 6 variables:

1. Go to **Deployments** tab (top menu)
2. Find the latest deployment (should say "Failed" or "Building")
3. Click the **...** (three dots) on the right
4. Click **"Redeploy"**
5. ✅ **Watch it build successfully!**

**Build time: ~2-3 minutes**

---

## ✅ CHECKLIST:

- [ ] Created WalletConnect Project ID at cloud.walletconnect.com
- [ ] Added `VENICE_API_KEY` to Vercel
- [ ] Added `PARALLEL_API_KEY` to Vercel
- [ ] Added `UPSTASH_REDIS_REST_URL` to Vercel
- [ ] Added `UPSTASH_REDIS_REST_TOKEN` to Vercel
- [ ] Added `ENABLE_SAVE_CHAT_HISTORY` to Vercel
- [ ] Added `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` to Vercel (YOUR OWN!)
- [ ] Clicked "Redeploy" in Vercel
- [ ] Deployment succeeded (green checkmark)
- [ ] Tested wallet connection
- [ ] Tested chat history

---

## 🧪 After Deployment Succeeds:

1. **Open your live app** (Vercel gives you a URL like: `your-app.vercel.app`)
2. Click **"Connect Wallet"**
3. Connect MetaMask
4. Turn ON **Search toggle** (blue)
5. Ask: "what's the weather in New York?"
6. **Check sidebar** → Your chat appears!
7. Refresh page
8. ✅ **Chat history still there!**

---

## 🆘 If Deployment Still Fails:

### Check Build Logs:
1. Go to **Deployments** tab
2. Click on the failed deployment
3. Click **"View Build Logs"**
4. Look for the error message

### Common Issues:

**"Module not found"** → Already fixed! Just redeploy.

**"Selected provider is not enabled venice"** → Missing `VENICE_API_KEY` in Vercel

**"403 Forbidden"** → Need YOUR OWN WalletConnect Project ID (not the fallback)

**"Chat history empty"** → Missing `ENABLE_SAVE_CHAT_HISTORY=true` or Redis credentials

---

## 📊 What You'll Have:

✅ **Private AI Search** - Venice AI (no data retention)  
✅ **Private Web Search** - Parallel AI (no tracking)  
✅ **Wallet Login** - RainbowKit (200+ wallets)  
✅ **Chat History** - Redis (your wallet = your data)  
✅ **Multi-Chain** - Polygon, Ethereum, Optimism, Arbitrum, Base  

**Zero personal information collected. Maximum privacy.** 🔐

---

## 🎉 Once Live:

**Update this in Vercel:**
```
Key: NEXT_PUBLIC_APP_URL
Value: https://your-actual-domain.vercel.app
```

(Replace with your real Vercel URL)

---

**⏱️ Total time: ~10 minutes**

**🚀 You'll have the world's most private AI search!**

