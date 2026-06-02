# Project Defense Documentation: DIU EduAI Platform
**Project Title:** DIU EduAI – Advanced AI Teaching, Assessment & Curriculum Portal
**Target Audience:** University Faculty Members, Department Heads, and Academic Administrators
**Institution Context:** Daffodil International University (DIU) / Outcome-Based Education (OBE) Standards

---

## 1. Executive Summary
**DIU EduAI** is a comprehensive, AI-powered academic portal designed to automate and enhance the daily workflows of university professors. It integrates Generative AI, Outcome-Based Education (OBE) curriculum mapping, and secure file management into a single, cohesive dashboard. The platform reduces administrative burnout, ensures accreditation compliance (BAET/ABET standards), and provides intelligent pedagogical support.

## 2. Problem Statement & Motivation
*   **Administrative Overload:** Faculty spend excessive time on manual grading, attendance tracking, and drafting repetitive student feedback.
*   **Accreditation Complexity:** Mapping Course Learning Outcomes (CLOs) to Program Learning Outcomes (PLOs) for OBE compliance is highly manual and error-prone.
*   **Fragmented Tools:** Professors currently juggle disjointed tools for LMS, AI generation, file storage, and capstone supervision.
*   **Capstone Bottlenecks:** Supervising final-year projects lacks standardized tracking for milestones, proposal screening, and originality checks.

## 3. The Solution: Core Value Proposition
DIU EduAI acts as an **AI Co-Pilot for Academia**. It provides a secure, role-based faculty portal that automates routine tasks while maintaining academic rigor, ensuring that educators can focus on mentorship and research rather than paperwork.

---

## 4. Technical Architecture & Stack
*   **Frontend Framework:** React.js (Functional Components, Hooks for state and lifecycle management).
*   **UI/UX Design:** Custom "Premium Dark Academic Theme" (Deep Navy, DIU Green, Academic Gold) utilizing `lucide-react` icons and responsive CSS-in-JS styling.
*   **Backend & Database:** Supabase (PostgreSQL) for secure Authentication (Email/Password) and Row-Level Security.
*   **File Storage:** Supabase Storage Buckets for secure handling of PDFs, PPTX, and DOCX uploads (Syllabi, Capstone Projects, Lecture Notes).
*   **State Persistence:** LocalStorage caching (`gset`/`gget`) for offline resilience and instant UI loading.

### 🧠 AI Engine & Multi-Model Fallback System
The platform features a robust, fault-tolerant AI routing system to ensure 100% uptime for generative tasks:
1.  **Primary (Speed):** Groq API (`llama-3.3-70b-versatile`) for ultra-fast quiz generation and email drafting.
2.  **Secondary (Reasoning):** Google Gemini (`gemini-2.5-flash`) for complex curriculum gap analysis and rubric generation.
3.  **Tertiary (Fallback):** OpenRouter (`gpt-4o-mini`) as a final redundancy layer.
*   *Security:* API keys are environment-managed, and system prompts are strictly tailored to enforce an "expert educational assistant" persona.

---

## 5. Core Modules (The 5 Pillars)

### Pillar 1: Faculty Dashboard
*   **Global Search:** Instant retrieval of students, courses, materials, and projects.
*   **At-a-Glance Analytics:** Stat cards for total students, active courses, pending grades, and capstone supervision load.
*   **Smart Deadlines & Notifications:** Real-time alerts for midterm grading and proposal deadlines.
*   **Quick AI Email Drafter:** Context-aware academic communication generator.

### Pillar 2: Teaching & Assessment
*   **AI Quiz Generator:** Creates MCQs, short-answer, case studies, and True/False questions aligned with specific CLOs.
*   **Automated Grade Book:** CRUD operations with automated weighted grade calculations (Quizzes, Midterms, Finals) and CSV export functionality.
*   **AI Grader & Plagiarism Heuristics:** Evaluates essays against rubrics and detects suspicious writing patterns (patchwriting, style inconsistencies).
*   **Attendance Tracker:** Date-based toggling (Present/Absent/Late) with persistent records.

### Pillar 3: Curriculum Design & OBE Alignment
*   **CLO-PLO Mapper:** Visual mapping of Course Learning Outcomes to standard Engineering Program Outcomes (PO1–PO12 / WK1-WK9).
*   **Gap Analyzer:** AI-driven identification of missing competency areas and over-emphasized topics.
*   **Accreditation Readiness:** Automated checks for BAET/ABET documentation completeness.
*   **Syllabus Manager:** Version-controlled syllabus editing with AI suggestions for emerging industry trends.

### Pillar 4: Teaching Materials & Resources
*   **Resource Library:** Secure upload and in-browser PDF previewing for lecture slides and lab manuals.
*   **Content Generators:** AI tools for creating cheat sheets, lab manuals, interactive lecture hooks, and annotated bibliographies.
*   **FAQ & Chatbot Scripts:** Auto-generates course policies and automated student support scripts.

### Pillar 5: Capstone Supervision
*   **Project Tracker & Milestones:** Visual timeline tracking (Proposal → Literature Review → Implementation → Defense).
*   **AI Proposal Screener:** Evaluates student proposals for technical feasibility, scope, and innovation.
*   **Originality Screening:** Heuristic AI analysis of abstracts and metadata to flag potential plagiarism risks before formal database checks.
*   **Meeting Logs:** Structured advisor-student meeting records with actionable next steps.

---

## 6. Key Innovations & Differentiators
1.  **Strict Academic Prompt Engineering:** Unlike generic AI wrappers, EduAI uses specialized system prompts that enforce constructive, empathetic, and academically rigorous outputs.
2.  **OBE Compliance by Design:** Built specifically to satisfy Outcome-Based Education requirements, making departmental accreditation audits significantly easier.
3.  **Heuristic Plagiarism Detection:** Provides a "first line of defense" for capstone originality without requiring expensive Turnitin API integrations for initial drafts.
4.  **Fault-Tolerant AI Routing:** The multi-provider fallback ensures that if one AI service experiences downtime or rate-limiting, the faculty workflow is not interrupted.

## 7. Impact & Benefits
*   **For Faculty:** Saves 10+ hours per week on administrative tasks, quiz creation, and rubric grading.
*   **For Students:** Receives faster, more consistent, and highly detailed constructive feedback on assignments.
*   **For Administration:** Ensures standardized OBE documentation and centralized tracking of capstone project health across the department.

## 8. Future Scope
*   **LMS Integration:** Direct API syncing with Canvas, Moodle, or Blackboard for automated grade pushing.
*   **Voice-to-Text Meeting Logs:** Audio recording of advisor meetings with automatic AI summarization and action-item extraction.
*   **Predictive Analytics:** Identifying "at-risk" students mid-semester based on attendance and early quiz performance trends.
*   **Peer Review Module:** Facilitating anonymous AI-moderated peer grading among students.

---

## 📊 Suggested Slide Outline for Presentation
*   **Slide 1:** Title & Introduction (The Vision)
*   **Slide 2:** The Problem (Faculty Burnout & OBE Complexity)
*   **Slide 3:** Introducing DIU EduAI (The Solution)
*   **Slide 4:** System Architecture & Tech Stack
*   **Slide 5:** The AI Engine (Multi-Model Fallback System)
*   **Slide 6:** Module Spotlight: Teaching & Assessment Automation
*   **Slide 7:** Module Spotlight: OBE Curriculum Mapping
*   **Slide 8:** Module Spotlight: Capstone Supervision
*   **Slide 9:** Security, Privacy & Data Management
*   **Slide 10:** Impact, Conclusion & Future Roadmap