# Jobvio

A modern web application that connects job seekers with employers. This project features secure role-based access, real-time search filters, resume uploads, and isolated dashboards for both Candidates and Recruiters.

## Key Features

- **Dual-Role Architecture:** Users can onboard as either a "Candidate" or a "Recruiter", unlocking entirely different UI workflows and permissions.
- **Advanced Authentication:** Seamless and secure login, signup, and session management powered by Clerk.
- **Real-time Filtering:** Instantly filter jobs by title, company, or location.
- **Rich Text Job Postings:** Recruiters can format job descriptions using a built-in Markdown editor.

## Tech Stack

**Frontend:**

- React.js
- Tailwind CSS
- Shadcn UI
- React Router

**Backend & Auth:**

- Supabase
- Clerk

## Getting Started

Follow these instructions to run the project locally on your machine.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository

```bash
git clone https://github.com/afzytk/jobvio.git
cd jobvio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Create a `.env` file in the root of your project and add the following keys. You will need to get these from your Clerk and Supabase dashboards.

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## Database Schema (Supabase)

This project utilizes the following relational tables:

- `companies`: Stores company details and logo URLs.
- `jobs`: Stores job postings, linked to companies and recruiter IDs.
- `saved_jobs`: Links candidate IDs to specific jobs for bookmarking.
- `applications`: Stores applicant details, uploaded resume links, and hiring status.

---
