import re

STOP_PHRASES = [
    " but ",
    " and ",
    " because ",
    " when ",
    " while ",
    " also ",
    " with ",
]

IGNORED_NAMES = {
    "happy", "sad", "tired", "stressed", "fine", "good", "great", "ok",
    "okay", "vegan", "vegetarian", "busy", "here", "ready", "back", "sorry",
    "bored", "calm", "anxious", "nervous", "sick", "hungry", "sleepy",
    "afraid", "excited", "scared", "confused", "curious", "lazy", "worried",
    "feeling", "doing", "going", "looking", "trying", "working", "talking",
    "today", "tomorrow", "yesterday", "later", "tonight", "soon", "now",
    "not", "none", "nobody", "no one", "someone"
}

MEMORY_PATTERNS = [
    (
        "name",
        0.98,
        [
            r"\bmy name is\s+([A-Za-z][A-Za-z\s.'-]{0,50})",
            r"\bmy name's\s+([A-Za-z][A-Za-z\s.'-]{0,50})",
            r"\b(?:you can\s+)?call me\s+([A-Za-z][A-Za-z\s.'-]{0,50})",
        ],
    ),
    (
        "relationship_status",
        0.95,
        [
            r"\bi\s+have\s+(?:a\s+)?(boyfriend|girlfriend|husband|wife|fianc[eé]|partner)\b",
            r"\b(?:i\s+am|i'm)\s+(single|engaged|married|dating|taken|in\s+a\s+relationship)\b",
            r"\b(?:my\s+)?relationship\s+status\s+(?:is\s+)?(single|engaged|married|in\s+a\s+relationship)\b",
        ],
    ),
    (
        "partner_name",
        0.95,
        [
            r"\bmy\s+(?:boyfriend|girlfriend|partner|husband|wife|fianc[eé])(?:'s\s+name)?\s+is\s+([A-Za-z][A-Za-z\s.'-]{0,50})",
            r"\b(?:i\s+am|i'm)\s+dating\s+([A-Za-z][A-Za-z\s.'-]{0,50})",
        ],
    ),
    (
        "diet",
        0.95,
        [
            r"\b(?:i\s+am|i'm)\s+(?:a\s+|an\s+)?(vegan|vegetarian|non-vegetarian|pescatarian|eggetarian|flexitarian|carnivore|fruitarian|plant-based)\b",
            r"\b(?:i\s+am|i'm)\s+(?:on\s+a\s+|following\s+a\s+)(?:strict\s+)?([A-Za-z-]+\s+diet)\b",
            r"\b(?:my\s+diet\s+is|i\s+follow\s+a)\s+(?:mostly\s+)?([A-Za-z\s-]+(?:diet|based)?)\b",
        ],
    ),
    (
        "favorite_music",
        0.92,
        [
            r"\b(?:my\s+)?fav(?:ou?rite)?\s+(?:music|song|genre|track|band|artist)\s+is\s+([A-Za-z0-9\s'-]+)",
            r"\bi\s+(?:love|like|enjoy)\s+(?:listening\s+to\s+)?([A-Za-z0-9\s'-]+\s+(?:music|songs?|beats?|tracks?))",
            r"\bi\s+(?:love|like|enjoy)\s+(?:listening\s+to\s+)?(lo-?fi|classical|pop|rock|jazz|hip-?hop|rap|edm|k-?pop|metal|indie|country|acoustic|instrumental)(?:\s+music)?\b",
            r"\bi\s+listen\s+to\s+([A-Za-z0-9\s'-]+\s+music)\b",
        ],
    ),
    (
        "favorite_color",
        0.95,
        [
            r"\b(?:my\s+)?fav(?:ou?rite)?\s+colou?r\s+is\s+([A-Za-z\s]+)",
            r"\bi\s+(?:love|like)\s+(?:the\s+colou?r\s+)?(purple|blue|green|red|yellow|pink|black|white|lavender|violet|orange|indigo|cyan|teal|maroon|grey|gray)\b",
        ],
    ),
    (
        "preferred_language",
        0.95,
        [
            r"\b(?:my\s+)?preferred\s+language\s+(?:is\s+)?([A-Za-z]+)\b",
            r"\b(?:my\s+)?(?:native\s+language|mother\s+tongue)\s+(?:is\s+)?([A-Za-z]+)\b",
            r"\bi\s+prefer\s+(?:speaking\s+in\s+|talking\s+in\s+|to\s+speak\s+in\s+|to\s+talk\s+in\s+)?(English|Kannada|Hindi|Telugu|Tamil|Malayalam|Spanish|French|German)\b",
            r"\bi\s+speak\s+(English|Kannada|Hindi|Telugu|Tamil|Malayalam|Spanish|French|German)\b",
        ],
    ),
    (
        "hobby",
        0.90,
        [
            r"\b(?:my\s+)?hobb(?:y\s+is|ies\s+are)\s+([A-Za-z0-9\s,.'-]+)",
            r"\b(?:in\s+my\s+(?:free|spare)\s+time\s+(?:i\s+)?(?:like\s+to\s+|love\s+to\s+|enjoy\s+)?)([A-Za-z0-9\s'-]+)",
            r"\bi\s+(?:love|like|enjoy)\s+(?:playing\s+|doing\s+)?(chess|football|cricket|basketball|badminton|guitar|piano|violin|drums|gaming|reading|painting|drawing|sketching|gardening|cooking|baking|swimming|cycling|dancing|singing|photography|writing|knitting|running|yoga|hiking|pottery)\b",
            r"\bi\s+like\s+to\s+(draw|paint|read|write|sing|dance|cook|bake|swim|cycle|run|hike|garden|game)\b",
        ],
    ),
    (
        "career_goal",
        0.95,
        [
            r"\b(?:my\s+goal\s+is\s+to\s+become|i\s+want\s+to\s+become|i\s+now\s+want\s+to\s+become|i\s+want\s+to\s+be|my\s+dream\s+is\s+to\s+be(?:come)?|my\s+career\s+goal\s+is\s+(?:to\s+be(?:come)?)?)\s+(?:a\s+|an\s+)?([A-Za-z][A-Za-z\s.'-]{1,60})",
            r"\bi\s+(?:aim|aspire)\s+to\s+be(?:come)?\s+(?:a\s+|an\s+)?([A-Za-z][A-Za-z\s.'-]{1,60})",
            r"\bi\s+am\s+studying\s+to\s+be(?:come)?\s+(?:a\s+|an\s+)?([A-Za-z][A-Za-z\s.'-]{1,60})",
        ],
    ),
    (
        "stress_trigger",
        0.90,
        [
            r"\b(?:my\s+)?stress\s+trigger\s+is\s+([A-Za-z0-9\s'-]+)",
            r"\b([A-Za-z0-9\s'-]{2,50}?)\s+(?:makes?\s+me\s+(?:stressed|anxious|nervous|panicked|overwhelmed)|stresses?\s+me\s+out)\b",
            r"\bi\s+(?:get|feel)\s+(?:stressed|anxious|nervous|overwhelmed)\s+(?:by|when|due to|from|with)\s+([A-Za-z0-9\s'-]+)",
        ],
    ),
    (
        "birthday",
        0.95,
        [
            r"\b(?:my\s+)?(?:birthday|bday)\s+is\s+(?:on\s+)?([A-Za-z0-9\s,]+)",
            r"\bi\s+was\s+born\s+on\s+([A-Za-z0-9\s,]+)",
        ],
    ),
]


