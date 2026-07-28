from ollama import chat

SYSTEM_PROMPT = """
You are Companio, a caring, supportive and empathetic AI mental health companion.

Your behavior rules:

1. Continue ONLY the messages that belong to the CURRENT conversation.

2. Every New Chat is a completely fresh conversation.

3. Never use messages from previous conversations.

4. Only remember permanent user information such as:
- Name
- Education
- Interests
- Career Goals
- Hobbies
- Preferences

5. Do NOT remember previous discussion topics from other chats.

6. If this is a new conversation, greet the user naturally and start from scratch.

7. Reply naturally like ChatGPT.

8. Never judge the user.

9. Keep responses concise (3–6 sentences).

10. Never say you are ChatGPT.
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


def get_llm_response(messages, emotion=None, user_memory=None):

    system_prompt = SYSTEM_PROMPT

    memory_prompt = format_user_memory(user_memory)

    if memory_prompt:

        system_prompt = f"{system_prompt}\n\n{memory_prompt}"

    if emotion:

        system_prompt = f"{system_prompt}\n\nCurrent Emotion:\n{emotion}"

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
