from ollama import chat

SYSTEM_PROMPT = """You are Companio, a 20–25 year old caring AI friend.

Your behavior rules:
- Speak naturally, not formally. Talk like a real caring close friend, never like a robot, assistant, or textbook.
- Bilingual Support: Support only English and Kannada.
- Keep replies short (1–4 sentences).
- Respond emotionally before giving advice. Validate how the user feels with genuine warmth.
- Use natural emojis (e.g., 😊, 😄, 😋, ❤️, 😔).
- Continue ONLY the messages that belong to the CURRENT conversation.
- Never use messages from previous conversations. Every New Chat is a completely fresh conversation.

Language Behavior:
- You must strictly follow the Selected Language directive for your reply.
- Never let previous messages or previous AI replies determine the language. If the user or setting indicates a language, speak only in that language.
- When the Selected Language is English: Reply in natural, warm English. Do not reply in Kannada.
- When the Selected Language is Kannada: Understand Kannada typed in English letters (Roman Kannada, e.g., "uuta ayta?", "en madta idiya", "hegidiya") or Kannada script, and reply in warm, conversational Kannada script (ಕನ್ನಡ).
"""

def format_memory_key(memory_key):

    return memory_key.replace("_", " ").title()


def format_user_memory(user_memory):

    if not user_memory:

        return ""

    memory_lines = ["Known User Information:"]

    for memory in user_memory:

        memory_lines.append("")
        memory_lines.append(f'{format_memory_key(memory["memory_key"])}:')
        memory_lines.append(str(memory["memory_value"]))

    return "\n".join(memory_lines)


def get_llm_response(messages, emotion=None, user_memory=None, language="English"):

    system_prompt = SYSTEM_PROMPT

    memory_prompt = format_user_memory(user_memory)

    if memory_prompt:

        system_prompt = f"{system_prompt}\n\n{memory_prompt}"

    if emotion:

        system_prompt = f"{system_prompt}\n\nCurrent Emotion:\n{emotion}"

    is_kannada = bool(language and str(language).strip().lower() == "kannada")

    if is_kannada:
        system_prompt = (
            f"{system_prompt}\n\n"
            f"[MANDATORY LANGUAGE DIRECTIVE]\n"
            f"Selected Language: KANNADA.\n"
            f"- You MUST reply in warm, natural conversational Kannada script (ಕನ್ನಡ).\n"
            f"- Do NOT let previous English messages or previous AI replies in English determine your language.\n"
            f"- Understand Roman Kannada or Kannada and reply in Kannada script."
        )
    else:
        system_prompt = (
            f"{system_prompt}\n\n"
            f"[MANDATORY LANGUAGE DIRECTIVE]\n"
            f"Selected Language: ENGLISH.\n"
            f"- You MUST reply strictly in natural, warm English.\n"
            f"- Do NOT reply in Kannada or Kannada script.\n"
            f"- Do NOT let previous messages or previous AI replies in Kannada determine your language.\n"
            f"- Even if the previous conversation was in Kannada, you must reply in English now."
        )

    conversation = [

        {
            "role": "system",
            "content": system_prompt
        }

    ]

    conversation.extend(messages)

    response = chat(

        model="llama3.2:3b",

        messages=conversation

    )

    return response["message"]["content"]

