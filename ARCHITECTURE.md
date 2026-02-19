# Application Architecture

## Current Setup

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React App (Frontend)                         │   │
│  │  - Runs in the browser                               │   │
│  │  - Sends form data via fetch()                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP POST Request
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Apps Script (Backend)                    │
│  - Runs on Google's servers                                 │
│  - Receives form data                                       │
│  - Writes to Google Sheets                                  │
│  - Returns success/error response                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Writes Data
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Sheets (Database/Storage)                 │
│  - Stores RSVP submissions                                  │
│  - Acts as a simple database                                │
└─────────────────────────────────────────────────────────────┘
```

## What Each Component Does

### 1. React App (Frontend)
- **Location**: Runs in the user's browser
- **Hosting**: Needs to be hosted separately (Netlify, Vercel, GitHub Pages, etc.)
- **Purpose**: User interface, form handling, displays content

### 2. Google Apps Script (Backend Endpoint)
- **Location**: Runs on Google's servers
- **Hosting**: Automatically hosted by Google (no setup needed)
- **Purpose**: Receives form submissions and writes to Google Sheets
- **Note**: This is NOT Node.js - it's Google's own JavaScript runtime

### 3. Google Sheets (Database)
- **Location**: Google's cloud storage
- **Hosting**: Automatically hosted by Google
- **Purpose**: Stores the RSVP data in a spreadsheet format

## Hosting Options for Your React App

Since Google Sheets/Apps Script only handles the backend, you still need to host your React frontend:

### Free Options:
1. **Netlify** (Recommended)
   - Connect your GitHub repo
   - Automatic deployments
   - Free SSL certificate
   - Custom domain support

2. **Vercel**
   - Similar to Netlify
   - Great for React apps
   - Automatic deployments

3. **GitHub Pages**
   - Free hosting for static sites
   - Requires build step
   - Limited features

4. **Firebase Hosting**
   - Google's hosting service
   - Free tier available
   - Easy integration

### Paid Options:
- AWS S3 + CloudFront
- DigitalOcean App Platform
- Heroku
- Any VPS provider

## Important Notes

### ❌ What Google Sheets CANNOT Do:
- Host your React/Node.js application
- Run server-side Node.js code
- Act as a traditional web server
- Handle complex backend logic

### ✅ What Google Sheets/Apps Script CAN Do:
- Store data (like a simple database)
- Process form submissions (via Apps Script)
- Act as a simple API endpoint
- No server management needed

## If You Need a Full Node.js Backend

If you need more complex backend functionality (authentication, complex APIs, etc.), you would need:

1. **Host a Node.js server** on:
   - Heroku
   - DigitalOcean
   - AWS EC2
   - Railway
   - Render

2. **Use the Node.js Google Sheets API** instead of Apps Script:
   ```javascript
   // Example using googleapis npm package
   const { google } = require('googleapis');
   // ... write to sheets using Node.js
   ```

## Current Solution Benefits

✅ **Pros:**
- No backend server to manage
- Free (Google Apps Script is free)
- Easy setup
- Automatic scaling
- No server maintenance

❌ **Limitations:**
- Limited to simple CRUD operations
- Execution time limits (6 minutes max)
- Rate limiting
- Less control over the backend

## Summary

- **Google Sheets**: Database/Storage (not hosting)
- **Google Apps Script**: Backend endpoint (hosted by Google, not Node.js)
- **React App**: Frontend (needs separate hosting)

Your React app still needs to be hosted somewhere like Netlify or Vercel!
