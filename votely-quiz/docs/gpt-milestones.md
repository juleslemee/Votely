# gpt-milestones.md

## 🗳 Votely Survey – Milestone Tracker
A political identity quiz and civic engagement funnel app for young adults.
Built with: **Next.js**, **Tailwind CSS**, **Firebase Firestore**, deployed on **Vercel**.

---

## 🎯 MVP Objective
Create a fast, mobile-first web app that:
- Guides users through a short political quiz
- Displays their position on a quadrant
- Captures their email for a future civic engagement app
- Allows them to share results easily

---

## 🏁 Milestone 1: Project Setup (Tech Foundations)
✅ Next.js project initialized with Tailwind and TypeScript  
✅ Project structured with `/app` router, `lib/`, `components/`, `styles/` folders  
🔲 Firebase project created + Firestore enabled  
🔲 Firebase config connected in `lib/firebase.ts` with safe initialization pattern  
🔲 Set up Vercel project and environment variables  

---

## 🧪 Milestone 2: Quiz Engine
🔲 Build quiz page layout with Tailwind (question text, 4 buttons, progress bar)  
🔲 Implement question logic using local state or context (7-question flow)  
🔲 Store answer selections for result calculation  
🔲 Write logic to calculate user quadrant position (simple 2D mapping)  
🔲 Ensure quiz is fully responsive on mobile

---

## 📊 Milestone 3: Results Page
🔲 Design quadrant chart layout (no grid, just axes + point)  
🔲 Dynamically place user dot based on answers  
🔲 Display quadrant label + 1-paragraph description  
🔲 Add "Share with Friends" button (copy link or social share)  
🔲 Add email input field to join waitlist  
🔲 Store email submissions in Firestore with validation  

---

## 🚀 Milestone 4: Waitlist Funnel
🔲 Add follow-up CTA screen: describe upcoming app value prop  
🔲 Let user enter email again to join waitlist (if not already)  
🔲 Add CTA button: “Drive change” or similar  
🔲 Confirm user with a clean thank-you page: “You’re on the list” + share option  

---

## 🛡 Milestone 5: Data and Error Handling
🔲 Validate email inputs using Zod or inline logic  
🔲 Sanitize and structure Firestore documents correctly  
🔲 Handle empty states, refresh edge cases (e.g. mid-quiz reload)  
🔲 Add basic analytics tracking (e.g. `quiz_started`, `result_viewed`, `email_submitted`)  

---

## 🎨 Milestone 6: Polish and Launch
🔲 Add smooth screen transitions or page animations  
🔲 Clean Tailwind spacing, fonts, button states  
🔲 Mobile responsiveness check across all pages  
🔲 Deploy final version to Vercel  
🔲 Test email capture & Firebase writes on production

---

## 💡 Future Feature Ideas (Post-MVP, in the mobile app)
- Localized civic actions (pull from Google Civic API)
- Track civic streaks / gamification
- Notifications for elections or issues
- User login / dashboard
- Data visualization of quiz trends
- Referral system for growing waitlist

---