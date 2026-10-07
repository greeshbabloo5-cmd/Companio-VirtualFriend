import sys
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import csv
import io
import re
from flask import Flask, render_template, request, redirect, url_for, jsonify, session, Response, send_from_directory
from db import (
    register_user,
    login_user,
    create_conversation,
    get_or_create_latest_conversation,
    get_conversations,
    get_conversation,
    load_chat,
    get_user_profile,
    get_latest_mood,
    get_today_mood,
    get_total_messages,
    get_total_conversations,
    save_user_mood,
    get_mood_history,
    get_mood_statistics,
    get_today_mood_display,
    get_current_streak,
    get_mood_balance_score,
    get_user_chat_export,
    get_user_mood_export,
    update_user_profile,
    get_user_settings,
    update_user_settings,
    save_push_subscription,
    delete_push_subscription,
    delete_user_push_subscriptions,
    get_user_push_subscriptions,
)
from ai.chat_manager import (
    chat,
    load_chat_with_temp,
    clear_temp_chat,
)
import notifications

app = Flask(__name__)

app.secret_key = "companio_secret_key"


@app.before_request
def cleanup_temp_chat_on_navigation():
    if "user_id" in session:
        endpoint = request.endpoint
        # Discard temporary unpersisted messages when leaving the current chat session
        if endpoint and endpoint not in ("chat_page", "send_message", "static"):
            clear_temp_chat(session["user_id"])


# ---------------- HOME ----------------

@app.route('/')
def home():
    return render_template("home.html")


# ---------------- REGISTER ----------------

@app.route('/register', methods=['GET', 'POST'])
def register():

    if request.method == "POST":

        fullname = request.form.get("fullname", "").strip()
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "").strip()
        parent_phone_primary = request.form.get("parent_phone_primary")
        parent_phone_secondary = request.form.get("parent_phone_secondary")

        primary_val = (parent_phone_primary or "").strip()
        secondary_val = (parent_phone_secondary or "").strip()

        # Primary must contain exactly 10 digits
        if not primary_val or len(primary_val) != 10 or not primary_val.isdigit():
            return "Primary emergency contact must be exactly 10 digits.", 400

        # Secondary may be empty; if provided, must also be 10 digits and not duplicate
        if secondary_val:
            if len(secondary_val) != 10 or not secondary_val.isdigit():
                return "Secondary emergency contact must be exactly 10 digits.", 400
            if secondary_val == primary_val:
                return "Primary and secondary emergency contacts cannot be the same.", 400
        else:
            secondary_val = None

        status, message = register_user(
            fullname,
            email,
            password,
            primary_val,
            secondary_val
        )

        if status:
            return redirect(url_for("login"))

        return message

    return render_template("register.html")


# ---------------- LOGIN ----------------

@app.route('/login', methods=['GET', 'POST'])
def login():

    if request.method == "POST":

        email = request.form["email"]
        password = request.form["password"]

        # Check user credentials
        user = login_user(email, password)

        if user:

            session["user_id"] = user["id"]
            session["user_name"] = user["full_name"]
            session["parent_phone"] = user.get("parent_phone_primary") or user.get("parent_phone") or ""
            session["parent_phone_primary"] = user.get("parent_phone_primary") or ""
            session["parent_phone_secondary"] = user.get("parent_phone_secondary") or ""
            session.pop("conversation_id", None)

            return redirect(url_for("dashboard"))

        return "Invalid Email or Password"

    return render_template("login.html")


# ---------------- LOGOUT ----------------

@app.route('/logout')
def logout():

    if "user_id" in session:
        clear_temp_chat(session["user_id"])

    session.clear()

    return redirect(url_for("home"))


# ---------------- DASHBOARD ----------------

@app.route('/dashboard')
def dashboard():

    if "user_id" not in session:

        return redirect(url_for("login"))

    current_mood = get_today_mood(session["user_id"])

    return render_template(
        "dashboard.html",
        username=session["user_name"],
        current_mood=current_mood
    )

# ---------------- PROFILE ----------------

@app.route("/profile")
def profile():

    if "user_id" not in session:

        return redirect(url_for("login"))

    current_mood = get_today_mood(session["user_id"])

    user = get_user_profile(session["user_id"])

    latest_mood = get_latest_mood(session["user_id"])

    total_messages = get_total_messages(session["user_id"])

    total_conversations = get_total_conversations(session["user_id"])

    return render_template(

        "profile.html",

        user=user,

        current_mood=current_mood,

        latest_mood=latest_mood,

        total_messages=total_messages,

        total_conversations=total_conversations

    )
