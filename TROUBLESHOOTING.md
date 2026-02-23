# 🔧 Troubleshooting Guide - AI Study Buddy

## Current Issues & Solutions

### Issue: "Loading but nothing happens when I choose option"

#### Possible Causes:
1. Models are downloading in background (takes 2-5 minutes first time)
2. Browser doesn't support required features
3. Permissions not granted
4. CORS/COOP/COEP headers issue

---

## ✅ FIXES APPLIED

### 1. Fixed Quiz Me Tab
**Problem:** Dependency array issue causing infinite loop
**Solution:** Reordered `generateNextQuestion` before `startQuiz` and added to dependencies

### 2. Added Diagnostics Tab
**New Feature:** Debug tab to check SDK status, models, and browser compatibility
**Location:** First tab (🔍 Debug)

---

## 📋 Step-by-Step Testing Instructions

### STEP 1: Check Diagnostics Tab (IMPORTANT!)

1. Open http://localhost:5174/
2. Click the "🔍 Debug" tab (first tab)
3. Check the information displayed:

**What you should see:**
```
SDK Status: SDK Initialized ✓
Registered Models: 5
- lfm2-350m-q4_k_m (Language)
- lfm2-vl-450m-q4_0 (Multimodal)
- sherpa-onnx-whisper-tiny.en (SpeechRecognition)
- vits-piper-en_US-lessac-medium (SpeechSynthesis)
- silero-vad-v5 (Audio)

Browser Info:
WebAssembly: ✓ Supported
SharedArrayBuffer: ✓ Available
```

**If you see errors:**
- Take a screenshot and share the error message
- Check browser console (F12) for detailed errors

---

### STEP 2: Test Each Feature Properly

#### 🎯 Quiz Me (Simplest - Test This First!)

1. Click "🎯 Quiz" tab
2. **IMPORTANT:** Enter a topic in the text box (e.g., "JavaScript")
3. Select difficulty
4. Click "Start Quiz"
5. **WAIT:** You'll see "Loading models..." - this takes 30 seconds to 2 minutes
6. **FIRST TIME:** Model downloads automatically (250MB) - takes 2-5 minutes
7. After loading, you'll see a question with 4 options

**Expected Timeline:**
```
Click Start Quiz → 0s
Loading models... → 5-120s (first time with download)
Generating question... → 5-15s
Question appears → Ready to answer!
```

**If stuck on "Loading models...":**
- Check browser console (F12 → Console tab)
- Look for download progress or errors
- Internet connection required for model download

---

#### 🎙️ Voice Q&A

1. Click "🎙️ Voice Q&A" tab
2. Click "Ask a Question"
3. **Grant microphone permission** when browser prompts
4. **WAIT:** 4 models need to download first time (~425MB total)
   - This can take 3-7 minutes on first use
5. Speak your question
6. Wait for AI response (spoken back to you)

**Common Issues:**
- **Microphone blocked:** Check browser permissions
- **No sound:** Check volume settings
- **Stuck loading:** Check diagnostics tab for errors

---

#### 📷 Visual Learning

1. Click "📷 Visual" tab  
2. Click "Start Camera"
3. **Grant camera permission** when prompted
4. **WAIT:** VLM model downloads (~500MB) - takes 3-5 minutes first time
5. Point camera at text/image
6. Click "Analyze Image"
7. Wait 5-10 seconds for analysis

**Common Issues:**
- **Camera blocked:** Check browser settings → Camera permissions
- **No camera found:** Use device with camera
- **Processing too slow:** Use better lighting

---

#### 📝 Smart Notes

1. Click "📝 Notes" tab
2. Click "Start Recording"
3. **Grant microphone permission**
4. **WAIT:** Models download first time (~375MB)
5. Speak continuously
6. Watch live transcript appear
7. Click "Save & Summarize"
8. View AI-generated summary

---

## 🐛 Common Problems & Solutions

### Problem: "Nothing happens after clicking button"

**Check These:**
1. Open browser console (F12)
2. Look for JavaScript errors
3. Check Network tab for failed downloads
4. Verify internet connection (needed for model download)

**Solutions:**
```
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Try different browser (Chrome 120+)
4. Check firewall isn't blocking downloads
```

---

### Problem: "Loading takes forever"

**This is NORMAL on first use!**

Model downloads are large:
- Quiz Me: ~250MB (2-4 minutes)
- Voice Q&A: ~425MB (3-7 minutes)
- Visual Learning: ~500MB (3-5 minutes)
- Smart Notes: ~375MB (3-6 minutes)

