# ISTQB CTFL Practice Examinations

A browser-based practice platform for the **ISTQB Certified Tester Foundation Level (CTFL) v4.0** examination. It uses the official ISTQB sample exams (Sets A to D) and their published answer keys, and offers two ways to practise:

- **Real-Time Examination** – simulates the actual exam: 40 questions, 60 minutes, 26 points (65%) to pass. Answers and explanations stay hidden until you submit or time runs out.
- **Interactive Learning** – no time limit; you get immediate feedback, official explanations and a link to the relevant syllabus section after every answer.

It is a **frontend-only** app. There is no backend, database, login or account. Question content is static JSON, and your progress is kept in the browser's `sessionStorage`, so it disappears when the tab is closed.

Built with React, TypeScript and Vite, with no other runtime dependencies.

---

## Running it locally

**Requirements:** Node.js 18 or newer and npm.

```bash
npm install        # install dependencies (once)
npm run dev        # start the development server, then open the URL it prints (usually http://localhost:5173)
```

Other commands:

```bash
npm run build      # type-check and create a production build in dist/
npm run preview    # serve the production build locally (http://localhost:4173)
```

The production build in `dist/` is plain static files. It can be hosted on any static host or opened through any simple web server. It uses relative paths and hash-based navigation, so no server configuration is needed.

---

## Using the app

The top bar has five sections.

| Section | What it does |
|---|---|
| **Home** | Welcome page with the two entry points (Real-Time Examination and Interactive Learning). After you have practised it shows questions attempted, overall accuracy, completed examinations, your three most recent results and accuracy by syllabus chapter. |
| **Practice Examinations** | Choose an examination paper from the drop-down, see its details (questions, marks, pass mark, duration, syllabus version, document version), then start either mode. |
| **Interactive Learning** | Start a learning session on a full paper, on a single syllabus chapter, or on the questions you previously answered incorrectly. Resumes an unfinished session. |
| **Results and Progress** | Session analytics, examination history, incorrect-answer review and export. |
| **Syllabus Reference** | Browse and search the CTFL v4.0.1 syllabus. |

### Typical flow

1. Go to **Practice Examinations** and pick a paper (for example *Sample Exam B*).
2. Choose **Real-Time Examination** or **Interactive Learning**.
3. Work through the questions, then check **Results and Progress** to see where to revise.
4. Follow the syllabus links to the sections you need to study.

---

## Features

### Real-Time Examination
- Instructions screen first; the timer starts only when you press **Begin examination**.
- Optional **+25% time** for candidates whose native language is not the exam language (as allowed by the ISTQB exam rules). It is off by default.
- Question navigation panel showing answered, unanswered, flagged and current questions. No correct/incorrect colours are used during the exam.
- Previous / Next, **Flag for review**, **Next flagged question**, and **Clear answer**.
- Multiple-select questions ("Select TWO options") stop you choosing more than the allowed number.
- Countdown based on an absolute deadline, so it stays accurate if the tab is in the background. It turns red in the last five minutes.
- **Refresh-safe:** the timer, answers, flags and current question are restored. Refreshing does not restart the clock.
- Confirmation dialog before submitting, showing total, answered, unanswered and flagged counts.
- **Automatic submission** when time expires. Answers are locked after submission.
- During the exam nothing reveals answers, explanations or syllabus references.

### Results and review (after an examination)
- Total, correct, incorrect and unanswered questions, marks, percentage, pass/fail and time taken.
- Performance by syllabus chapter.
- Question-by-question **review** with your answer, the correct answer, the official explanation of each option and the syllabus chapter, section and learning objective.
- Print, **Download PDF** and **Download JSON** for the result.

### Interactive Learning
- Immediate feedback: correct answers in green, incorrect selections in red with the correct answer shown in green, plus a clear "Correct Answer" or "Incorrect Answer" label.
- Official explanations (why the correct answer is right and why your choice was not), with the other options in a collapsible section.
- Change your answer at any time and the feedback is recalculated.
- Unattempted questions never reveal their answers.
- **Syllabus Reference** box linking straight to the relevant syllabus section, with the learning objective highlighted.
- Flag for review, navigation panel, progress line and a **session summary** (accuracy, chapter breakdown, incorrect questions, practise again, practise incorrect answers only).
- **Chapter practice:** practise any of the six chapters across all papers.
- **Revision:** a set built from questions you answered incorrectly (in either mode). A question leaves the set once you answer it correctly.