@app.route('/continue_chat')
def continue_chat():

    if "user_id" not in session:

        return redirect(url_for("login"))

    clear_temp_chat(session["user_id"])
    conversation_id = get_or_create_latest_conversation(session["user_id"])
    session["conversation_id"] = conversation_id

    return redirect(url_for("chat_page"))


# ---------------- CHAT ----------------

@app.route('/chat')
def chat_page():

    if "user_id" not in session:

        return redirect(url_for("login"))

    conversation_id = session.get("conversation_id")

    if not conversation_id:

        return redirect(url_for("dashboard"))

    conversation = get_conversation(conversation_id, session["user_id"])

    if conversation is None:

        session.pop("conversation_id", None)

        return redirect(url_for("dashboard"))

    return render_template(
        "chat.html",
        username=session["user_name"],
        conversation_id=conversation_id,
        conversations=get_conversations(session["user_id"]),
        messages=load_chat_with_temp(session["user_id"], conversation_id)
    )


@app.route('/new_chat')
def new_chat():

    if "user_id" not in session:

        return redirect(url_for("login"))

    clear_temp_chat(session["user_id"])
    session["conversation_id"] = create_conversation(session["user_id"])

    return redirect(url_for("chat_page"))


@app.route('/conversation/<int:conversation_id>')
def open_conversation(conversation_id):

    if "user_id" not in session:

        return redirect(url_for("login"))

    conversation = get_conversation(conversation_id, session["user_id"])

    if conversation is None:

        session.pop("conversation_id", None)

        return redirect(url_for("dashboard"))

    if session.get("conversation_id") != conversation_id:
        clear_temp_chat(session["user_id"])

    session["conversation_id"] = conversation_id

    return redirect(url_for("chat_page"))


# ---------------- AI CHAT ----------------

@app.route('/send_message', methods=['POST'])
def send_message():

    if "user_id" not in session:
        return jsonify({"reply": "Please login first."})

    data = request.get_json(silent=True) or request.form or {}
    message = (data.get("message") or "").strip()
    language = (data.get("language") or "English").strip()
    voice_gender = data.get("voice_gender", "female")

    if not message:
        return jsonify({"reply": "Please type a message."})

    # Detect explicit language switch in message
    clean_msg = message.lower().strip()
    if any(phrase in clean_msg for phrase in ["speak in english", "talk in english", "reply in english", "switch to english", "speak english", "talk english"]) or clean_msg in ["english", "in english"]:
        language = "English"
    elif any(phrase in clean_msg for phrase in ["speak in kannada", "talk in kannada", "reply in kannada", "switch to kannada", "speak kannada", "talk kannada", "kannadadalli matadi", "kannadadalli mathadi", "kannadadalli maathadi"]) or clean_msg in ["kannada", "in kannada"]:
        language = "Kannada"
    else:
        language = "Kannada" if language.lower() == "kannada" else "English"

    conversation_id = session.get("conversation_id")

    if conversation_id is None:
        conversation_id = get_or_create_latest_conversation(session["user_id"])
        session["conversation_id"] = conversation_id

    conversation = get_conversation(
        conversation_id,
        session["user_id"]
    )

    if conversation is None:
        conversation_id = get_or_create_latest_conversation(session["user_id"])
        session["conversation_id"] = conversation_id

    try:
        result = chat(
            session["user_id"],
            conversation_id,
            message,
            language=language,
            voice_gender=voice_gender
        )

        return jsonify(result), 200
    except Exception as e:
        print(f"Chat processing error: {e}")
        return jsonify({"reply": "I'm having a little trouble thinking right now. Please try again."}), 200
# ---------------- EMERGENCY SUPPORT ----------------

@app.route("/emergency_support")
def emergency_support():

    if "user_id" not in session:
        return redirect(url_for("login"))

    user_id = session["user_id"]
    user = get_user_profile(user_id)

    parent_phone_primary = (
        (user.get("parent_phone_primary") if user else None)
        or (user.get("parent_phone") if user else None)
        or session.get("parent_phone_primary")
        or session.get("parent_phone")
        or ""
    )
    parent_phone_primary = str(parent_phone_primary).strip() if parent_phone_primary else ""
    if parent_phone_primary.lower() == "none":
        parent_phone_primary = ""

    parent_phone_secondary = (
        (user.get("parent_phone_secondary") if user else None)
        or session.get("parent_phone_secondary")
        or ""
    )
    parent_phone_secondary = str(parent_phone_secondary).strip() if parent_phone_secondary else ""
    if parent_phone_secondary.lower() == "none":
        parent_phone_secondary = ""

    masked_primary = ""
    if parent_phone_primary and len(parent_phone_primary) >= 4:
        masked_primary = "••••••" + parent_phone_primary[-4:]
    elif parent_phone_primary:
        masked_primary = parent_phone_primary

    masked_secondary = ""
    if parent_phone_secondary and len(parent_phone_secondary) >= 4:
        masked_secondary = "••••••" + parent_phone_secondary[-4:]
    elif parent_phone_secondary:
        masked_secondary = parent_phone_secondary

    return render_template(
        "emergency_support.html",
        parent_phone=parent_phone_primary,
        parent_phone_primary=parent_phone_primary,
        parent_phone_secondary=parent_phone_secondary,
        masked_phone=masked_primary,
        masked_primary=masked_primary,
        masked_secondary=masked_secondary
    )


