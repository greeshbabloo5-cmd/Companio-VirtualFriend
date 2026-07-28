def safety_check(message):

    message = message.lower()

    critical_words = [
        "kill",
        "suicide",
        "die",
        "murder",
        "hurt",
        "self harm",
        "harm myself",
        "end my life",
        "want to die",
        "attack",
        "violence",
        "weapon",
        "jump from"
    ]

    for word in critical_words:
        if word in message:
            return True

    return False