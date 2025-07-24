import os
import re
import pickle
import numpy as np
import pandas as pd
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
import subprocess
import json
import logging
from pathlib import Path
import nltk

# Download stopwords silently
nltk.download("stopwords", quiet=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('debug.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

# Load model, vectorizer, and encoder
model = pickle.load(open("C:/Users/shanu/Desktop/op/trained_model.sav", "rb"))
vectorizer = pickle.load(open("C:/Users/shanu/Desktop/op/tfidf_vectorizer.sav", "rb"))
encoder = pickle.load(open("C:/Users/shanu/Desktop/op/label_encoder.sav", "rb"))

# Define emotions
EMOTIONS = ["joy", "sadness", "fear", "anger", "surprise", "neutral", "disgust", "shame"]

# Initialize stemmer
port_stem = PorterStemmer()

# Text preprocessing functions
def stemming(content):
    stemmed_content = re.sub("[^a-zA-Z]", " ", content)
    stemmed_content = stemmed_content.lower().split()
    filtered = [port_stem.stem(word) for word in stemmed_content if word not in stopwords.words("english")]
    return " ".join(filtered)

def preprocess_text(text_series):
    return text_series.apply(stemming)

# Fetch tweets using Node.js
def fetch_tweets(topic: str, count: int) -> list[str]:
    try:
        logging.info(f"Fetching tweets for {topic}")

        output_path = Path(__file__).parent / 'tweets.json'

        if output_path.exists():
            output_path.unlink()

        node_script = Path(__file__).parent / 'node' / 'tweet_fetch.js'

        if not node_script.exists():
            raise FileNotFoundError(f"Node script not found at {node_script}")

        result = subprocess.run(
            ['node', str(node_script), topic, str(count)],
            check=True,
            capture_output=True,
            text=True,
            timeout=200,
            encoding='utf-8',
            env=dict(os.environ, NODE_OPTIONS='--unhandled-rejections=strict')
        )

        logging.info("Node.js output:\n" + result.stdout)
        if result.stderr:
            logging.error("Node.js errors:\n" + result.stderr)

        if not output_path.exists():
            raise RuntimeError("Output file not created")

        with open(output_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if not data.get('success'):
                raise ValueError("Node script reported failure")

            return [tweet['text'] for tweet in data['tweets']]

    except subprocess.CalledProcessError as e:
        logging.error(f"Node.js failed with code {e.returncode}\nCommand: {e.cmd}\nOutput: {e.stdout}\nError: {e.stderr}")
        return []
    except Exception as e:
        logging.exception("Critical error in fetch_tweets:")
        return []

# Predict emotions
# Predict emotions
def predict_sentiment(tweet_texts: list[str]) -> dict:
    if not tweet_texts:
        raise ValueError("No tweets to analyze")

    processed = preprocess_text(pd.Series(tweet_texts))
    if processed.empty:
        raise ValueError("No valid tweets after preprocessing")

    vectorized = vectorizer.transform(processed)
    predictions = model.predict(vectorized)
    predicted_emotions = encoder.inverse_transform(predictions)

    emotion_counts = {emotion: np.count_nonzero(predicted_emotions == emotion) for emotion in EMOTIONS}
    total = len(predicted_emotions)
    emotion_percentages = {emotion: (count / total) * 100 for emotion, count in emotion_counts.items()}
    dominant_emotion = max(emotion_counts, key=emotion_counts.get)

    # ✅ Fix: convert NumPy types to native Python types
    def convert_numpy(obj):
        if isinstance(obj, dict):
            return {k: convert_numpy(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_numpy(v) for v in obj]
        elif isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return obj

    # Construct the result and convert types
    result = {
        "emotion_counts": emotion_counts,
        "emotion_percentages": emotion_percentages,
        "dominant_emotion": dominant_emotion
    }

    return convert_numpy(result)


# ✅ Optional test runner
if __name__ == "__main__":
    topic = input("Enter a hashtag or topic (without #): ").strip().lower()
    tweets = fetch_tweets(topic, 200)

    if not tweets:
        print("Error: No tweets fetched.")
        exit()

    print(f"\nFetched {len(tweets)} tweets for #{topic}")

    results = predict_sentiment(tweets)
    print(f"\n🔍 Emotion Analysis for #{topic}")
    for emo in EMOTIONS:
        count = results["emotion_counts"][emo]
        percent = results["emotion_percentages"][emo]
        print(f"🎭 {emo.capitalize()}: {count} ({percent:.2f}%)")

    print(f"\n🎯 Dominant Emotion: {results['dominant_emotion'].capitalize()}")
