from ai.memory import *

user = 1

save_chat(user, "user", "I got a job at Google.")

save_chat(user, "assistant", "Congratulations!")

print(load_chat(user))

save_memory(user, {

    "name":"Greeshma",

    "company":"Google"

})

print(load_memory(user))

save_mood(user, "joy")

print(load_mood(user))