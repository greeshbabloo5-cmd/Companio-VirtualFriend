from sql.database import register_user, login_user
print("Registering User...")

status, message = register_user(

    "Greeshma",
    "greeshma@gmail.com",
    "123456"

)

print(status)
print(message)

print()

print("Trying Login...")

user = login_user(

    "greeshma@gmail.com",
    "123456"

)

print(user)