@app.route("/send_sos", methods=["POST"])
def send_sos():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please log in first."
        }), 401

    user = get_user_profile(session["user_id"])
    parent_phone_primary = (
        (user.get("parent_phone_primary") if user else None)
        or (user.get("parent_phone") if user else None)
        or session.get("parent_phone_primary")
        or session.get("parent_phone")
        or ""
    )
    parent_phone_secondary = (
        (user.get("parent_phone_secondary") if user else None)
        or session.get("parent_phone_secondary")
        or ""
    )
    parent_phone_primary = str(parent_phone_primary).strip() if parent_phone_primary else ""
    parent_phone_secondary = str(parent_phone_secondary).strip() if parent_phone_secondary else ""

    data = request.get_json(silent=True) or request.form or {}
    target = data.get("target", "primary")
    target_phone = parent_phone_secondary if target == "secondary" else parent_phone_primary

    if not target_phone:
        return jsonify({
            "success": False,
            "message": "No emergency contact registered."
        }), 400

    return jsonify({
        "success": True,
        "title": "SOS Alert Prepared",
        "message": "Your emergency contact has been selected successfully.",
        "parent_phone": target_phone,
        "parent_phone_primary": parent_phone_primary,
        "parent_phone_secondary": parent_phone_secondary
    }), 200


@app.route("/save_thought", methods=["POST"])
def save_thought():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please log in first."
        }), 401

    data = request.get_json(silent=True) or request.form
    thought = (data.get("thought") or "").strip()

    if not thought:
        return jsonify({
            "success": False,
            "message": "Please write a thought before saving."
        }), 400

    thought = thought[:2000]

    try:
        user_settings = get_user_settings(session["user_id"])
        if user_settings.get("saveMoodHistory", True):
            save_user_mood(
                session["user_id"],
                "Calm",
                thought
            )

        return jsonify({
            "success": True,
            "message": "Your thought has been safely saved 💜"
        })

    except Exception as e:
        print("Save thought error:", e)
        return jsonify({
            "success": False,
            "message": "Unable to save your thought right now."
        }), 500

# ---------------- SETTINGS ----------------

@app.route("/settings")
def settings():

    if "user_id" not in session:
        return redirect(url_for("login"))

    user = get_user_profile(session["user_id"])
    user_settings = get_user_settings(session["user_id"])

    return render_template("settings.html", user=user, settings=user_settings)


@app.route("/api/settings", methods=["GET", "POST"])
def api_settings():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please log in first."
        }), 401

    user_id = session["user_id"]

    if request.method == "POST":
        data = request.get_json(silent=True) or request.form or {}
        payload = data.get("settings", data) if isinstance(data.get("settings"), dict) else data

        try:
            update_user_settings(user_id, payload)
            updated_settings = get_user_settings(user_id)
            return jsonify({
                "success": True,
                "message": "Settings updated successfully.",
                "settings": updated_settings,
                **updated_settings
            }), 200
        except Exception as e:
            print("API update settings error:", e)
            return jsonify({
                "success": False,
                "message": "Failed to save settings to database."
            }), 500

    try:
        settings_data = get_user_settings(user_id)
        return jsonify({
            "success": True,
            "settings": settings_data,
            **settings_data
        }), 200
    except Exception as e:
        print("API get settings error:", e)
        return jsonify({
            "success": False,
            "message": "Failed to retrieve settings."
        }), 500


# ---------------- SERVICE WORKER & NOTIFICATIONS ----------------

@app.route("/service-worker.js")
def service_worker():
    return send_from_directory(
        app.static_folder,
        "service-worker.js",
        mimetype="application/javascript"
    )


@app.route("/api/notifications/vapid-public-key", methods=["GET"])
def api_notification_vapid_key():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401
    return jsonify({
        "success": True,
        "publicKey": notifications.get_vapid_public_key()
    })


