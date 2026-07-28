import joblib
import numpy as np

# Load model only once
model = joblib.load("models/emotion_model.pkl")
vectorizer = joblib.load("models/vectorizer.pkl")


def detect_emotion(message):

    text = vectorizer.transform([message])

    prediction = model.predict(text)[0]
    emotion = str(prediction).title()

    confidence = 1.0

    if hasattr(model, "predict_proba"):

        probabilities = model.predict_proba(text)[0]
        confidence = float(np.max(probabilities))

    return emotion, confidence