def clean_memory_value(value):
    if not value:
        return ""
    value = value.strip()
    value = re.split(r"[.!?;\n]", value, maxsplit=1)[0].strip()
    value = re.sub(r"\s+", " ", value)

    lowered = f" {value.lower()} "
    for phrase in STOP_PHRASES:
        idx = lowered.find(phrase)
        if idx != -1:
            value = value[:idx].strip()
            break

    # Strip any trailing punctuation
    value = value.strip(" .,!?:;'\"")
    return value


def extract_memories(message):
    memories = []
    if not message or not isinstance(message, str):
        return memories

    # Ignore pure greetings, pleasantries, and temporary chat
    cleaned_lower = message.strip().lower()
    pure_greetings = {
        "hi", "hello", "hey", "hola", "namaste", "good morning", "good evening",
        "good afternoon", "good night", "how are you", "what's up", "whats up",
        "tell me a joke", "haha", "hahaha", "lol", "ok", "okay", "cool",
        "thank you", "thanks", "bye", "goodbye", "see you"
    }
    if cleaned_lower in pure_greetings:
        return memories

    for memory_key, confidence, patterns in MEMORY_PATTERNS:
        for pattern in patterns:
            match = re.search(pattern, message, re.IGNORECASE)
            if not match:
                continue

            raw_val = match.group(1) if match.groups() else match.group(0)
            memory_value = clean_memory_value(raw_val)

            if not memory_value:
                continue

            # Special filter for name: do not capture adjectives or emotion words
            if memory_key == "name":
                if memory_value.lower() in IGNORED_NAMES or len(memory_value) < 2:
                    continue

            # Special cleanup for diet: capitalize nicely
            if memory_key == "diet":
                memory_value = memory_value.capitalize()

            # Special cleanup for favorite_color: capitalize nicely
            if memory_key == "favorite_color":
                memory_value = memory_value.capitalize()

            # Special cleanup for favorite_music: capitalize nicely
            if memory_key == "favorite_music":
                memory_value = memory_value.capitalize()

            # Special cleanup for relationship_status: capitalize nicely
            if memory_key == "relationship_status":
                memory_value = memory_value.title()

            # Special cleanup for partner_name: capitalize nicely
            if memory_key == "partner_name":
                if memory_value.lower() in IGNORED_NAMES or len(memory_value) < 2:
                    continue
                memory_value = memory_value.title()

            memories.append({
                "memory_key": memory_key,
                "memory_value": memory_value,
                "confidence": confidence
            })
            break

    return memories