@app.route("/api/notifications/subscribe", methods=["POST"])
def api_notification_subscribe():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    sub = data.get("subscription", data)
    endpoint = sub.get("endpoint")
    keys = sub.get("keys", {})
    p256dh = keys.get("p256dh")
    auth = keys.get("auth")

    if not endpoint or not p256dh or not auth:
        return jsonify({"success": False, "message": "Invalid subscription payload."}), 400

    try:
        save_push_subscription(session["user_id"], endpoint, p256dh, auth)
        return jsonify({"success": True, "message": "Push subscription saved successfully."}), 200
    except Exception as e:
        print("api_notification_subscribe error:", e)
        return jsonify({"success": False, "message": "Failed to save push subscription."}), 500


@app.route("/api/notifications/unsubscribe", methods=["POST"])
def api_notification_unsubscribe():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    endpoint = data.get("endpoint")

    try:
        if endpoint:
            delete_push_subscription(endpoint)
        else:
            delete_user_push_subscriptions(session["user_id"])
        return jsonify({"success": True, "message": "Push subscription removed."}), 200
    except Exception as e:
        print("api_notification_unsubscribe error:", e)
        return jsonify({"success": False, "message": "Failed to remove push subscription."}), 500


@app.route("/api/notifications/trigger", methods=["POST"])
def api_notification_trigger():
    """
    Triggers a notification for the current logged-in user according to their preferences.
    Type can be: 'motivation', 'mood', 'wellness'.
    """
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    notification_type = data.get("type", "motivation")

    try:
        result = notifications.send_user_notification(session["user_id"], notification_type)
        return jsonify({"success": True, "result": result}), 200
    except Exception as e:
        print("api_notification_trigger error:", e)
        return jsonify({"success": False, "message": str(e)}), 500


@app.route("/update-profile", methods=["POST"])
def update_profile():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please log in first."
        }), 401

    data = request.get_json(silent=True) or request.form or {}
    full_name = (data.get("full_name") or data.get("name") or "").strip()
    email = (data.get("email") or "").strip()

    if not full_name:
        return jsonify({
            "success": False,
            "message": "Name cannot be empty."
        }), 400

    if not email:
        return jsonify({
            "success": False,
            "message": "Email cannot be empty."
        }), 400

    email_regex = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    if not re.match(email_regex, email):
        return jsonify({
            "success": False,
            "message": "Please enter a valid email address."
        }), 400

    user_id = session["user_id"]
    success, message = update_user_profile(user_id, full_name, email)

    if success:
        session["user_name"] = full_name
        return jsonify({
            "success": True,
            "message": message or "Profile updated successfully."
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": message or "Failed to update profile."
        }), 400



@app.route("/export_chats")
def export_chats():

    if "user_id" not in session:
        return redirect(url_for("login"))

    user_id = session["user_id"]
    chat_rows = get_user_chat_export(user_id)

    si = io.StringIO()
    writer = csv.writer(si)
    writer.writerow(["Conversation ID", "Conversation Title", "Role", "Message", "Created At"])

    for r in chat_rows:
        writer.writerow([
            r.get("conversation_id") or "",
            r.get("conversation_title") or "Untitled Conversation",
            r.get("role") or "",
            r.get("message") or "",
            r.get("created_at") or ""
        ])

    csv_output = "\ufeff" + si.getvalue()

    return Response(
        csv_output,
        mimetype="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=companio_chat_history.csv"
        }
    )


@app.route("/export_mood")
@app.route("/export_mood_history")
def export_mood():

    if "user_id" not in session:
        return redirect(url_for("login"))

    user_id = session["user_id"]
    mood_rows = get_user_mood_export(user_id)

    si = io.StringIO()
    writer = csv.writer(si)
    writer.writerow(["Conversation ID", "Message", "Emotion", "Confidence", "Created At"])

    for r in mood_rows:
        writer.writerow([
            r.get("conversation_id") or "",
            r.get("message") or "",
            r.get("emotion") or "",
            r.get("confidence") if r.get("confidence") is not None else "",
            r.get("created_at") or ""
        ])

    csv_output = "\ufeff" + si.getvalue()

    return Response(
        csv_output,
        mimetype="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=companio_mood_history.csv"
        }
    )

# -----------------------------
# Personalized Recommendations / For You
# -----------------------------

@app.route("/recommendations")
def recommendations():

    if "user_id" not in session:
        return redirect(url_for("login"))

    current_mood = get_today_mood(session["user_id"])

    return render_template("recommendations.html", current_mood=current_mood)


@app.route("/for_you")
def for_you():

    if "user_id" not in session:
        return redirect(url_for("login"))

    current_mood = get_today_mood(session["user_id"])

    return render_template("for_you.html", current_mood=current_mood)


