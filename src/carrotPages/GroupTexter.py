from telethon import TelegramClient, events
from config import API_ID, API_HASH, SOURCE_GROUPS, TARGET_GROUP
import asyncio
import json
import os
import logging
import re
import random

# Enable logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Store sent messages
SENT_MESSAGES_FILE = "sent_messages.json"

def load_sent_messages():
    if os.path.exists(SENT_MESSAGES_FILE):
        with open(SENT_MESSAGES_FILE, "r") as file:
            return json.load(file)
    return {}

def save_sent_messages(sent_messages):
    with open(SENT_MESSAGES_FILE, "w") as file:
        json.dump(sent_messages, file)

# Normalize text by replacing unwanted elements
def filter_text(text):
    if not text:
        return ""

    # Replace any username that starts with @
    text = re.sub(r'@[\w\d_]+', '@Alexandre_BNB', text)

    # Replace ONLY regular t.me links (not invite links)
    text = re.sub(r'https://t\.me/([a-zA-Z0-9_]+)', 'https://t.me/crypto_muski', text)

    # Replace other links EXCEPT Telegram invite links
    text = re.sub(r'https?://(?!t\.me/\+)\S+', 'https://partner.bybit.com/b/31988', text)

    return text

# Authenticate Telegram Client
async def authenticate():
    session_file = "session_name.session"
    if not os.path.exists(session_file):
        phone_number = input("Enter your phone number: ")
        client = TelegramClient("session_name", API_ID, API_HASH)
        await client.connect()
        
        if not await client.is_user_authorized():
            try:
                await client.send_code_request(phone_number)
                code = input("Enter the code you received: ")
                await client.sign_in(phone_number, code)
            except Exception as e:
                print(f"Authentication failed: {e}")
                return None
    else:
        client = TelegramClient("session_name", API_ID, API_HASH)
    
    return client

async def fetch_old_messages(client):
    sent_messages = load_sent_messages()
    messages_to_send = []

    for group in SOURCE_GROUPS:
        if str(group) not in sent_messages:
            sent_messages[str(group)] = []

        count = 0
        async for message in client.iter_messages(group, limit=20):  # Fetch more to account for duplicates
            if count >= 5:
                break  # Stop after getting 5 messages from each group

            if message.id not in sent_messages[str(group)]:
                text = message.text if message.text else ""
                media = message.media if message.media else None
                text = filter_text(text)  # Apply filtering rules

                messages_to_send.append((client, group, media, text))  # Store message for later sending
                sent_messages[str(group)].append(message.id)
                count += 1

    save_sent_messages(sent_messages)
    random.shuffle(messages_to_send)  # Shuffle messages for randomness
    return messages_to_send

async def send_old_messages(messages):
    for client, group, media, text in messages:
        try:
            if media:
                await client.send_file(TARGET_GROUP, media, caption=text)
            else:
                await client.send_message(TARGET_GROUP, text)

            logger.info(f"Sent old message: {text[:30]}... from ({group})")
            await asyncio.sleep(300)  # 5-minute delay before sending the next message

        except Exception as e:
            logger.error(f"Failed to send message from ({group}): {e}")

async def new_message_handler(event):
    message = event.message
    text = message.text if message.text else ""
    media = message.media if message.media else None
    text = filter_text(text)  # Apply filtering rules

    try:
        if media:
            await event.client.send_file(TARGET_GROUP, media, caption=text)
        else:
            await event.client.send_message(TARGET_GROUP, text)

        logger.info(f"Reposted new message: {text[:30]}... from ({event.chat_id})")
    except Exception as e:
        logger.error(f"Failed to repost new message from ({event.chat_id}): {e}")

async def main():
    client = await authenticate()
    if client is None:
        return

    async with client:
        logger.info("Bot started successfully.")
        
        messages = await fetch_old_messages(client)
        await send_old_messages(messages)  # Send stored messages first

        # Start listening for new messages after all old ones are sent
        client.add_event_handler(new_message_handler, events.NewMessage(chats=SOURCE_GROUPS))
        await client.run_until_disconnected()

print("Bot is running...")
loop = asyncio.get_event_loop()
loop.run_until_complete(main())
