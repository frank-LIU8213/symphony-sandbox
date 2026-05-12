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
