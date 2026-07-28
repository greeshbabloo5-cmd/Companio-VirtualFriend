import json
import os

DATA_FOLDER = "data"
CHAT_FILE = os.path.join(DATA_FOLDER, "chat_history.json")
MEMORY_FILE = os.path.join(DATA_FOLDER, "user_memory.json")
MOOD_FILE = os.path.join(DATA_FOLDER, "mood_history.json")


def initialize():

    if not os.path.exists(DATA_FOLDER):
        os.makedirs(DATA_FOLDER)

    files = [CHAT_FILE, MEMORY_FILE, MOOD_FILE]

    for file in files:

        if not os.path.exists(file):
            with open(file, "w") as f:
                json.dump({}, f)

        elif os.path.getsize(file) == 0:
            with open(file, "w") as f:
                json.dump({}, f)


def read_json(file):

    initialize()

    try:

        with open(file, "r") as f:
            return json.load(f)

    except:

        return {}


def write_json(file, data):

    with open(file, "w") as f:
        json.dump(data, f, indent=4)


# ---------------- CHAT ----------------

def load_chat(user_id):

    data = read_json(CHAT_FILE)

    return data.get(str(user_id), [])


def save_chat(user_id, role, message):

    data = read_json(CHAT_FILE)

    if str(user_id) not in data:
        data[str(user_id)] = []

    data[str(user_id)].append({

        "role": role,

        "content": message

    })

    write_json(CHAT_FILE, data)


def clear_chat(user_id):

    data = read_json(CHAT_FILE)

    data[str(user_id)] = []

    write_json(CHAT_FILE, data)


# ---------------- MEMORY ----------------

def load_memory(user_id):

    data = read_json(MEMORY_FILE)

    return data.get(str(user_id), {})


def save_memory(user_id, memory):

    data = read_json(MEMORY_FILE)

    data[str(user_id)] = memory

    write_json(MEMORY_FILE, data)


# ---------------- MOOD ----------------

def load_mood(user_id):

    data = read_json(MOOD_FILE)

    return data.get(str(user_id), [])


def save_mood(user_id, emotion):

    data = read_json(MOOD_FILE)

    if str(user_id) not in data:
        data[str(user_id)] = []

    data[str(user_id)].append(emotion)

    write_json(MOOD_FILE, data)