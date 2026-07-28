from flask import Flask, render_template, request, redirect, url_for, jsonify, session
from db import (
    register_user,
    login_user,
    create_conversation,
    get_or_create_latest_conversation,
    get_conversations,
    get_conversation,
    load_chat,
    get_user_profile,
    load_user_memory,
    get_latest_mood,
    get_total_messages,
    get_total_conversations,
)
from ai.chat_manager import chat

app = Flask(__name__)

app.secret_key = "companio_secret_key"


# ---------------- HOME ----------------

@app.route('/')
def home():
    return render_template("home.html")


# ---------------- REGISTER ----------------

@app.route('/register', methods=['GET', 'POST'])
def register():

    if request.method == "POST":

        fullname = request.form["fullname"]
        email = request.form["email"]
        password = request.form["password"]

        status, message = register_user(
            fullname,
            email,
            password
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
            session.pop("conversation_id", None)

            return redirect(url_for("dashboard"))

        return "Invalid Email or Password"

    return render_template("login.html")


# ---------------- LOGOUT ----------------

@app.route('/logout')
def logout():

    session.clear()

    return redirect(url_for("home"))


# ---------------- DASHBOARD ----------------

@app.route('/dashboard')
def dashboard():

    if "user_id" not in session:

        return redirect(url_for("login"))

    return render_template(
        "dashboard.html",
        username=session["user_name"]
    )

# ---------------- PROFILE ----------------

@app.route("/profile")
def profile():

    if "user_id" not in session:

        return redirect(url_for("login"))

    user = get_user_profile(session["user_id"])

    memories = load_user_memory(session["user_id"])

    latest_mood = get_latest_mood(session["user_id"])

    total_messages = get_total_messages(session["user_id"])

    total_conversations = get_total_conversations(session["user_id"])

    return render_template(

        "profile.html",

        user=user,

        memories=memories,

        latest_mood=latest_mood,

        total_messages=total_messages,

        total_conversations=total_conversations

    )
@app.route('/continue_chat')
def continue_chat():

    if "user_id" not in session:

        return redirect(url_for("login"))

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
        messages=load_chat(conversation_id)
    )


@app.route('/new_chat')
def new_chat():

    if "user_id" not in session:

        return redirect(url_for("login"))

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

    session["conversation_id"] = conversation_id

    return redirect(url_for("chat_page"))


# ---------------- AI CHAT ----------------

@app.route('/send_message', methods=['POST'])
def send_message():

    if "user_id" not in session:
        return jsonify({"reply": "Please login first."})

    data = request.get_json()
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"reply": "Please type a message."})

    conversation_id = session.get("conversation_id")

    if conversation_id is None:
        return jsonify({"reply": "Please start or continue a chat first."}), 400

    conversation = get_conversation(
        conversation_id,
        session["user_id"]
    )

    if conversation is None:
        session.pop("conversation_id", None)
        return jsonify({"reply": "Conversation not found."}), 403

    # chat() now returns a dictionary
    result = chat(
        session["user_id"],
        conversation_id,
        message
    )

    return jsonify(result)
# ---------------- EMERGENCY SUPPORT ----------------

@app.route("/emergency_support")
def emergency_support():

    if "user_id" not in session:
        return redirect(url_for("login"))

    return render_template("emergency_support.html")

# ---------------- SETTINGS ----------------

@app.route("/settings")
def settings():

    if "user_id" not in session:
        return redirect(url_for("login"))

    return render_template("settings.html")
# -----------------------------
# Personalized Recommendations
# -----------------------------

@app.route("/recommendations")
def recommendations():

    if "user_id" not in session:
        return redirect(url_for("login"))

    return render_template("recommendations.html")

@app.route("/daily_progress")
def daily_progress():

    if "user_id" not in session:
        return redirect(url_for("login"))

    return render_template("daily_progress.html")
if __name__ == "__main__":
    app.run(debug=True)