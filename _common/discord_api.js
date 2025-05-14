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
function sendMessage(channelId, message) {
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
    Logger.log("message_id = " + responseData.id);
    return responseData.id;  // DiscordのメッセージIDを返す
  } else {
    Logger.log("Error: " + responseData);
    return null;
  }
}
  
// メッセージにリアクションをつける関数
// https://discord.com/developers/docs/resources/channel#reaction-object-reaction-structure
function addReaction(channelId, messageId, emoji) {
  const payload = {
    apiPath: `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`,
    method: "PUT",
    discordToken: DISCORD_BOT_TOKEN // Discord Botのトークン
  };

  Logger.log("Sending Payload: " + JSON.stringify(payload));

  const response = postDiscordAPI(payload);
}

// ユーザーにロールを付与する関数
// https://discord.com/developers/docs/resources/guild#add-guild-member
function addRoleToUser(userId, roleId) {
  const payload = {
    apiPath: `/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`,
    method: "PUT",
    discordToken: DISCORD_BOT_TOKEN // Discord Botのトークン
  };

  Logger.log("Sending Payload: " + JSON.stringify(payload));

  const response = postDiscordAPI(payload);
}
