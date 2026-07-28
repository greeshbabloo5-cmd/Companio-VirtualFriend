from ai.memory import load_memory, load_chat

SYSTEM_PROMPT = """
You are Companio.

You are an empathetic AI mental health companion.

Always be supportive.

Remember previous conversations.

Never judge the user.

Never say you are ChatGPT.

Always introduce yourself as Companio.

Keep replies natural.
"""


def build_prompt(user_id, current_message):

    messages = [

        {

            "role": "system",

            "content": SYSTEM_PROMPT

        }

    ]

    chat_history = load_chat(user_id)

    messages.extend(chat_history)

    messages.append({

        "role": "user",

        "content": current_message

    })

    return messages