@app.route("/daily_progress")
def daily_progress():

    if "user_id" not in session:
        return redirect(url_for("login"))

    user_id = session["user_id"]

    current_mood = get_today_mood(user_id)
    latest_mood = current_mood if current_mood else get_latest_mood(user_id)
    today_mood_display = get_today_mood_display(current_mood) if current_mood else "🌿 No mood yet"
    current_streak_display = get_current_streak(user_id)
    wellness_score_display = get_mood_balance_score(user_id, days=7)

    mood_history = get_mood_history(
        user_id,
        days=7
    )

    mood_statistics = get_mood_statistics(
        user_id
    )

    return render_template(
        "daily_progress.html",
        current_mood=current_mood,
        latest_mood=latest_mood,
        today_mood_display=today_mood_display,
        current_streak_display=current_streak_display,
        wellness_score_display=wellness_score_display,
        mood_history=mood_history,
        mood_statistics=mood_statistics
    )


@app.route("/daily_progress_data")
def daily_progress_data():

    if "user_id" not in session:
        return jsonify({
            "error": "Please login first."
        }), 401

    user_id = session["user_id"]

    current_mood = get_today_mood(user_id)
    latest_mood = current_mood if current_mood else get_latest_mood(user_id)
    today_mood_display = get_today_mood_display(current_mood) if current_mood else "🌿 No mood yet"
    current_streak_display = get_current_streak(user_id)
    wellness_score_display = get_mood_balance_score(user_id, days=7)

    mood_history = get_mood_history(
        user_id,
        days=7
    )

    mood_statistics = get_mood_statistics(
        user_id
    )

    return jsonify({
        "current_mood": current_mood,
        "latest_mood": latest_mood,
        "today_mood_display": today_mood_display,
        "current_streak_display": current_streak_display,
        "wellness_score_display": wellness_score_display,
        "mood_history": mood_history,
        "mood_statistics": mood_statistics
    })
@app.route("/music")
def music_recommendations():

    if "user_id" not in session:
        return redirect(url_for("login"))

    return render_template("music.html")
@app.route("/relaxing-sounds")
def relaxing_sounds():
    if "user_id" not in session:
        return redirect(url_for("login"))

    return render_template("relaxing_sounds.html")
@app.route("/daily-motivation")
def daily_motivation():
    if "user_id" not in session:
        return redirect(url_for("login"))

    return render_template("motivation.html")
@app.route("/wellness-activities")
def wellness_activities():
    if "user_id" not in session:
        return redirect(url_for("login"))

    return render_template("wellness_activities.html")
# ---------------- MOOD FEEDBACK ----------------

@app.route("/save-mood", methods=["POST"])
def save_mood():

    if "user_id" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    data = request.get_json(silent=True) or request.form or {}

    raw_mood = (data.get("mood") or "").strip()
    note = (data.get("note") or "").strip()

    mood_mapping = {
        "happy": "Happy",
        "joy": "Happy",
        "love": "Happy",
        "calm": "Calm",
        "relaxed": "Calm",
        "peaceful": "Calm",
        "sad": "Sad",
        "sadness": "Sad",
        "tired": "Tired",
        "anxious": "Anxious",
        "stressed": "Stressed",
        "fear": "Stressed",
        "angry": "Angry",
        "anger": "Angry",
        "energetic": "Energetic",
        "excited": "Energetic",
        "surprise": "Energetic",
        "surprised": "Energetic",
        "neutral": "Calm"
    }

    clean_key = raw_mood.lower()
    if clean_key not in mood_mapping:
        return jsonify({
            "success": False,
            "message": "Invalid mood selected."
        }), 400

    canonical_mood = mood_mapping[clean_key]

    # Keep the note reasonably sized
    note = note[:1000]

    try:
        user_settings = get_user_settings(session["user_id"])
        if user_settings.get("saveMoodHistory", True):
            save_user_mood(
                session["user_id"],
                canonical_mood,
                note
            )

        current_mood = get_today_mood(session["user_id"])
        today_mood_display = get_today_mood_display(current_mood)

        return jsonify({
            "success": True,
            "message": "Your mood has been saved 💜",
            "current_mood": current_mood,
            "today_mood_display": today_mood_display
        })

    except Exception as e:
        print("Mood save error:", e)
        return jsonify({
            "success": False,
            "message": "Unable to save your mood right now."
        }), 500



# Initialize background notification scheduler safely
try:
    notifications.init_scheduler(app)
except Exception as _sched_err:
    print("Warning: Could not initialize notification scheduler:", _sched_err)


if __name__ == "__main__":
    app.run(debug=True)