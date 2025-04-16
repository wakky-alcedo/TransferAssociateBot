import os
import discord
from keep import keep_alive

TOKEN = os.environ['TOKEN']

# スレッドを自動作成するチャンネルのIDリスト
ALLOWED_CHANNELS = {
    1356397240318689370, 1305877350071668791, 1317513632807911466
}  # 設定したいチャンネルIDを追加
# テスト環境02，幹部，くらぶ提案

intents = discord.Intents.default()
intents.message_content = True  # メッセージ内容を取得できるようにする

client = discord.Client(intents=intents)

@client.event
async def on_message(message):
    # 指定されたチャンネルのみでスレッドを作成
    if message.channel.id in ALLOWED_CHANNELS and isinstance(
            message.channel, discord.channel.TextChannel
    ) and message.type == discord.MessageType.default:
        # メッセージの1行目を取得し、20文字以内に制限
        thread_name = message.content.split('\n')[0][:20]
        # スレッドを作成し、1週間の自動アーカイブを指定
        thread = await message.create_thread(name=thread_name,
                                             auto_archive_duration=10080)
        # スレッド作成後、Botはそのスレッドから退出する
        await thread.leave()

@client.event
async def on_ready():
    print("discord.py v" + discord.__version__)

# 通常起動
# client.run(str(TOKEN))
# 常時起動するようにする
keep_alive()
try:
    client.run(str(TOKEN))
except:
    os.system("kill 1")