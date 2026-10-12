from db import (
    get_conversation_title,
    get_user_settings,
    load_chat,
    save_chat,
    save_mood_history,
    touch_conversation,
    update_conversation_title_if_new,
)
from ai.emotion import detect_emotion
from ai.llm import get_llm_response


def create_title_from_message(message):

    title = " ".join(message.replace("\r", " ").replace("\n", " ").split())

    if not title:

        return "New Chat"

    if len(title) > 40:

        title = title[:37].rstrip() + "..."

    return title


# ---------------- TEMPORARY CHAT STORAGE ----------------
# In-memory storage for unpersisted chat when Save Chat History = OFF
# Structure: { (user_id, conversation_id): [ {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."} ] }
_temp_chat_storage = {}


def get_temp_chat(user_id, conversation_id):
    """Retrieve active temporary messages for the given user and conversation."""
    return list(_temp_chat_storage.get((user_id, conversation_id), []))


def add_temp_chat(user_id, conversation_id, role, content):
    """Add a temporary message to in-memory storage during current chat."""
    key = (user_id, conversation_id)
    if key not in _temp_chat_storage:
        _temp_chat_storage[key] = []
    _temp_chat_storage[key].append({
        "role": role,
        "content": content
    })


def clear_temp_chat(user_id, conversation_id=None):
    """
    Discard temporary messages for the specified user and conversation.
    If conversation_id is None, discards all temporary messages for that user.
    """
    if conversation_id is not None:
        _temp_chat_storage.pop((user_id, conversation_id), None)
    else:
        keys_to_remove = [k for k in _temp_chat_storage if k[0] == user_id]
        for k in keys_to_remove:
            _temp_chat_storage.pop(k, None)


def load_chat_with_temp(user_id, conversation_id):
    """
    Load all messages for the current conversation:
    permanently saved messages from MySQL + active temporary messages.
    """
    persisted = load_chat(conversation_id)
    temp = get_temp_chat(user_id, conversation_id)
    return persisted + temp


def chat(user_id, conversation_id, message, language="English", voice_gender="female"):

    clean_msg = message.lower().strip()
    if any(phrase in clean_msg for phrase in ["speak in english", "talk in english", "reply in english", "switch to english", "speak english", "talk english"]) or clean_msg in ["english", "in english"]:
        language = "English"
    elif any(phrase in clean_msg for phrase in ["speak in kannada", "talk in kannada", "reply in kannada", "switch to kannada", "speak kannada", "talk kannada", "kannadadalli matadi", "kannadadalli mathadi", "kannadadalli maathadi"]) or clean_msg in ["kannada", "in kannada"]:
        language = "Kannada"
    else:
        language = "Kannada" if str(language).strip().lower() == "kannada" else "English"

    emotion, confidence = detect_emotion(message)

    user_settings = get_user_settings(user_id)

    if user_settings.get("saveMoodHistory", True):
        save_mood_history(
            user_id,
            conversation_id,
            message,
            emotion,
            confidence
        )

    history = load_chat_with_temp(user_id, conversation_id)
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
        language=language
    )

    if should_generate_title:

        generated_title = create_title_from_message(message)

        update_conversation_title_if_new(

            conversation_id,
            generated_title

        )

    if user_settings.get("saveChatHistory", True):
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
    else:
        add_temp_chat(
            user_id,
            conversation_id,
            "user",
            message
        )
        add_temp_chat(
            user_id,
            conversation_id,
            "assistant",
            reply
        )

    touch_conversation(conversation_id)

    return {

        "reply":reply,

        "conversation_title":
            get_conversation_title(conversation_id),

        "language": language

    }
