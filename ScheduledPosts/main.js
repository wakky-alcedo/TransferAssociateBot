const WORKER_URL = "";  // Cloudflare Workers のURL
const DISCORD_BOT_TOKEN = "";  // Discord Botのトークン

const CHANNEL_MAP = {
  "from-幹部（お知らせ）": "1273491895867146301",
  "募集中のフォーム": "1331227294244671621",
  "テスト環境01": "1331888326394773545",
  "その他": null
};

function checkAndPostToDiscord() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("messages");
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  for (let i = 1; i < data.length; i++) {
    const postTime = new Date(data[i][0]);
    if (now < postTime) continue;

    const rawMessage = data[i][1];
    const channelName = data[i][2];
    let channelId = data[i][3];
    const messageId = data[i][4];
    const sentMessage = data[i][5];

    if (channelName in CHANNEL_MAP && channelName !== "その他") {
      channelId = CHANNEL_MAP[channelName];
    }

    const parsedMessage = rawMessage.replace(/\\n/g, "\n");

    if (!messageId) {  // 未送信なら新規投稿
      const msgId = postToDiscord(channelId, parsedMessage);
      sheet.getRange(i + 1, 4).setValue(channelId);  // チャンネルIDを保存
      sheet.getRange(i + 1, 5).setValue(msgId);  // メッセージIDを保存
      sheet.getRange(i + 1, 6).setValue(parsedMessage); // 投稿済みメッセージを更新
    } else if (parsedMessage !== sentMessage) {  // メッセージが変更されていたら編集
      editDiscordMessage(channelId, messageId, parsedMessage);
      sheet.getRange(i + 1, 6).setValue(parsedMessage); // 投稿済みメッセージを更新
    }
  }
}

function postToDiscord(channelId, message) {
  if (!message) return;
  const payload = {
    apiPath: `/channels/${channelId}/messages`,
    method: "POST",
    body: {
      content: message
    },
    discordToken: DISCORD_BOT_TOKEN // Discord Botのトークン
  };

  Logger.log("Sending Payload: " + JSON.stringify(payload));

  const response = postDiscordAPI(payload);
  const responseData = JSON.parse(response);
  Logger.log("Response Data: " + JSON.stringify(responseData));
  if (responseData && responseData.id) {
    return responseData.id;  // DiscordのメッセージIDを返す
  } else {
    Logger.log("Error: " + responseData);
    return null;
  }
}

function editDiscordMessage(channelId, messageId, newContent) {
  if (!messageId) return;

  const payload = {
    apiPath: `/channels/${channelId}/messages/${messageId}`,
    method: "PATCH",
    body: {
      content: newContent
    },
    discordToken: DISCORD_BOT_TOKEN // Discord Botのトークン
  };
  Logger.log("Editing Payload: " + JSON.stringify(payload));
  const response = postDiscordAPI(payload);
}

function replaceMentions(message) {
  const mentionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("mention_map");
  const mentionData = mentionSheet.getDataRange().getValues();

  mentionData.forEach(row => {
    const [placeholder, type, id] = row;
    let replacement = placeholder;
    if (type === "アカウント") {
      replacement = `<@${id}>`;
    } else if (type === "ロール") {
      replacement = `<@&${id}>`;
    } else if (type === "チャンネル") {
      replacement = `<#${id}>`;
    }
    const regex = new RegExp(escapeRegExp(placeholder), 'g');
    message = message.replace(regex, replacement);
  });

  return message;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