**Progress indicators:**
- Check Diagnostics tab
- Browser console shows download progress
- Network tab shows file downloads

**After first download:**
- Models cache in browser
- Future loads are instant (<3 seconds)

---

### Problem: "Permission denied"

**For Microphone:**
1. Chrome: Settings → Privacy → Site Settings → Microphone
2. Allow localhost:5174

**For Camera:**
1. Chrome: Settings → Privacy → Site Settings → Camera
2. Allow localhost:5174

---

### Problem: "SharedArrayBuffer not available"

**Solution:**
The dev server should automatically set COOP/COEP headers.

**Check:**
1. F12 → Network tab
2. Click any file
3. Look for Response Headers:
   - `Cross-Origin-Opener-Policy: same-origin`
   - `Cross-Origin-Embedder-Policy: credentialless`

**If missing:**
```bash
# Restart dev server
Ctrl+C
npm run dev
```

---

## 🔍 Debug Mode Instructions

### Using the Diagnostics Tab:

1. **Open Diagnostics Tab** (🔍 Debug)

2. **Check SDK Status**
   - Should say "SDK Initialized ✓"
   - If error, note the message

3. **Check Models List**
   - Should show 5 models
   - Check each model's status:
     - `not-downloaded` = needs download
     - `downloaded` = ready to load
     - `loaded` = currently active

4. **Check Browser Info**
   - WebAssembly must be "✓ Supported"
   - SharedArrayBuffer should be "✓ Available"

5. **Click "Refresh Diagnostics"**
   - Updates status after model downloads

---

## 📊 Expected Behavior Timeline

### First Time User Experience:
```
1. Open app → SDK loads (2s)
2. Navigate to feature → Model banner appears
3. Click action → "Downloading models..." (2-7 min)
4. Download completes → "Loading..." (5-15s)
5. Feature ready → Use normally

Total first-time wait: 3-10 minutes per feature
```

### Returning User Experience:
```
1. Open app → SDK loads (2s)
2. Navigate to feature → Instant
3. Click action → "Loading..." (3-5s)
4. Feature ready → Use normally

Total wait: 5-10 seconds
```

---

## 🌐 Browser Console Commands

Open Console (F12 → Console) and run:

### Check if SDK is loaded:
```javascript
console.log('SDK loaded:', typeof RunAnywhere !== 'undefined');
```

### Check models:
```javascript
// This won't work directly, but errors here tell you SDK isn't loaded
```

---

## ❓ What to Report if Still Not Working

Please provide:

1. **Browser & Version**
   - Example: Chrome 120.0.6099.129

2. **Operating System**
   - Example: Windows 11

3. **Diagnostics Tab Screenshot**
   - Shows SDK status and models

4. **Browser Console Errors**
   - F12 → Console tab
   - Screenshot any red errors

5. **Network Tab**
   - F12 → Network tab
   - Look for failed requests (red)
   - Screenshot if any

6. **Specific Behavior**
   - Which tab you're testing
   - Exact steps you took
   - How long you waited
   - What you expected vs what happened

---

## ✅ Quick Test Checklist

- [ ] App loads at http://localhost:5174/
- [ ] 🔍 Debug tab shows "SDK Initialized ✓"
- [ ] WebAssembly shows "✓ Supported"
- [ ] Can switch between tabs
- [ ] Tried Quiz Me tab (simplest to test)
- [ ] Entered a topic and clicked Start Quiz
- [ ] Waited at least 2 minutes for models
- [ ] Checked browser console for errors
- [ ] Granted any permission prompts

---

## 🆘 If Nothing Works

1. **Try Simple Build Test:**
```bash
# Kill server: Ctrl+C
npm run build
npm run preview
```

2. **Clear Everything:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

3. **Try Different Browser:**
- Chrome 120+
- Microsoft Edge 120+

4. **Check System Requirements:**
- 4GB+ RAM available
- Modern CPU (2015+)
- Internet connection for downloads

---

## 📞 Next Steps

1. **Start with Diagnostics Tab**
   - http://localhost:5174/
   - Click 🔍 Debug
   - Take screenshot

2. **Try Quiz Me Tab**
   - Simplest feature
   - No permissions needed
   - Only LLM model

3. **Report Results**
   - What worked
   - What didn't
   - Any error messages
   - Screenshots

---

**Server is running at: http://localhost:5174/**

Open this URL in Chrome or Edge and start with the Diagnostics tab!
