import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash


def get_db_connection():

    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        user=os.environ.get("DB_USER", "root"),
        password=os.environ.get("DB_PASSWORD", ""),
        database=os.environ.get("DB_NAME", "companio_db"),
        port=int(os.environ.get("DB_PORT", 3306))
    )


# ---------------- REGISTER ----------------

def register_user(full_name, email, password, parent_phone_primary=None, parent_phone_secondary=None):

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
        INSERT INTO users (
            full_name,
            email,
            password,
            parent_phone_primary,
            parent_phone_secondary,
            parent_phone
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            full_name,
            email,
            hashed_password,
            parent_phone_primary,
            parent_phone_secondary,
            parent_phone_primary
        )
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
# ---------------- USER MOOD FEEDBACK ----------------

def save_user_mood(user_id, mood, note=""):

    conn = get_db_connection()

    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO mood_history
        (user_id, conversation_id, message, emotion, confidence)
        VALUES(%s, %s, %s, %s, %s)
        """,
        (
            user_id,
            None,
            note,
            mood,
            1.0
        )
    )

    conn.commit()

    cursor.close()
    conn.close()

    return True


# ---------------- USER MEMORY ----------------

def load_user_memory(user_id):

    conn = get_db_connection()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id, memory_key, memory_value, confidence, created_at, updated_at
        FROM user_memory
        WHERE user_id=%s
        ORDER BY updated_at DESC, created_at DESC, id DESC
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

    try:
        cursor.execute(
            """
            SELECT id
            FROM user_memory
            WHERE user_id=%s AND memory_key=%s
            """,
            (user_id, memory_key)
        )

        existing = cursor.fetchone()

        if existing:
            memory_id = existing["id"] if isinstance(existing, dict) else existing[0]
            cursor.execute(
                """
                UPDATE user_memory
                SET memory_value=%s, confidence=%s, updated_at=NOW()
                WHERE id=%s
                """,
                (memory_value, confidence, memory_id)
            )
        else:
            cursor.execute(
                """
                INSERT INTO user_memory
                (user_id, memory_key, memory_value, confidence)
                VALUES (%s,%s,%s,%s)
                """,
                (user_id, memory_key, memory_value, confidence)
            )

        conn.commit()
    finally:
        cursor.close()
        conn.close()


def get_user_memories(user_id):
    """Fetch all memories for a user ordered chronologically (newest first)."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT id, memory_key, memory_value, confidence, created_at, updated_at
        FROM user_memory
        WHERE user_id=%s
        ORDER BY created_at DESC, id DESC
        """,
        (user_id,)
    )
    memories = cursor.fetchall()
    cursor.close()
    conn.close()
    return memories


def delete_user_memory(user_id, memory_id):
    """Delete a specific memory by its ID for a logged-in user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        DELETE FROM user_memory
        WHERE id=%s AND user_id=%s
        """,
        (memory_id, user_id)
    )
    conn.commit()
    deleted = cursor.rowcount > 0
    cursor.close()
    conn.close()
    return deleted


def categorize_memory_key(key):
    k = str(key).strip().lower()
    goal_keywords = ["goal", "aim", "target", "career", "weight", "fitness", "ambition", "dream", "study"]
    if any(kw in k for kw in goal_keywords):
        return "goals"
    relationship_keywords = [
        "family", "mother", "father", "mom", "dad", "brother", "sister",
        "parents", "sibling", "child", "children", "kid", "kids", "son", "daughter",
        "friend", "friends", "bestie", "buddy", "relationship", "partner", "spouse",
        "husband", "wife", "boyfriend", "girlfriend", "fiance"
    ]
    if any(kw in k for kw in relationship_keywords):
        return "relationships"
    preference_keywords = [
        "preference", "food", "diet", "cuisine", "taste", "language", "voice",
        "lifestyle", "hobby", "interest", "like", "favorite", "routine", "music", "sport"
    ]
    if any(kw in k for kw in preference_keywords):
        return "preferences"
    return "facts"


def get_ai_memory_data(user_id):
    """
    Assemble and categorize user memories for the dedicated AI Memory experience.
    Organizes data into:
      1. Hero Summary (total count, last updated, health badge)
      2. 4 Categories: Goals, Relationships, Preferences, Important Facts
      3. Timeline (chronological memory cards)
    """
    memories = get_user_memories(user_id)

    goals = []
    relationships = []
    preferences = []
    facts = []

    for m in memories:
        cat = categorize_memory_key(m.get("memory_key", ""))
        m["category"] = cat
        if cat == "goals":
            goals.append(m)
        elif cat == "relationships":
            relationships.append(m)
        elif cat == "preferences":
            preferences.append(m)
        else:
            facts.append(m)

    total_count = len(memories)
    last_updated_str = "No memories stored yet"
    if memories:
        latest_time = None
        for m in memories:
            t = m.get("updated_at") or m.get("created_at")
            if t and (latest_time is None or t > latest_time):
                latest_time = t
        if latest_time:
            last_updated_str = latest_time.strftime("%b %d, %Y at %I:%M %p")

    if total_count >= 5:
        health_badge = "Optimal Recall"
        health_status = "optimal"
        health_text = "Companio has rich contextual understanding of your life."
    elif total_count > 0:
        health_badge = "Active & Learning"
        health_status = "active"
        health_text = "Companio is actively building memory nodes from your conversations."
    else:
        health_badge = "Ready to Learn"
        health_status = "ready"
        health_text = "Companio is ready to remember your details as you chat."

    return {
        "memories": memories,
        "goals": goals,
        "relationships": relationships,
        "preferences": preferences,
        "facts": facts,
        "total_count": total_count,
        "last_updated": last_updated_str,
        "health_badge": health_badge,
        "health_status": health_status,
        "health_text": health_text
    }

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
        SELECT id, full_name, email, parent_phone, parent_phone_primary, parent_phone_secondary
        FROM users
        WHERE id=%s
    """, (user_id,))

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    return user


