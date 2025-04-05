const WORKER_URL = "";  // Cloudflare Workers のURL


const CHANNEL_MAP = {
  "from-幹部（お知らせ）": "1273491895867146301",
  "募集中のフォーム": "1331227294244671621",
  "テスト環境01": "1331888326394773545",
  "その他": null
};

function checkAndPostToDiscord() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("messages");
  var data = sheet.getDataRange().getValues();
  var now = new Date();

  for (var i = 1; i < data.length; i++) {  
    var postTime = new Date(data[i][0]);  // 投稿日時
    if (now < postTime) continue;  // まだ投稿時間でなければ次のループへ

    var message = data[i][1];             // メッセージ
    var channelName = data[i][2];         // チャンネル名
    var channelId = data[i][3];           // チャンネルID
    var messageId = data[i][4];           // メッセージID
    var sentMessage = data[i][5];         // 投稿済みメッセージ

    if (channelName in CHANNEL_MAP && channelName !== "その他") {
      channelId = CHANNEL_MAP[channelName];
    }

    if (!messageId) {  // 未送信なら新規投稿
      var msgId = postToDiscord(channelId, message);
      sheet.getRange(i + 1, 4).setValue(channelId);  // チャンネルIDを保存
      sheet.getRange(i + 1, 5).setValue(msgId);  // メッセージIDを保存
      sheet.getRange(i + 1, 6).setValue(message); // 投稿済みメッセージを更新
    } else if (message !== sentMessage) {  // メッセージが変更されていたら編集
      editDiscordMessage(channelId, messageId, message);
      sheet.getRange(i + 1, 6).setValue(message); // 投稿済みメッセージを更新
    }
  }
}

function postToDiscord(channelId, message) {
  var payload = {
    "action": "post",
    "channelId": channelId,
    "message": message
  };

  Logger.log("Sending Payload: " + JSON.stringify(payload));  // 🔹 デバッグ用ログ

  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  var response = UrlFetchApp.fetch(WORKER_URL, options);
  Logger.log("Response Code: " + response.getResponseCode());
  Logger.log("Response Body: " + response.getContentText());

  try {
    var json = JSON.parse(response.getContentText());
    return json.messageId;  // メッセージIDを返す
  } catch (e) {
    Logger.log("Discord投稿エラー: " + e);
    return null;
  }
}

function editDiscordMessage(channelId, messageId, newContent) {
  if (!messageId) return;
  var payload = {
    "action": "edit",
    "channelId": channelId,
    "messageId": messageId,
    "message": newContent
  };

  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(WORKER_URL, options);
    Logger.log("Response Code: " + response.getResponseCode());
    Logger.log("Response Body: " + response.getContentText());
  } catch (e) {
    Logger.log("Discordメッセージ編集エラー: " + e.toString());
  }
}