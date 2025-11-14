# 🧪 Avatar Upload Testing Guide

## Phase 2 Complete - Ready to Test! 🎉

### What Was Built:
✅ **Backend API** - Upload, get, and delete avatar endpoints  
✅ **Image Processing** - Automatic resize, thumbnail generation, WebP conversion  
✅ **Dashboard UI** - Avatar upload widget with preview  
✅ **Security** - File validation, auth protection, cleanup on errors  
✅ **Database** - Media tracking table, user avatar fields  

---

## 🚀 How to Test Locally

### 1. Start the Server
```bash
cd /Users/paulhenshaw/Desktop/better-auh
node app/index.js
```

Server should start on: http://localhost:3000

### 2. Sign In to Dashboard
1. Go to: http://localhost:3000/signin.html
2. Sign in with your existing account (or create one)
3. You'll be redirected to: http://localhost:3000/dashboard.html

### 3. Upload Your Avatar

You should see a new **Avatar Section** at the top with:
- 👤 Avatar placeholder (circle with user icon)
- **Upload Avatar** button
- File size/type hint

**Steps:**
1. Click **"Upload Avatar"** button
2. Select an image file (JPG, PNG, GIF, or WebP)
3. Image will upload automatically
4. You should see:
   - Loading spinner during upload
   - Success message
   - Your avatar displayed in the circle
   - **Delete** button appears

### 4. Test Features

#### ✅ Upload Validation
- ❌ Try uploading a file > 5MB (should fail with error)
- ❌ Try uploading a PDF or TXT file (should fail)
- ✅ Upload JPG, PNG, or GIF (should work)

#### ✅ Avatar Display
- Avatar should display in circular frame
- Border should be purple/accent color
- Image should be cropped to fit circle

#### ✅ Delete Avatar
- Click **"Delete"** button
- Confirm deletion
- Avatar should disappear
- Placeholder icon should return
- Delete button should hide

#### ✅ Re-upload
- Upload a new avatar
- Old avatar should be replaced
- New avatar should display
- Files should be cleaned up (only latest exists)

---

## 🔍 Check Behind the Scenes

### Uploaded Files Location
```bash
# Full size avatars (500x500)
ls -lh storage/avatars/full/

# Thumbnails (150x150)
ls -lh storage/avatars/thumbnails/
```

### Database Records
```bash
# Check user's avatar fields
sqlite3 sqlite.db "SELECT id, name, avatar, avatarThumbnail FROM user WHERE email = 'your-email@example.com';"

# Check media table
sqlite3 sqlite.db "SELECT filename, originalName, size, category, uploadedAt FROM media ORDER BY uploadedAt DESC LIMIT 5;"
```

### API Endpoints (Manual Testing)

**Get Current User (with avatar):**
```bash
# Replace TOKEN with your actual session token from localStorage
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/user/me
```

**Upload Avatar (manual):**
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "avatar=@/path/to/your/image.jpg" \
     http://localhost:3000/api/user/avatar
```

**Delete Avatar:**
```bash
curl -X DELETE \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/user/avatar
```

---

## 🐛 Common Issues & Fixes

### Issue: "No session token provided"
**Fix:** Make sure you're signed in. Check localStorage in browser DevTools for `authToken`.

### Issue: "File too large"
**Fix:** Image must be under 5MB. Resize before uploading.

### Issue: Avatar doesn't display
**Fix:** 
1. Check browser console for errors
2. Verify file was uploaded: `ls storage/avatars/full/`
3. Check network tab - is image loading from `/uploads/avatars/thumbnails/...`?

### Issue: Upload button does nothing
**Fix:**
1. Open browser DevTools console
2. Look for JavaScript errors
3. Make sure server is running
4. Hard refresh page (Cmd+Shift+R)

---

## 📊 What to Look For

### Success Indicators:
- ✅ Avatar uploads in < 2 seconds
- ✅ Image is resized to exactly 500x500 (full) and 150x150 (thumbnail)
- ✅ Files are in WebP format (smaller size)
- ✅ Old avatars are deleted when uploading new ones
- ✅ Database has media record with correct user ID
- ✅ No orphaned files in storage/temp/
- ✅ Avatar displays on refresh (persists)

### Performance Check:
```bash
# Check file sizes (should be optimized)
du -h storage/avatars/full/*
du -h storage/avatars/thumbnails/*
```

WebP thumbnails should be ~10-30KB for most images!

---

## 🎯 Next Steps

After confirming local testing works:

### Option 1: Deploy to Production
```bash
git push origin main
# Coolify will auto-deploy
# Test at: https://auth.supersoul.top/dashboard.html
```

**Don't forget:** Add persistent storage in Coolify if not already set up!

### Option 2: Continue to Phase 3
Build the **Admin Media Library** for managing all uploaded files:
- Upload multiple files
- Browse media gallery
- Delete/organize files
- Copy URLs
- Search and filter

---

## 📸 Testing Checklist

- [ ] Start server successfully
- [ ] Sign in to dashboard
- [ ] See avatar section with placeholder
- [ ] Click upload button - file selector opens
- [ ] Select valid image - uploads successfully
- [ ] Avatar displays in circle
- [ ] Delete button appears
- [ ] Click delete - avatar removes
- [ ] Placeholder returns
- [ ] Upload new avatar - replaces cleanly
- [ ] Refresh page - avatar persists
- [ ] Check storage folders - files exist
- [ ] Check database - records correct
- [ ] Try invalid file - shows error
- [ ] Try large file (>5MB) - shows error

---

## 🎨 UI Preview

```
┌──────────────────────────────────────┐
│  📊 Dashboard                        │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Avatar Section                │ │
│  │  ┌──────────┐                  │ │
│  │  │          │                  │ │
│  │  │    👤    │  ← Placeholder   │ │
│  │  │          │     (or image)   │ │
│  │  └──────────┘                  │ │
│  │                                │ │
│  │  [📤 Upload Avatar] [🗑️ Delete] │ │
│  │  Max 5MB • JPG, PNG, GIF, WebP │ │
│  └────────────────────────────────┘ │
│                                      │
│  User Info:                          │
│  Name: John Doe                      │
│  Email: john@example.com             │
│  ...                                 │
└──────────────────────────────────────┘
```

---

## 💡 Tips

1. **Use small test images first** (~500KB) to verify everything works
2. **Check browser DevTools Network tab** to see upload progress
3. **Watch server logs** for any errors during upload
4. **Clear browser cache** if you see stale images
5. **Test different image formats** (JPG, PNG, GIF)

---

## 🚀 Ready?

1. Start the server: `node app/index.js`
2. Open: http://localhost:3000/dashboard.html
3. Upload your avatar!
4. Report back with results! 😊

---

**Questions? Issues?** Let me know and I'll help debug! 🛠️
