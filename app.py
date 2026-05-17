from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Simple quiz data
QUIZ_DATA = [
    {
        "id": "q1",
        "question": "What process powers the sun?",
        "options": ["Fission", "Fusion", "Decay", "Combustion"],
        "correct": "Fusion"
    },
    {
        "id": "q2",
        "question": "What element is commonly split in nuclear fission?",
        "options": ["Hydrogen", "Carbon", "Uranium", "Oxygen"],
        "correct": "Uranium"
    },
    {
        "id": "q3",
        "question": "What is released in large amounts during nuclear reactions?",
        "options": ["Sound", "Light", "Energy", "Magnetism"],
        "correct": "Energy"
    }
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/quiz/questions', methods=['GET'])
def get_questions():
    return jsonify(QUIZ_DATA)

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    data = request.json
    question_id = data.get('questionId')
    answer = data.get('answer')
    
    question = next((q for q in QUIZ_DATA if q['id'] == question_id), None)
    
    if not question:
        return jsonify({"success": False, "result": {"score": 0, "total": 0, "feedback": "Invalid question"}})
        
    is_correct = answer == question['correct']
    feedback = "Correct!" if is_correct else "Incorrect."
    
    return jsonify({
        "success": True, 
        "result": {
            "score": 1 if is_correct else 0, 
            "total": 1, 
            "feedback": feedback
        }
    })

if __name__ == '__main__':
    app.run(debug=True)
