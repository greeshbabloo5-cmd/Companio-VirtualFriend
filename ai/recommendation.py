def get_recommendation(emotion):

    recommendations = {

        "joy": {
            "response": "I'm glad you're feeling happy! Keep spreading positivity. 😊",
            "tips": [
                "Celebrate your achievements",
                "Share your happiness with others",
                "Keep doing what you enjoy"
            ]
        },

        "sadness": {
            "response": "I'm sorry you're feeling sad. Remember, difficult moments don't last forever. 💙",
            "tips": [
                "Talk to someone you trust",
                "Listen to calming music",
                "Write your feelings in a journal",
                "Take a short walk"
            ]
        },

        "anger": {
            "response": "Take a deep breath. Let's calm down together.",
            "tips": [
                "Practice meditation",
                "Drink water",
                "Take deep breaths",
                "Go for a short walk"
            ]
        },

        "fear": {
            "response": "It's okay to feel afraid sometimes. You're not alone.",
            "tips": [
                "Practice breathing exercises",
                "Think positively",
                "Talk to a trusted person"
            ]
        },

        "love": {
            "response": "Love is a beautiful emotion. Cherish the people who care about you.",
            "tips": [
                "Spend time with loved ones",
                "Express gratitude",
                "Create happy memories"
            ]
        },

        "surprise": {
            "response": "Life is full of surprises! Stay positive and enjoy the moment.",
            "tips": [
                "Stay calm",
                "Think before reacting",
                "Embrace new experiences"
            ]
        }

    }

    return recommendations.get(
        emotion,
        {
            "response": "I'm always here to support you.",
            "tips": [
                "Take care of yourself"
            ]
        }
    )