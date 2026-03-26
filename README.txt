STYL Live Sync Firebase Version

FILES
- index.html                File-based dashboard (GitHub profile.json method)
- admin.html                File-based phone builder
- profile.json              File-based live profile
- app.js                    File-based dashboard logic
- admin.js                  File-based admin builder
- live.html                 TRUE live-sync dashboard (Firebase)
- admin-live.html           TRUE live-sync admin page for your phone
- dashboard-firebase.js     Firebase dashboard listener
- admin-firebase.js         Firebase admin saver
- firebase-config.js        Fill this in with your Firebase project values
- firebase-config.example.js Example Firebase config
- styles.css               Shared styling
- qr_premium.png / qr_plain.png
- BOOKING_URL.txt

WHAT YOU WILL USE
If you want true live sync:
1) Put the tablet on live.html
2) Put your phone on admin-live.html
3) Save changes from phone
4) Tablet updates instantly

SETUP STEPS FOR TRUE LIVE SYNC
1. Create a Firebase project
   - Go to Firebase console
   - Add a web app

2. Enable Firestore Database
   - Create database in production or test mode
   - Collection name: styl
   - Document name: liveProfile

3. Fill in firebase-config.js
   - Copy values from your Firebase web app settings
   - Save the file

4. Upload all files to GitHub Pages
   - live.html
   - admin-live.html
   - dashboard-firebase.js
   - admin-firebase.js
   - firebase-config.js
   - styles.css
   - qr files
   - plus the standard files

5. On your tablet
   - Open live.html
   - Keep it open in kiosk browser or Chrome

6. On your phone
   - Open admin-live.html
   - Enter client details
   - Tap Save Live Profile

7. Result
   - The tablet changes instantly without touching it

PHONE-ONLY WORKFLOW
1. Open admin-live.html on your phone
2. Type the client name, trip, and mode
3. Tap Save Live Profile
4. Wait 1 to 2 seconds
5. Tablet updates automatically

FIRESTORE SECURITY RULES (starter example)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /styl/liveProfile {
      allow read: if true;
      allow write: if true;
    }
  }
}
For real production, lock this down later with authentication.

BEST PRACTICE
- Test first in Chrome on both phone and tablet
- Once working, point kiosk browser to live.html
- Use admin-live.html only on your phone

VOICE CONTROL
- Still included on the dashboard
- Best in Chrome on Android


Cleaned dashboard updates:
- removed AI chip row
- removed voice controls
- restored tab labels with icons
- larger iframe area
- animated time-of-day greeting with guest name


Ultra luxury cinematic mode updates:
- cinematic gold particle greeting area
- removed premium QR text
- added Join Our VIP button in QR area
- VIP button opens Jotform inside iframe (replace config.vipFormUrl with your exact Jotform link)
- voice controls removed


VIP form is now set to: https://stylblackcar.com/contact/
Configured for Option A: open inside dashboard iframe.


Tabs fix rebuild:
- rebuilt live dashboard tab navigation so all tab buttons work again
- removed Smart Greeting / Voice Shortcuts / Trip Mode rows everywhere
- kept cinematic greeting headline plus scrolling ribbon only
- slowed and enlarged scrolling text


Iframe-only rebuild:
- News locked to ABC News YouTube embed inside iframe
- Sports locked to YouTube sports playlist embed inside iframe
- no external news/sports launches
- all tabs stay inside dashboard


Admin-controlled News/Sports version:
- You can manually change the News embed link from admin-live.html
- You can manually change the Sports embed link from admin-live.html
- Save on your phone, and the tablet updates instantly through Firebase
- Everything stays inside the iframe


Option 2 preset-button version:
- Quick Presets added to admin-live.html
- ABC News button fills the news link and saves instantly
- Sports Feed button fills the sports link and saves instantly
- Executive Music button switches mode and saves instantly
- No copy-paste needed for common actions
