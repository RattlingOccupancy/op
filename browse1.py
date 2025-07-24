from flask import Flask, request, jsonify, render_template
import os
import sys
import json
from pathlib import Path

# Add the 'asli' directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'asli'))

# Import tweet fetching and prediction functions
from multi_emo import fetch_tweets, predict_sentiment

app = Flask(__name__, static_folder='templates')

# Serve static files (CSS and JS)
@app.route('/style.css')
def serve_css():
    with open('templates/style.css', 'r') as f:
        return f.read(), 200, {'Content-Type': 'text/css'}

@app.route('/script.js')
def serve_js():
    with open('templates/script.js', 'r') as f:
        return f.read(), 200, {'Content-Type': 'text/javascript'}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        if request.is_json:
            data = request.get_json()
            topic = data.get('topic', '')
        else:
            topic = request.form.get('topic', '')

        if not topic:
            return jsonify({
                'success': False,
                'error': 'Please enter a topic to analyze'
            })

        # Fetch tweets
        tweets = fetch_tweets(topic, 200)

        if not tweets:
            return jsonify({
                'success': False,
                'error': 'No tweets found for this topic. Try another keyword.'
            })

        # Predict emotions
        results = predict_sentiment(tweets)

        # Return extended emotion data
        return jsonify({
            'success': True,
            'topic': topic,
            'total_tweets': len(tweets),
            'emotion_counts': results['emotion_counts'],
            'emotion_percentages': results['emotion_percentages'],
            'dominant': results['dominant_emotion']
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True)
 