def get_user_emergency_contact(user_id):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT parent_phone, parent_phone_primary, parent_phone_secondary
        FROM users
        WHERE id=%s
    """, (user_id,))

    res = cursor.fetchone()

    cursor.close()
    conn.close()

    return res if res else None


def get_user_emergency_contacts(user_id):

    return get_user_emergency_contact(user_id)


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

    return None


def get_today_mood(user_id):
    """
    Return today's latest mood from mood_history for the given user.
    If none exists for today, return None.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT emotion
        FROM mood_history
        WHERE user_id=%s AND DATE(created_at) = CURDATE()
        ORDER BY id DESC
        LIMIT 1
    """, (user_id,))

    mood = cursor.fetchone()

    cursor.close()
    conn.close()

    if mood and mood.get("emotion"):
        return mood["emotion"]

    return None

# ---------------- MOOD PROGRESS ----------------

def get_mood_history(user_id, days=7):

    conn = get_db_connection()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            id,
            emotion,
            message,
            confidence,
            created_at
        FROM mood_history
        WHERE user_id=%s
        AND created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)
        ORDER BY created_at ASC
        """,
        (
            user_id,
            days
        )
    )

    moods = cursor.fetchall()

    cursor.close()
    conn.close()

    return moods
def get_mood_statistics(user_id):

    conn = get_db_connection()

    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            emotion,
            COUNT(*) AS count
        FROM mood_history
        WHERE user_id=%s
        GROUP BY emotion
        ORDER BY count DESC
        """,
        (user_id,)
    )

    statistics = cursor.fetchall()

    cursor.close()
    conn.close()

    return statistics


def get_today_mood_display(latest_mood):
    """
    Format the latest mood emotion for display according to Companio specifications.
    Maps:
      Happy -> 😊 Happy (including joy, love)
      Calm -> 😌 Calm (including relaxed, peaceful)
      Sad -> 😔 Sad (including sadness)
      Stressed -> 😣 Stressed (including fear, anxious)
      Angry -> 😠 Angry (including anger)
      Excited -> 🤩 Excited (including surprise, surprised, energetic)
    If no record exists or unrecognized/empty: '🌿 No mood yet'
    """
    if not latest_mood or str(latest_mood).strip().lower() in ("unknown", "none", ""):
        return "🌿 No mood yet"

    mood_str = str(latest_mood).strip().lower()
    mapping = {
        "happy": "😊 Happy",
        "joy": "😊 Happy",
        "love": "😊 Happy",
        "calm": "😌 Calm",
        "relaxed": "😌 Calm",
        "peaceful": "😌 Calm",
        "sad": "😔 Sad",
        "sadness": "😔 Sad",
        "stressed": "😣 Stressed",
        "fear": "😣 Stressed",
        "anxious": "😣 Stressed",
        "angry": "😠 Angry",
        "anger": "😠 Angry",
        "excited": "🤩 Excited",
        "surprise": "🤩 Excited",
        "surprised": "🤩 Excited",
        "energetic": "🤩 Excited",
        "tired": "😔 Sad",
        "neutral": "😌 Calm",
    }
    return mapping.get(mood_str, f"😊 {str(latest_mood).capitalize()}")


def get_current_streak(user_id):
    """
    Calculate consecutive days the user has logged at least one mood.
    Returns: '0 Days', '1 Day', '5 Days', etc.
    """
    import datetime

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT DISTINCT DATE(created_at) AS log_date
        FROM mood_history
        WHERE user_id=%s
        ORDER BY log_date DESC
    """, (user_id,))

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    if not rows:
        return "0 Days"

    logged_dates = {row["log_date"] for row in rows if row.get("log_date")}

    today = datetime.date.today()
    check_date = today

    # Check if user logged today; if not, check if streak can continue from yesterday
    if check_date not in logged_dates:
        check_date = today - datetime.timedelta(days=1)
        if check_date not in logged_dates:
            return "0 Days"

    streak = 0
    while check_date in logged_dates:
        streak += 1
        check_date -= datetime.timedelta(days=1)

    return f"{streak} Day" if streak == 1 else f"{streak} Days"


