import pandas as pd
import re
import nltk
import joblib

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# Download NLTK resources (only the first time)
nltk.download('stopwords')
nltk.download('wordnet')

# -----------------------------
# Load Dataset
# -----------------------------

df = pd.read_csv(
    "datasets/train.txt",
    sep=";",
    names=["text", "emotion"]
)

print("========== DATASET LOADED ==========\n")

print(df.head())

print("\nDataset Shape:", df.shape)

# -----------------------------
# Text Preprocessing
# -----------------------------

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

# Apply preprocessing

df["clean_text"] = df["text"].apply(preprocess)

print("\n========== PREPROCESSING COMPLETED ==========\n")

print(df[["text", "clean_text"]].head())

# -----------------------------
# TF-IDF Vectorization
# -----------------------------

vectorizer = TfidfVectorizer()

X = vectorizer.fit_transform(df["clean_text"])

y = df["emotion"]

print("\n========== TF-IDF COMPLETED ==========\n")

print("Feature Matrix Shape :", X.shape)

print("Target Shape :", y.shape)

# -----------------------------
# Train-Test Split
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.2,

    random_state=42

)

print("\n========== TRAIN-TEST SPLIT COMPLETED ==========\n")

print("Training Data :", X_train.shape)

print("Testing Data :", X_test.shape)
# -----------------------------
# Train Logistic Regression Model
# -----------------------------

model = LogisticRegression(max_iter=1000)

model.fit(X_train, y_train)

print("\n========== MODEL TRAINED SUCCESSFULLY ==========")
# -----------------------------
# Prediction
# -----------------------------

y_pred = model.predict(X_test)

print("\n========== PREDICTION COMPLETED ==========")
# -----------------------------
# Accuracy
# -----------------------------

accuracy = accuracy_score(y_test, y_pred)

print("\n========== MODEL ACCURACY ==========")

print(f"Accuracy : {accuracy*100:.2f}%")
# -----------------------------
# Classification Report
# -----------------------------

print("\n========== CLASSIFICATION REPORT ==========\n")

print(classification_report(y_test, y_pred))
# -----------------------------
# Save Model
# -----------------------------

joblib.dump(model, "models/emotion_model.pkl")

joblib.dump(vectorizer, "models/vectorizer.pkl")

print("\n========== MODEL SAVED SUCCESSFULLY ==========")
# -----------------------------
# Test the Model
# -----------------------------

sample = ["I am feeling stressed because of my exams"]

sample = [preprocess(text) for text in sample]

sample = vectorizer.transform(sample)

prediction = model.predict(sample)

print("\n========== SAMPLE TEST ==========")

print("Sentence : I am feeling stressed because of my exams")

print("Predicted Emotion :", prediction[0])