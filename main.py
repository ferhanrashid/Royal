import telebot
from telebot import types
import sqlite3
import random
import time

# Replace with your Telegram bot token
TOKEN = "8697582672:AAFfChJLwszvEJVvymdresp4ENUF6NyWjuQ"

bot = telebot.TeleBot(TOKEN)

# =========================
# DATABASE SETUP
# =========================
conn = sqlite3.connect("royal_games.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        username TEXT,
        first_name TEXT,
        balance INTEGER DEFAULT 1000,
        games_played INTEGER DEFAULT 0,
        wins INTEGER DEFAULT 0
    )
    """
)
conn.commit()

# =========================
# MENUS
# =========================
def main_menu():
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)

    markup.add(
        types.KeyboardButton("🎰 Play Slots"),
        types.KeyboardButton("👤 My Profile")
    )

    markup.add(
        types.KeyboardButton("💳 Deposit"),
        types.KeyboardButton("🏧 Withdraw")
    )

    markup.add(
        types.KeyboardButton("🏆 Leaderboard"),
        types.KeyboardButton("📞 Support")
    )

    return markup


def slot_menu():
    markup = types.InlineKeyboardMarkup()

    markup.add(
        types.InlineKeyboardButton("50 ETB", callback_data="spin_50"),
        types.InlineKeyboardButton("100 ETB", callback_data="spin_100")
    )

    markup.add(
        types.InlineKeyboardButton("250 ETB", callback_data="spin_250"),
        types.InlineKeyboardButton("500 ETB", callback_data="spin_500")
    )

    return markup

# =========================
# HELPER FUNCTIONS
# =========================
def create_user(message):
    user_id = message.from_user.id
    username = message.from_user.username or "NoUsername"
    first_name = message.from_user.first_name or "Player"

    cursor.execute(
        """
        INSERT OR IGNORE INTO users (user_id, username, first_name)
        VALUES (?, ?, ?)
        """,
        (user_id, username, first_name)
    )
    conn.commit()


def get_user(user_id):
    cursor.execute(
        "SELECT user_id, username, first_name, balance, games_played, wins FROM users WHERE user_id = ?",
        (user_id,)
    )
    return cursor.fetchone()


def update_balance(user_id, amount):
    cursor.execute(
        "UPDATE users SET balance = balance + ? WHERE user_id = ?",
        (amount, user_id)
    )
    conn.commit()


def add_game(user_id, won=False):
    cursor.execute(
        "UPDATE users SET games_played = games_played + 1 WHERE user_id = ?",
        (user_id,)
    )

    if won:
        cursor.execute(
            "UPDATE users SET wins = wins + 1 WHERE user_id = ?",
            (user_id,)
        )

    conn.commit()

# =========================
# START COMMAND
# =========================
@bot.message_handler(commands=['start'])
def start(message):
    create_user(message)

    bot.send_message(
        message.chat.id,
        f"👑 Welcome to Royal Games, {message.from_user.first_name}!\n\n"
        f"You received 1000 ETB starting balance.",
        reply_markup=main_menu()
    )

# =========================
# PROFILE
# =========================
@bot.message_handler(func=lambda m: m.text == "👤 My Profile")
def profile(message):
    create_user(message)
    user = get_user(message.from_user.id)

    username = user[1]
    if username == "NoUsername":
        username = "No username"
    else:
        username = "@" + username

    bot.send_message(
        message.chat.id,
        f"👤 Profile\n\n"
        f"Name: {user[2]}\n"
        f"Username: {username}\n"
        f"💰 Balance: {user[3]} ETB\n"
        f"🎮 Games Played: {user[4]}\n"
        f"🏆 Wins: {user[5]}",
        reply_markup=main_menu()
    )

# =========================
# DEPOSIT
# =========================
@bot.message_handler(func=lambda m: m.text == "💳 Deposit")
def deposit(message):
    bot.send_message(
        message.chat.id,
        "💳 Deposit Instructions\n\n"
        "Send payment using:\n"
        "• Telebirr: 0912345678\n"
        "• Minimum Deposit: 50 ETB\n\n"
        "After payment, send your screenshot to support.",
        reply_markup=main_menu()
    )

# =========================
# WITHDRAW
# =========================
@bot.message_handler(func=lambda m: m.text == "🏧 Withdraw")
def withdraw(message):
    user = get_user(message.from_user.id)

    if user[3] < 100:
        bot.send_message(
            message.chat.id,
            "❌ Minimum withdrawal is 100 ETB.",
            reply_markup=main_menu()
        )
        return

    bot.send_message(
        message.chat.id,
        f"🏧 Withdrawal Request\n\n"
        f"Available Balance: {user[3]} ETB\n\n"
        f"Contact support to complete the withdrawal.",
        reply_markup=main_menu()
    )

# =========================
# PLAY SLOTS
# =========================
@bot.message_handler(func=lambda m: m.text == "🎰 Play Slots")
def play_slots(message):
    user = get_user(message.from_user.id)

    bot.send_message(
        message.chat.id,
        f"🎰 Slot Machine\n\n"
        f"Current Balance: {user[3]} ETB\n\n"
        f"Choose your bet:",
        reply_markup=slot_menu()
    )

# =========================
# SLOT CALLBACK
# =========================
@bot.callback_query_handler(func=lambda call: call.data.startswith("spin_"))
def spin_slot(call):
    user_id = call.from_user.id
    bet = int(call.data.split("_")[1])

    user = get_user(user_id)
    balance = user[3]

    if balance < bet:
        bot.answer_callback_query(call.id, "❌ Not enough balance")
        return

    update_balance(user_id, -bet)

    bot.edit_message_text(
        "🎰 Spinning...",
        call.message.chat.id,
        call.message.message_id
    )

    time.sleep(1)

    symbols = ["🍒", "🍋", "🍇", "7️⃣", "⭐"]
    spin = [random.choice(symbols) for _ in range(3)]

    winnings = 0
    won = False

    if spin[0] == spin[1] == spin[2]:
        winnings = bet * 5
        won = True
    elif spin[0] == spin[1] or spin[1] == spin[2] or spin[0] == spin[2]:
        winnings = bet * 2
        won = True

    if winnings > 0:
        update_balance(user_id, winnings)

    add_game(user_id, won)

    updated_user = get_user(user_id)
    result = " | ".join(spin)

    if winnings > 0:
        text = (
            f"🎰 {result}\n\n"
            f"🎉 You won {winnings} ETB!\n"
            f"💰 New Balance: {updated_user[3]} ETB"
        )
    else:
        text = (
            f"🎰 {result}\n\n"
            f"❌ You lost {bet} ETB\n"
            f"💰 New Balance: {updated_user[3]} ETB"
        )

    bot.edit_message_text(
        text,
        call.message.chat.id,
        call.message.message_id,
        reply_markup=slot_menu()
    )

# =========================
# LEADERBOARD
# =========================
@bot.message_handler(func=lambda m: m.text == "🏆 Leaderboard")
def leaderboard(message):
    cursor.execute(
        "SELECT first_name, balance FROM users ORDER BY balance DESC LIMIT 10"
    )
    top_users = cursor.fetchall()

    if not top_users:
        bot.send_message(message.chat.id, "No players yet.")
        return

    text = "🏆 Top Players\n\n"

    for i, user in enumerate(top_users, start=1):
        text += f"{i}. {user[0]} - {user[1]} ETB\n"

    bot.send_message(
        message.chat.id,
        text,
        reply_markup=main_menu()
    )

# =========================
# SUPPORT
# =========================
@bot.message_handler(func=lambda m: m.text == "📞 Support")
def support(message):
    bot.send_message(
        message.chat.id,
        "📞 Support\n\n"
        "Telegram: @RoyalGamesSupport\n"
        "For deposits, withdrawals or help.",
        reply_markup=main_menu()
    )

# =========================
# FALLBACK
# =========================
@bot.message_handler(func=lambda m: True)
def fallback(message):
    bot.send_message(
        message.chat.id,
        "Please use the menu buttons below.",
        reply_markup=main_menu()
    )

print("Royal Games Bot is live...")
bot.infinity_polling(skip_pending=True)
