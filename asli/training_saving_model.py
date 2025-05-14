from sklearn.model_selection import train_test_split  # type: ignore
from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore
from sklearn.linear_model import LogisticRegression  # type: ignore
from sklearn.metrics import accuracy_score  # type: ignore

from sklearn.model_selection import train_test_split


x_train, x_test, y_train, y_test =train_test_split(x, y, test_size =0.2, stratify =y, random_state =2)

from sklearn.feature_extraction.text import TfidfVectorizer

vectorizer =TfidfVectorizer()
x_train =vectorizer.fit_transform(x_train)
x_test =vectorizer.transform(x_test)

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

model =LogisticRegression(max_iter=1000)
model.fit(x_train, y_train)


train_preds =model.predict(x_train)
train_acc =accuracy_score(y_train, train_preds)
print("accuracy score on the training data: ", train_acc*100, "%")

test_preds =model.predict(x_test)
test_acc =accuracy_score(y_test, test_preds)
print("Test Accuracy:", round(test_acc * 100, 2), "%")

import pickle
pickle.dump(model, open("trained_model.sav", "wb"))
pickle.dump(vectorizer, open("tfidf_vectorizer.sav", "wb"))

model =pickle.load(open("trained_model.sav", "rb"))
vectorizer =pickle.load(open("tfidf_vectorizer.sav", "rb"))

