export default {
    async fetch(request) {
      const discordBaseUrl = 'https://discord.com/api/v10';
      var discordToken = DISCORD_BOT_TOKEN; // Secrets で設定
  
      try {
        const { apiPath, method, headers, body, discordToken } = await request.json();
  
        const discordResponse = await fetch(`${discordBaseUrl}${apiPath}`, {
          method,
          headers: {
            'Authorization': `Bot ${discordToken}`,
            'Content-Type': 'application/json',
            ...(headers || {})
          },
          body: body ? JSON.stringify(body) : null
        });
  
        const responseText = await discordResponse.text(); // Discord APIのレスポンスをテキストとして取得 
  
        return new Response(responseText, {
          status: discordResponse.status,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.toString() }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  }
  