import re
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
    stemmed_content =" ".join(filtered_words)
    return stemmed_content

def preprocess_text(series):
    return series.apply(stemming)
