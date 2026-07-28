from transformers import pipeline

# Load the model
classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=1
)

def predict_emotion(text):

    result = classifier(text)

    emotion = result[0][0]["label"]

    score = result[0][0]["score"]

    return emotion, score


# Test

while True:

    message = input("You: ")

    emotion, confidence = predict_emotion(message)

    print("\nEmotion :", emotion)

    print("Confidence :", round(confidence*100,2),"%\n")