def get_mood_balance_score(user_id, days=7):
    """
    Calculate a wellness percentage using only the last 7 days.
    Suggested mapping:
      Happy: 100, Calm: 90, Excited: 95, Neutral: 70, Sad: 40, Stressed: 30, Angry: 20
    Returns: e.g. '97%' or '0%'
    """
    score_mapping = {
        "happy": 100,
        "joy": 100,
        "love": 100,
        "excited": 95,
        "surprise": 95,
        "surprised": 95,
        "energetic": 95,
        "calm": 90,
        "relaxed": 90,
        "peaceful": 90,
        "neutral": 70,
        "sad": 40,
        "sadness": 40,
        "tired": 40,
        "stressed": 30,
        "fear": 30,
        "anxious": 30,
        "angry": 20,
        "anger": 20
    }

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT emotion
        FROM mood_history
        WHERE user_id=%s
        AND created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)
    """, (user_id, days))

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    if not rows:
        return "0%"

    total_score = sum(score_mapping.get(str(r["emotion"]).strip().lower(), 70) for r in rows)
    avg_score = round(total_score / len(rows))
    return f"{avg_score}%"


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


# ---------------- EXPORT DATA ----------------

def get_user_chat_export(user_id):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            ch.conversation_id,
            COALESCE(c.title, 'Untitled Conversation') AS conversation_title,
            ch.role,
            ch.message,
            ch.created_at
        FROM chat_history ch
        LEFT JOIN conversations c ON ch.conversation_id = c.id AND c.user_id = %s
        WHERE ch.user_id = %s
        ORDER BY ch.conversation_id ASC, ch.id ASC
    """, (user_id, user_id))

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return rows


def get_user_mood_export(user_id):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            conversation_id,
            message,
            emotion,
            confidence,
            created_at
        FROM mood_history
        WHERE user_id = %s
        ORDER BY id ASC
    """, (user_id,))

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return rows


# ---------------- UPDATE PROFILE ----------------

def update_user_profile(user_id, full_name, email):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        # Check if the email already belongs to another user
        cursor.execute(
            "SELECT id FROM users WHERE email=%s AND id != %s",
            (email, user_id)
        )
        existing = cursor.fetchone()

        if existing:
            cursor.close()
            conn.close()
            return False, "This email is already registered."

        cursor.execute(
            """
            UPDATE users
            SET full_name = %s,
                email = %s
            WHERE id = %s
            """,
            (full_name, email, user_id)
        )
        conn.commit()

        cursor.close()
        conn.close()

        return True, "Profile updated successfully."

    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return False, f"Failed to update profile: {str(e)}"


# ---------------- SETTINGS ----------------

def get_user_settings(user_id):
    """
    Retrieve application settings for a specific user from MySQL.
    If no settings record exists for the user yet, a default record is inserted and returned.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT daily_motivation, mood_reminder, wellness_tips, save_chat, save_mood
            FROM settings
            WHERE user_id = %s
            """,
            (user_id,)
        )
        row = cursor.fetchone()

        if not row:
            cursor.execute(
                """
                INSERT INTO settings (user_id, daily_motivation, mood_reminder, wellness_tips, save_chat, save_mood)
                VALUES (%s, 1, 0, 1, 1, 1)
                """,
                (user_id,)
            )
            conn.commit()
            return {
                "dailyMotivation": True,
                "moodReminder": False,
                "wellnessTips": True,
                "saveChatHistory": True,
                "saveMoodHistory": True
            }

        return {
            "dailyMotivation": bool(row.get("daily_motivation", 1)),
            "moodReminder": bool(row.get("mood_reminder", 0)),
            "wellnessTips": bool(row.get("wellness_tips", 1)),
            "saveChatHistory": bool(row.get("save_chat", 1)),
            "saveMoodHistory": bool(row.get("save_mood", 1))
        }

    except Exception as e:
        print("get_user_settings error:", e)
        return {
            "dailyMotivation": True,
            "moodReminder": False,
            "wellnessTips": True,
            "saveChatHistory": True,
            "saveMoodHistory": True
        }
    finally:
        cursor.close()
        conn.close()


def update_user_settings(user_id, settings_data):
    """
    Update application settings for a specific user in MySQL.
    Handles partial and full updates for:
    - dailyMotivation
    - moodReminder
    - wellnessTips
    - saveChatHistory
    - saveMoodHistory
    """
    current = get_user_settings(user_id)

    def parse_bool(val, default):
        if val is None:
            return default
        if isinstance(val, bool):
            return 1 if val else 0
        if isinstance(val, (int, float)):
            return 1 if val != 0 else 0
        if isinstance(val, str):
            return 1 if val.strip().lower() in ("true", "1", "yes", "on") else 0
        return default

    dm_val = settings_data.get("dailyMotivation", settings_data.get("daily_motivation"))
    mr_val = settings_data.get("moodReminder", settings_data.get("mood_reminder"))
    wt_val = settings_data.get("wellnessTips", settings_data.get("wellness_tips"))
    sc_val = settings_data.get("saveChatHistory", settings_data.get("save_chat"))
    sm_val = settings_data.get("saveMoodHistory", settings_data.get("save_mood"))

    daily_motivation = parse_bool(dm_val, 1 if current["dailyMotivation"] else 0)
    mood_reminder = parse_bool(mr_val, 1 if current["moodReminder"] else 0)
    wellness_tips = parse_bool(wt_val, 1 if current["wellnessTips"] else 0)
    save_chat = parse_bool(sc_val, 1 if current["saveChatHistory"] else 0)
    save_mood = parse_bool(sm_val, 1 if current["saveMoodHistory"] else 0)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO settings (user_id, daily_motivation, mood_reminder, wellness_tips, save_chat, save_mood)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                daily_motivation = VALUES(daily_motivation),
                mood_reminder = VALUES(mood_reminder),
                wellness_tips = VALUES(wellness_tips),
                save_chat = VALUES(save_chat),
                save_mood = VALUES(save_mood)
            """,
            (user_id, daily_motivation, mood_reminder, wellness_tips, save_chat, save_mood)
        )
        conn.commit()
        return True
    except Exception as e:
        print("update_user_settings error:", e)
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


