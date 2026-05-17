from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    data = request.json
    # Placeholder logic
    return jsonify({"success": True, "result": {"score": 0, "total": 1, "feedback": "Pending"}})

if __name__ == '__main__':
    app.run(debug=True)