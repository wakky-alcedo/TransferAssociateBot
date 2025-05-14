function postDiscordAPI(payload) {
  // payload
  // {
  //   apiPath: "/channels/123456789012345678/messages",
  //   method: "POST",
  //   body: {
  //     content: "Cloudflare Workers経由の投稿テスト"
  //   },
  //   discordToken: DISCORD_BOT_TOKEN // Discord Botのトークン
  // };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(WORKER_URL, options);
    Logger.log("Response Code: " + response.getResponseCode());
    Logger.log("Response Body: " + response.getContentText());
    if (response.getResponseCode() >= 200 && response.getResponseCode() < 300) {
      return response.getContentText();
    } else {
      Logger.log("Error: " + response.getContentText());
      return null;
    }
  } catch (e) {
    Logger.log("Error: " + e.toString());
    return null;
  }
}


// メッセージを送信する関数（ channelId は threadId でも可）
function sendMessage(token, channelId, message) {
  if (!message) return;
  const payload = {
    apiPath: `/channels/${channelId}/messages`,
    method: "POST",
    body: {
      content: message
    },
    discordToken: token // Discord Botのトークン
  };

  Logger.log("Sending Payload: " + JSON.stringify(payload));

  const response = postDiscordAPI(payload);
  const responseData = JSON.parse(response);
  Logger.log("Response Data: " + JSON.stringify(responseData));
  if (responseData && responseData.id) {
    Logger.log("message_id = " + responseData.id);
    return responseData.id;  // DiscordのメッセージIDを返す
  } else {
    Logger.log("Error: " + responseData);
    return null;
  }
}

// メッセージを編集する関数
function editDiscordMessage(token, channelId, messageId, newContent) {
  if (!messageId) return;

  const payload = {
    apiPath: `/channels/${channelId}/messages/${messageId}`,
    method: "PATCH",
    body: {
      content: replaceMentions(newContent)
    },
    discordToken: token // Discord Botのトークン
  };
  Logger.log("Editing Payload: " + JSON.stringify(payload));
  const response = postDiscordAPI(payload);
}
  
// メッセージにリアクションをつける関数
// https://discord.com/developers/docs/resources/channel#reaction-object-reaction-structure
function addReaction(token, channelId, messageId, emoji) {
  const payload = {
    apiPath: `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`,
    method: "PUT",
    discordToken: token // Discord Botのトークン
  };

  Logger.log("Sending Payload: " + JSON.stringify(payload));

  const response = postDiscordAPI(payload);
}

// ユーザーにロールを付与する関数
// https://discord.com/developers/docs/resources/guild#add-guild-member
function addRoleToUser(token, userId, roleId) {
  const payload = {
    apiPath: `/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`,
    method: "PUT",
    discordToken: token // Discord Botのトークン
  };

  Logger.log("Sending Payload: " + JSON.stringify(payload));

  const response = postDiscordAPI(payload);
}

// ユーザーからロールを削除する関数
// https://discord.com/developers/docs/resources/guild#remove-guild-member-role
function removeRoleFromUser(token, userId, roleId) {
  const payload = {
    apiPath: `/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`,
    method: "DELETE",
    discordToken: token // Discord Botのトークン
  };

  Logger.log("Sending Payload: " + JSON.stringify(payload));

  const response = postDiscordAPI(payload);
}

// エラーメッセージを専用スレッドに送信する関数
function sendErrorMessage(errorMessage) {
  sendMessage(BOT_TOKEN_NOTIFY, "1372057829938171986", errorMessage); // エラーメッセージを送信
}