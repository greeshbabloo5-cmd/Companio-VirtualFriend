from ai.emotion import detect_emotion

while True:

    message = input("You : ")

    emotion, confidence = detect_emotion(message)

    print("\nEmotion :", emotion)
    print("Confidence :", confidence)

    print()