### Syllabus Reference
- Chapters and sections as in the official syllabus, with learning objectives (including K-levels) and syllabus text.
- Search across titles, learning objectives and body text.
- Deep links such as `#syllabus/4.2/FL-4.2.1`, used by the question reviews.

### Results and Progress
- Examinations completed, pass rate, average score, answers recorded, unique questions and overall accuracy.
- Chapter accuracy bars; chapters below 65% (with at least three answers) are flagged for revision.
- Examination history table with a filter for examinations not passed and a comparison against your previous attempt of the same paper.
- Frequently answered incorrectly questions, each expandable to show the correct answer and explanation.
- Print, **Download PDF** and **Download JSON** of the full session summary. The files are generated in your browser; nothing is uploaded.

---

## Exam rules used

Taken from the supplied *ISTQB Exam Structures and Rules v1.2* and *Exam Structure Tables (CTFL v4.0)*:

- 40 multiple-choice questions, each worth exactly one point (40 points in total).
- Pass mark 65%, which is 26 points.
- 60 minutes (plus 25% if the candidate's native language is not the exam language).
- The supplied documents define no partial marks, so a question with two correct answers is scored **all-or-nothing**.

Every 40-question paper in the app matches the official structure: 8/6/4/11/9/2 questions across chapters 1 to 6, and 8 K1, 24 K2 and 8 K3 questions.

### Available papers

| Paper | Questions | Syllabus version |
|---|---|---|
| Sample Exam A | 40 | 4.0.1 |
| Sample Exam A (Additional Questions) | 26 | 4.0.1 |
| Sample Exam B | 40 | 4.0.1 |
| Sample Exam C | 40 | 4.0 |
| Sample Exam D | 40 | 4.0 |

The additional questions published with Sample Exam A are not part of the 40-question exam structure and have no defined duration or pass mark, so they are available in Interactive Learning only.

---

## Project structure

```
src/
  components/      examination/, learning/, results/, common/
  data/            examinations.json, examination-rules.json, syllabus.json, questions/*.json
  hooks/           useExamSession, useLearningSession, useTimer
  pages/           Home, PracticeExaminations, RealTimeExamination, InteractiveLearning,
                   ResultsProgress, SyllabusReference
  services/        answerEvaluator, resultsService, progressService, analyticsService,
                   learningService, examinationService, exportService
  types/ utils/    shared types, sessionStorage helpers, formatting helpers
public/figures/    images for questions containing diagrams or tables
scripts/           Python scripts that build the JSON data from the source PDFs
```

### Adding or changing content
Examinations are listed in `src/data/examinations.json`, and each one points to a question file in `src/data/questions/`. The papers shown in the drop-down come from that file, so a new paper is added by adding its question JSON and one entry in `examinations.json`. No code change is needed.

The `scripts/` folder (`extract.py`, `build_syllabus.py`, `build_data.py`) regenerates the data from the ISTQB PDFs. It needs Python 3 with `pdfplumber` and `Pillow`, plus `pdftotext` (poppler). The input and output paths at the top of each script point at the original working folders, so edit them for your machine first.

---

## Privacy and data

- No account, no tracking, no network requests for your data.
- Progress and results live in `sessionStorage` for the current browser tab only, and are cleared when it closes. Export a PDF or JSON file if you want to keep something.
- Answer keys are part of the bundled static data (there is no server), so someone inspecting the page's code could find them. The interface never shows them before submission.

## Known limitations

- Questions containing diagrams or tables are shown as images cropped from the source PDFs, with the text kept as alternative text.
- The syllabus text is extracted from the PDF, so its figures and table layouts (for example the testing quadrants) are not reproduced.
- Official explanations are shown in full and can be long.
- The PDF export is plain text without tables or charts.

## Copyright

The questions, answers, explanations and syllabus content are © International Software Testing Qualifications Board (ISTQB®). ISTQB permits non-commercial use of extracts with attribution; any other use, including public redistribution of the full sample exams, requires ISTQB's written approval. This project is for personal exam preparation and is not an official ISTQB product.