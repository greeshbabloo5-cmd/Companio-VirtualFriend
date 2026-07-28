import re

from ollama import chat


TITLE_PROMPT = """
Generate a very short conversation title.

Rules:
- Maximum 4 words.
- No punctuation.
- No quotes.
- Professional.
- Similar to ChatGPT titles.
- Return ONLY the title.
"""


def clean_title(title):

    title = title.strip()
    title = title.replace('"', "").replace("'", "")
    title = re.sub(r"[^A-Za-z0-9 ]", "", title)
    title = re.sub(r"\s+", " ", title).strip()

    words = title.split()

    if len(words) > 4:

        title = " ".join(words[:4])

    return title or "New Chat"


def generate_conversation_title(message):

    response = chat(
        model="llama3.2:3b",
        messages=[
            {
                "role": "system",
                "content": TITLE_PROMPT
            },
            {
                "role": "user",
                "content": message
            }
        ]
    )

    return clean_title(response["message"]["content"])
