import os
import json
import csv
import io
import sqlite3
import random
from functools import wraps
from flask import Flask, render_template, request, redirect, url_for, flash, session, g
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['DATABASE'] = os.path.join(app.root_path, 'exam.db')

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(app.config['DATABASE'])
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    db.executescript('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student'
        );
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_text TEXT NOT NULL,
            answer TEXT NOT NULL,
            options TEXT,
            type TEXT NOT NULL DEFAULT 'mcq'
        );
        CREATE TABLE IF NOT EXISTS attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            question_ids TEXT NOT NULL,
            answers TEXT NOT NULL,
            score REAL NOT NULL,
            total INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    ''')
    db.commit()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        role = request.form.get('role', 'student')
        db = get_db()
        try:
            db.execute('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
                       (username, generate_password_hash(password), role))
            db.commit()
            flash('Registration successful. Please log in.', 'success')
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash('Username already exists.', 'error')
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        user = db.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['role'] = user['role']
            return redirect(url_for('dashboard'))
        flash('Invalid username or password.', 'error')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    db = get_db()
    if session['role'] == 'admin':
        question_count = db.execute('SELECT COUNT(*) FROM questions').fetchone()[0]
        return render_template('dashboard_admin.html', question_count=question_count)
    return render_template('dashboard_student.html')

@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():
    if session['role'] != 'admin':
        flash('Unauthorized.', 'error')
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file part.', 'error')
            return redirect(request.url)
        file = request.files['file']
        if file.filename == '':
            flash('No selected file.', 'error')
            return redirect(request.url)
        if file.filename.endswith('.csv'):
            db = get_db()
            file.stream.seek(0)
            reader = csv.DictReader(io.StringIO(file.stream.read().decode('utf-8')))
            for row in reader:
                db.execute('INSERT INTO questions (question_text, answer, options, type) VALUES (?, ?, ?, ?)',
                           (row['question'], row['answer'], row.get('options', ''), row.get('type', 'mcq')))
            db.commit()
            flash('Questions uploaded successfully.', 'success')
            return redirect(url_for('dashboard'))
        flash('Only CSV files are supported.', 'error')
    return render_template('upload.html')

@app.route('/exam', methods=['GET', 'POST'])
@login_required
def exam():
    if request.method == 'POST':
        answers = request.form.to_dict()
        db = get_db()
        question_ids = json.loads(session['exam_questions'])
        total = len(question_ids)
        score = 0
        for qid in question_ids:
            q = db.execute('SELECT * FROM questions WHERE id = ?', (qid,)).fetchone()
            user_ans = answers.get(f'q_{qid}', '').strip().lower()
            correct_ans = q['answer'].strip().lower()
            if user_ans == correct_ans:
                score += 1
        score = round((score / total) * 100, 2) if total > 0 else 0
        
        db.execute('INSERT INTO attempts (user_id, question_ids, answers, score, total) VALUES (?, ?, ?, ?, ?)',
                   (session['user_id'], json.dumps(question_ids), json.dumps(answers), score, total))
        db.commit()
        session.pop('exam_questions', None)
        return render_template('result.html', score=score, total=total)

    db = get_db()
    all_questions = db.execute('SELECT * FROM questions').fetchall()
    if len(all_questions) < 5:
        flash('Not enough questions in the bank. Need at least 5.', 'error')
        return redirect(url_for('dashboard'))
    
    exam_questions = random.sample([q['id'] for q in all_questions], min(5, len(all_questions)))
    session['exam_questions'] = json.dumps(exam_questions)
    
    questions = [db.execute('SELECT * FROM questions WHERE id = ?', (qid,)).fetchone() for qid in exam_questions]
    return render_template('exam.html', questions=questions)

@app.route('/history')
@login_required
def history():
    db = get_db()
    attempts = db.execute('SELECT * FROM attempts WHERE user_id = ? ORDER BY created_at DESC', (session['user_id'],)).fetchall()
    return render_template('history.html', attempts=attempts)

if __name__ == '__main__':
    with app.app_context():
        init_db()
    app.run(debug=True)
