import os
import re
import json
import pickle
import logging
import subprocess
from pathlib import Path
import numpy as np
import pandas as pd
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
import nltk

nltk.download("stopwords")


port_stem = PorterStemmer()


def stemming(content):

  stemmed_content =re.sub("[^a-zA-Z]", " ", content)
  stemmed_content =stemmed_content.lower()
  stemmed_content =stemmed_content.split()

  filtered_words =[]
  for word in stemmed_content:
      if word not in stopwords.words("english"):
          filtered_words.append(port_stem.stem(word))
      stemmed_content =filtered_words

  stemmed_content =" ".join(stemmed_content)

  return stemmed_content


def preprocess_text(text_series):
    return text_series.apply(stemming)


model =pickle.load(open("trained_model.sav", "rb"))
vectorizer =pickle.load(open("tfidf_vectorizer.sav", "rb"))


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('debug.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

def fetch_tweets(topic: str, count: int) -> list[str]:
    try:
        logging.info(f"Starting tweet fetch for #{topic}")
        
        output_path = Path(__file__).parent / 'tweets.json'
        if output_path.exists():
            output_path.unlink()

        node_script = Path(__file__).parent.parent / 'node' / 'tweet_fetch.js'
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
                raise ValueError("Node script reported failure in output")

            if len(data['tweets']) == 0:
                raise ValueError("Received empty tweet list")
            
            return [tweet['text'] for tweet in data['tweets']]


    except subprocess.CalledProcessError as e:
        logging.error(f"""
        Node.js failed with code {e.returncode}
        Command: {e.cmd}
        Output: {e.stdout}
        Error: {e.stderr}
        """)
        return []
    except Exception as e:
        logging.exception("Critical error in fetch_tweets:")
        return []


topic = input("Enter a hashtag or topic (without #): ")
tweet_texts = fetch_tweets(topic, 200)


if len(tweet_texts) == 0:
    print("Error: No tweets fetched. Check Node.js script and API key")
    exit()


print(f"\nFetched {len(tweet_texts)} tweets for #{topic}")

def preprocess_text(series):
    return series.apply(stemming) 

user_series =pd.Series(tweet_texts)
user_processed =preprocess_text(user_series)

if user_processed.empty:
    raise ValueError("No valid tweets after preprocessing")

user_vectorized = vectorizer.transform(user_processed)
predictions = model.predict(user_vectorized)

positive =np.count_nonzero(predictions == 1)
negative =np.count_nonzero(predictions == 0)
total =len(predictions)

positive_percent =(positive / total) * 100
negative_percent =(negative / total) * 100

print(f"\n🔍 Sentiment Analysis Summary for #{topic}:")
print(f"✅ Positive Tweets: {positive} ({positive_percent:.2f}%)")
print(f"❌ Negative Tweets: {negative} ({negative_percent:.2f}%)")

if positive > negative:
    print("🎯 Dominant Sentiment: Positive 😊")
elif negative > positive:
    print("🎯 Dominant Sentiment: Negative 😞")
else:
    print("🎯 Equal number of Positive and Negative Tweets.")
















def predict_sentiment(tweet_texts: list[str]) -> dict:
    if len(tweet_texts) == 0:
        raise ValueError("No tweets to analyze")

    user_series = pd.Series(tweet_texts)
    user_processed = preprocess_text(user_series)

    if user_processed.empty:
        raise ValueError("No valid tweets after preprocessing")

    user_vectorized = vectorizer.transform(user_processed)
    predictions = model.predict(user_vectorized)

    positive = np.count_nonzero(predictions == 1)
    negative = np.count_nonzero(predictions == 0)
    total = len(predictions)

    return {
        "positive": positive,
        "negative": negative,
        "positive_percent": round((positive / total) * 100, 2),
        "negative_percent": round((negative / total) * 100, 2),
        "dominant": (
            "Positive 😊" if positive > negative
            else "Negative 😞" if negative > positive
            else "Neutral 😐"
        )
    }

    