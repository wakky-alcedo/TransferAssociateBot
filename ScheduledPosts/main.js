const CHANNEL_MAP = {
  "from-幹部（お知らせ）": "1273491895867146301",
  "募集中のフォーム": "1331227294244671621",
  "テスト環境01": "1331888326394773545",
  "その他": null
};

function checkAndSendMessage() {
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
      const msgId = sendMessage(BOT_TOKEN_ADMIN, channelId, replaceMentions(parsedMessage));
      sheet.getRange(i + 1, 4).setValue(channelId);  // チャンネルIDを保存
      sheet.getRange(i + 1, 5).setValue(msgId);  // メッセージIDを保存
      sheet.getRange(i + 1, 6).setValue(parsedMessage); // 投稿済みメッセージを更新
    } else if (parsedMessage !== sentMessage) {  // メッセージが変更されていたら編集
      editDiscordMessage(BOT_TOKEN_ADMIN, channelId, messageId, parsedMessage);
      sheet.getRange(i + 1, 6).setValue(parsedMessage); // 投稿済みメッセージを更新
    }
  }
}

function replaceMentions(message) {
  message = message.replace(/＠/g, "@"); // ＠を@に変換
  // Logger.log("Original Message: " + message); // デバッグ用ログ
  const mentionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("mention_map");
  const mentionData = mentionSheet.getDataRange().getValues();

  mentionData.forEach(row => {
    const [placeholder, type, id] = row;
    const placeholderWithAt = `@${placeholder}`; // placeholderの冒頭に@をつける
    let replacement = placeholderWithAt;
    if (type === "アカウント") {
      replacement = `<@${id}>`;
    } else if (type === "ロール") {
      replacement = `<@&${id}>`;
    } else if (type === "チャンネル") {
      replacement = `<#${id}>`;
    }
    const regex = new RegExp(escapeRegExp(placeholderWithAt), 'g'); // プレースホルダを正規表現に変換
    message = message.replace(regex, replacement);
  });

  // Logger.log("Processed Message: " + message); // デバッグ用ログ
  return message;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
