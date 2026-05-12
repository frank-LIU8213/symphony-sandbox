# Online Exam System

A simple Flask-based web application for conducting online exams.

## Features
- User registration & login (Admin/Student roles)
- Admin: Upload question bank via CSV
- Student: Take randomized exams (5 questions per attempt)
- Auto-grading & instant score display
- Exam history tracking

## Setup
```bash
cd exam
pip install -r requirements.txt
python app.py
```
Visit `http://localhost:5000`

## CSV Format for Question Upload
Create a CSV file with the following columns:
- `question`: The question text
- `answer`: The correct answer
- `options`: Comma-separated options (e.g., `A,B,C,D`). Optional for short-answer questions.
- `type`: Question type (e.g., `mcq`, `short`). Optional.

Example:
```csv
question,answer,options,type
What is 2+2?,4,1,2,3,4,mcq
What is the capital of France?,Paris,,,short
```

## Quick Start with the Sample Question Bank

This repository includes a ready‑to‑use CSV file (`sample_questions.csv`) with 20 general‑knowledge questions. Follow the steps below to see the system in action:

1. Set up the application as described in the **Setup** section.
2. Register a new account and choose the **admin** role.
3. Log in as admin; you’ll see the Admin Dashboard.
4. Click **Upload New Questions** (or navigate to `/upload`).
5. Choose the file `sample_questions.csv` from the `exam` folder, then click **Upload**.
6. After the upload completes, log out and register a **student** account.
7. Log in as student; click **Start Exam**.
8. The system randomly picks **5 questions** from the bank. Answer them and submit.
9. You will see your **percentage score** and the **number of correct answers**.
10. You can also visit **History** (from the navigation bar) to review past attempts.

You can replace `sample_questions.csv` with your own CSV file at any time using the same upload page.
