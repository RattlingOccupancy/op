from flask import Flask, request, jsonify, render_template
import os
import sys
import json
from pathlib import Path

# Add the asli directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'asli'))

# Import functions from final_code1.py
from multi_emo import fetch_tweets, predict_sentiment

app = Flask(__name__, static_folder='templates')

# Serve static files (CSS, JS)
@app.route('/style.css')
def serve_css():
    with open('templates/style.css', 'r') as f:
        css = f.read()
    return css, 200, {'Content-Type': 'text/css'}

@app.route('/script.js')
def serve_js():
    with open('templates/script.js', 'r') as f:
        js = f.read()
    return js, 200, {'Content-Type': 'text/javascript'}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        # Get topic from form data or JSON request
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
        
        # Fetch tweets using Node.js script
        tweets = fetch_tweets(topic, 30)
        
        if not tweets or len(tweets) == 0:
            return jsonify({
                'success': False, 
                'error': 'No tweets found for this topic. Try another keyword.'
            })
        
        # Analyze sentiment
        sentiment_results = predict_sentiment(tweets)
        
        # Return results
        return jsonify({
            'success': True,
            'topic': topic,
            'total_tweets': len(tweets),
            'positive': sentiment_results['positive'],
            'negative': sentiment_results['negative'],
            'positive_percent': sentiment_results['positive_percent'],
            'negative_percent': sentiment_results['negative_percent'],
            'dominant': sentiment_results['dominant']
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == "__main__":
    app.run(debug=True)