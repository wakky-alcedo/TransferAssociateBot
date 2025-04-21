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
      if (response.getResponseCode() === 200) {
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