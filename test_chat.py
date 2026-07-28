from ai.chat_manager import chat
from db import get_or_create_latest_conversation

user_id = 1
conversation_id = get_or_create_latest_conversation(user_id)

print("Companio AI Started 🤖")
print("---------------------------")

while True:

    message = input("You : ")

    if message.lower() == "exit":
        break

    reply = chat(user_id, conversation_id, message)

    print("\nCompanio:\n")

    print(reply)

    print()
