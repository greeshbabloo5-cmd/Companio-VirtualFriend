import re


MEMORY_PATTERNS = [
    (
        "name",
        0.98,
        [
            r"\bmy name is\s+([A-Za-z][A-Za-z .'-]{1,80})",
            r"\bcall me\s+([A-Za-z][A-Za-z .'-]{1,80})",
        ],
    ),
    (
        "education",
        0.92,
        [
            r"\bi am studying\s+([A-Za-z0-9 +&.'-]{1,80})",
            r"\bi'm studying\s+([A-Za-z0-9 +&.'-]{1,80})",
            r"\bi study\s+([A-Za-z0-9 +&.'-]{1,80})",
        ],
    ),
    (
        "interest",
        0.9,
        [
            r"\bi love\s+([A-Za-z0-9 +&.'-]{1,80})",
            r"\bi like\s+([A-Za-z0-9 +&.'-]{1,80})",
            r"\bi enjoy\s+([A-Za-z0-9 +&.'-]{1,80})",
        ],
    ),
    (
        "career_goal",
        0.95,
        [
            r"\bi want to become\s+(?:a |an )?([A-Za-z][A-Za-z .'-]{1,80})",
            r"\bi now want to become\s+(?:a |an )?([A-Za-z][A-Za-z .'-]{1,80})",
            r"\bmy goal is to become\s+(?:a |an )?([A-Za-z][A-Za-z .'-]{1,80})",
            r"\bi want to be\s+(?:a |an )?([A-Za-z][A-Za-z .'-]{1,80})",
        ],
    ),
]


def clean_memory_value(value):

    value = value.strip()
    value = re.split(r"[.!?;\n]", value, maxsplit=1)[0].strip()
    value = re.sub(r"\s+", " ", value)

    stop_phrases = [
        " but ",
        " and ",
        " because ",
        " when ",
        " while ",
    ]

    lowered = value.lower()

    for phrase in stop_phrases:

        index = lowered.find(phrase)

        if index != -1:

            value = value[:index].strip()
            break

    return value


def extract_memories(message):

    memories = []

    for memory_key, confidence, patterns in MEMORY_PATTERNS:

        for pattern in patterns:

            match = re.search(pattern, message, re.IGNORECASE)

            if not match:

                continue

            memory_value = clean_memory_value(match.group(1))

            if memory_value:

                memories.append({
                    "memory_key": memory_key,
                    "memory_value": memory_value,
                    "confidence": confidence
                })

                break

    return memories
