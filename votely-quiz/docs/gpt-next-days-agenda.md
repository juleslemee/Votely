gpt-next-days-agenda.md

📅 Agenda – April 17

These tasks are scoped to be achievable one prompt at a time in Cursor.
Each is focused, buildable, and aligned with milestone progression.

⸻

🔧 Environment & Setup
	•	Create Next.js app with Tailwind + TypeScript
	•	Choose “No” for Turbopack and import alias
	•	Set up Firebase project in the Firebase Console
	•	Enable Firestore database
	•	Create lib/firebase.ts file and connect your config safely
	•	Confirm Firebase connection with a test read/write in Firestore

⸻

🧱 Landing Page
	•	Wireframe complete (done via ChatGPT image generation)
	•	Create app/page.tsx layout for landing screen
	•	Add CTA button that routes to /quiz

⸻

📄 Quiz Page
	•	Wireframe complete (done)
	•	Create app/quiz/page.tsx layout with question + 4 buttons + progress indicator
	•	Build local state hook to track current question index and selected answers
	•	Store answers in a context or URL param (so user doesn’t lose progress on refresh)
	•	Add basic dummy questions to test UI

⸻

📉 Results Page
	•	Wireframe complete
	•	Create app/results/page.tsx layout
	•	Build component to display quadrant graph with axes and user dot
	•	Generate user quadrant placement based on dummy answers
	•	Add placeholder label + description based on result
	•	Add “Share with Friends” button (copy to clipboard)
	•	Add email input + button (text: “Take the next step →”)

⸻

📬 Email Handling
	•	Create Firestore collection waitlist_submissions
	•	Hook up email form to store submissions in Firestore
	•	Validate email with regex or Zod
	•	Handle success + error states (toast or redirect to thank-you page)

⸻

✅ Thank You Page
	•	Wireframe complete
	•	Create app/thanks/page.tsx layout with simple “You’re on the list” message
	•	Add button to return to homepage or share the quiz

⸻