# ---------------- PUSH NOTIFICATIONS ----------------

def save_push_subscription(user_id, endpoint, p256dh, auth):
    """
    Save or update a Web Push subscription for a specific user.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM push_subscriptions WHERE endpoint = %s", (endpoint,))
        row = cursor.fetchone()
        if row:
            cursor.execute(
                """
                UPDATE push_subscriptions
                SET user_id = %s, p256dh = %s, auth = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                """,
                (user_id, p256dh, auth, row[0])
            )
        else:
            cursor.execute(
                """
                INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
                VALUES (%s, %s, %s, %s)
                """,
                (user_id, endpoint, p256dh, auth)
            )
        conn.commit()
        return True
    except Exception as e:
        print("save_push_subscription error:", e)
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def delete_push_subscription(endpoint):
    """
    Remove an invalid or expired push subscription endpoint.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM push_subscriptions WHERE endpoint = %s", (endpoint,))
        conn.commit()
        return True
    except Exception as e:
        print("delete_push_subscription error:", e)
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def delete_user_push_subscriptions(user_id):
    """
    Remove all push subscriptions for a specific user.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM push_subscriptions WHERE user_id = %s", (user_id,))
        conn.commit()
        return True
    except Exception as e:
        print("delete_user_push_subscriptions error:", e)
        conn.rollback()
        return False
    finally:
        cursor.close()
        conn.close()


def get_user_push_subscriptions(user_id):
    """
    Retrieve all active push subscriptions for a specific user.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT id, user_id, endpoint, p256dh, auth, created_at, updated_at
            FROM push_subscriptions
            WHERE user_id = %s
            ORDER BY id DESC
            """,
            (user_id,)
        )
        return cursor.fetchall()
    except Exception as e:
        print("get_user_push_subscriptions error:", e)
        return []
    finally:
        cursor.close()
        conn.close()


def get_all_active_users_for_notifications():
    """
    Get all users with active push subscriptions and their notification settings.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """
            SELECT DISTINCT u.id, u.full_name, u.email,
                   COALESCE(s.daily_motivation, 1) AS daily_motivation,
                   COALESCE(s.mood_reminder, 0) AS mood_reminder,
                   COALESCE(s.wellness_tips, 1) AS wellness_tips
            FROM users u
            INNER JOIN push_subscriptions p ON u.id = p.user_id
            LEFT JOIN settings s ON u.id = s.user_id
            """
        )
        return cursor.fetchall()
    except Exception as e:
        print("get_all_active_users_for_notifications error:", e)
        return []
    finally:
        cursor.close()
        conn.close()
