from db import (
    get_conversation_title,
    load_chat,
    load_user_memory,
    save_chat,
    save_mood_history,
    touch_conversation,
    update_conversation_title_if_new,
    upsert_user_memory,
)
from ai.emotion import detect_emotion
from ai.long_term_memory import extract_memories
from ai.llm import get_llm_response


def create_title_from_message(message):

    title = " ".join(message.replace("\r", " ").replace("\n", " ").split())

    if not title:

        return "New Chat"

    if len(title) > 40:

        title = title[:37].rstrip() + "..."

    return title


def chat(user_id, conversation_id, message):

    emotion, confidence = detect_emotion(message)

    save_mood_history(
        user_id,
        conversation_id,
        message,
        emotion,
        confidence
    )

    extracted_memories = extract_memories(message)

    for memory in extracted_memories:

        upsert_user_memory(
            user_id,
            memory["memory_key"],
            memory["memory_value"],
            memory["confidence"]
        )

    user_memory = load_user_memory(user_id)

    history = load_chat(conversation_id)
    print("Conversation ID:", conversation_id)
    print("History:", history)

    should_generate_title = (
        get_conversation_title(conversation_id) == "New Chat"
        and not any(msg["role"] == "user" for msg in history)
    )

    history.append({

        "role":"user",
        "content":message

    })

    reply = get_llm_response(
        history,
        emotion,
        user_memory
    )

    if should_generate_title:

        generated_title = create_title_from_message(message)

        update_conversation_title_if_new(

            conversation_id,
            generated_title

        )

    save_chat(

        conversation_id,
        user_id,
        "user",
        message

    )

    save_chat(

        conversation_id,
        user_id,
        "assistant",
        reply

    )

    touch_conversation(conversation_id)

    return {

        "reply":reply,

        "conversation_title":
            get_conversation_title(conversation_id)

    }
