import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash


def get_db_connection():

    return mysql.connector.connect(

        host="localhost",
        user="root",
        password="",
        database="companio_db"

    )


# ---------------- REGISTER ----------------

def register_user(full_name, email, password):

    conn = get_db_connection()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(

        "SELECT * FROM users WHERE email=%s",

        (email,)

    )

    user = cursor.fetchone()

    if user:

        cursor.close()
        conn.close()

        return False, "Email already exists"

    hashed_password = generate_password_hash(password)

    cursor.execute(

        """
        INSERT INTO users(full_name,email,password)
        VALUES(%s,%s,%s)
        """,

        (full_name, email, hashed_password)

    )

    conn.commit()

    cursor.close()

    conn.close()

    return True, "Registration Successful"


# ---------------- LOGIN ----------------

def login_user(email, password):

    conn = get_db_connection()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(

        "SELECT * FROM users WHERE email=%s",

        (email,)

    )

    user = cursor.fetchone()

    cursor.close()

    conn.close()

    if user:

        if check_password_hash(user["password"], password):

            return user

    return None
# ---------------- CHAT HISTORY ----------------

def save_chat(conversation_id, user_id, role, message):

    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO chat_history
        (conversation_id,user_id,role,message)

        VALUES(%s,%s,%s,%s)
        """,
        (conversation_id, user_id, role, message)
    )

    conn.commit()

    cursor.close()
    conn.close()


def touch_conversation(conversation_id):

    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE conversations
        SET updated_at=CURRENT_TIMESTAMP
        WHERE id=%s
        """,
        (conversation_id,)
    )

    conn.commit()

    cursor.close()
    conn.close()


def load_chat(conversation_id):

    conn = get_db_connection()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT role,message

        FROM chat_history

        WHERE conversation_id=%s

        ORDER BY id ASC
        """,
        (conversation_id,)
    )

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    history = []

    for row in rows:

        history.append({

            "role": row["role"],

            "content": row["message"]

        })

    return history


def clear_chat(conversation_id):

    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM chat_history

        WHERE conversation_id=%s
        """,
        (conversation_id,)
    )

    conn.commit()

    cursor.close()
    conn.close()


# ---------------- MOOD HISTORY ----------------

def save_mood_history(user_id, conversation_id, message, emotion, confidence):

    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO mood_history
        (user_id, conversation_id, message, emotion, confidence)
        VALUES(%s,%s,%s,%s,%s)
        """,
        (user_id, conversation_id, message, emotion, confidence)
    )

    conn.commit()

    cursor.close()
    conn.close()


# ---------------- USER MEMORY ----------------

def load_user_memory(user_id):

    conn = get_db_connection()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT memory_key, memory_value, confidence
        FROM user_memory
        WHERE user_id=%s
        ORDER BY memory_key ASC
        """,
        (user_id,)
    )

    memories = cursor.fetchall()

    cursor.close()
    conn.close()

    return memories


def upsert_user_memory(user_id, memory_key, memory_value, confidence):

    conn = get_db_connection()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id
        FROM user_memory
        WHERE user_id=%s AND memory_key=%s
        LIMIT 1
        """,
        (user_id, memory_key)
    )

    existing_memory = cursor.fetchone()

    if existing_memory:

        cursor.execute(
            """
            UPDATE user_memory
            SET memory_value=%s,
                confidence=%s,
                updated_at=CURRENT_TIMESTAMP
            WHERE id=%s
            """,
            (memory_value, confidence, existing_memory["id"])
        )

    else:

        cursor.execute(
            """
            INSERT INTO user_memory
            (user_id, memory_key, memory_value, confidence)
            VALUES(%s,%s,%s,%s)
            """,
            (user_id, memory_key, memory_value, confidence)
        )

    conn.commit()

    cursor.close()
    conn.close()

# ---------------- CONVERSATIONS ----------------

def create_conversation(user_id, title="New Chat"):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO conversations(user_id, title)
        VALUES(%s,%s)
        """,
        (user_id, title)
    )

    conn.commit()

    conversation_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return conversation_id


def get_latest_conversation(user_id):

    conn = get_db_connection()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM conversations
        WHERE user_id=%s
        ORDER BY updated_at DESC, created_at DESC, id DESC
        LIMIT 1
        """,
        (user_id,)
    )

    conversation = cursor.fetchone()

    cursor.close()
    conn.close()

    return conversation


def get_or_create_latest_conversation(user_id):

    conversation = get_latest_conversation(user_id)

    if conversation:

        return conversation["id"]

    return create_conversation(user_id)


def get_conversations(user_id):

    conn = get_db_connection()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM conversations
        WHERE user_id=%s
        ORDER BY updated_at DESC, created_at DESC, id DESC
        """,
        (user_id,)
    )

    conversations = cursor.fetchall()

    cursor.close()
    conn.close()

    return conversations


def get_conversation(conversation_id, user_id=None):

    conn = get_db_connection()

    cursor = conn.cursor(dictionary=True)

    if user_id is None:

        cursor.execute(
            """
            SELECT *
            FROM conversations
            WHERE id=%s
            """,
            (conversation_id,)
        )

    else:

        cursor.execute(
            """
            SELECT *
            FROM conversations
            WHERE id=%s AND user_id=%s
            """,
            (conversation_id, user_id)
        )

    conversation = cursor.fetchone()

    cursor.close()
    conn.close()

    return conversation


def get_conversation_title(conversation_id):

    conn = get_db_connection()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT title
        FROM conversations
        WHERE id=%s
        """,
        (conversation_id,)
    )

    conversation = cursor.fetchone()

    cursor.close()
    conn.close()

    if conversation:

        return conversation["title"]

    return None


def update_conversation_title_if_new(conversation_id, title):

    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE conversations
        SET title=%s
        WHERE id=%s AND title='New Chat'
        """,
        (title, conversation_id)
    )

    conn.commit()

    cursor.close()
    conn.close()


def delete_conversation(conversation_id):

    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM conversations
        WHERE id=%s
        """,
        (conversation_id,)
    )

    conn.commit()

    cursor.close()
    conn.close()
# ---------------- PROFILE ----------------

def get_user_profile(user_id):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, full_name, email
        FROM users
        WHERE id=%s
    """, (user_id,))

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    return user


def get_latest_mood(user_id):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT emotion
        FROM mood_history
        WHERE user_id=%s
        ORDER BY id DESC
        LIMIT 1
    """, (user_id,))

    mood = cursor.fetchone()

    cursor.close()
    conn.close()

    if mood:
        return mood["emotion"]

    return "Unknown"


def get_total_conversations(user_id):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM conversations
        WHERE user_id=%s
    """, (user_id,))

    total = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    return total


def get_total_messages(user_id):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM chat_history
        WHERE user_id=%s
    """, (user_id,))

    total = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    return total