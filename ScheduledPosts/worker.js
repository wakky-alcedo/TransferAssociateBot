export default {
    async fetch(request) {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
  
      let requestData;
      try {
        requestData = await request.json();
        console.log("Received Data:", requestData);  // 🔹 デバッグ用ログ
      } catch (e) {
        console.log("JSON Parse Error:", e);
        return new Response("Invalid JSON", { status: 400 });
      }
  
      const { action, channelId, messageId, message } = requestData;
  
      if (!action || !channelId || !message) {
        console.log("Missing parameters:", requestData);  // 🔹 デバッグ用ログ
        return new Response("Missing parameters", { status: 400 });
      }
  
      const DISCORD_BOT_TOKEN = "YOUR_DISCORD_BOT_TOKEN";  // 🔹 環境変数から取得することを推奨 todo
      let url = `https://discord.com/api/v10/channels/${channelId}/messages`;
      let options = {
        method: action === "post" ? "POST" : "PATCH",
        headers: {
          "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: message })
      };
  
      if (action === "edit") {
        if (!messageId) {
          console.log("Missing messageId for edit:", requestData);
          return new Response("Missing messageId", { status: 400 });
        }
        url += `/${messageId}`;
      }
  
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorText = await response.text();
        console.log("Discord API Error:", errorText);
        return new Response(errorText, { status: response.status });
      }
  
      const data = await response.json();
      return new Response(JSON.stringify({ messageId: data.id }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  };
  