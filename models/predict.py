import joblib
import re
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Load Model
model = joblib.load("models/emotion_model.pkl")

vectorizer = joblib.load("models/vectorizer.pkl")

lemmatizer = WordNetLemmatizer()

stop_words = set(stopwords.words("english"))
def preprocess(text):

    # Convert to lowercase
    text = text.lower()

    # Remove special characters
    text = re.sub(r'[^a-zA-Z ]', '', text)

    # Split into words
    words = text.split()

    # Remove stopwords and lemmatize
    words = [
        lemmatizer.lemmatize(word)
        for word in words
        if word not in stop_words
    ]

    return " ".join(words)

def predict_emotion(text):

    # Clean the text
    text = preprocess(text)

    # Convert text into TF-IDF features
    text = vectorizer.transform([text])

    # Predict emotion
    prediction = model.predict(text)

    return prediction[0]

sentence = input("Enter your message: ")

emotion = predict_emotion(sentence)

print("Predicted Emotion:", emotion)