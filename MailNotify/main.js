function sendEmailToDiscord() {
    // DiscordウェブフックURL
    var webhookURL = '';
  
    // 最後に処理したメールのIDを取得（プロパティサービスから）
    var scriptProperties = PropertiesService.getScriptProperties();
    var lastProcessedId = scriptProperties.getProperty('lastProcessedId');
  
    // Gmailの「メイン」カテゴリのメールを検索
    var threads = GmailApp.search('label:inbox category:primary');  // メインカテゴリに絞る
    var message;
    
    // 新しいメールを順に確認し、差分を取る
    for (var i = 0; i < threads.length; i++) {
      var thread = threads[i];
      var messages = thread.getMessages(); // スレッド内のすべてのメッセージを取得
      
      for (var j = 0; j < messages.length; j++) {
        message = messages[j];
        
        if (lastProcessedId && message.getId() <= lastProcessedId) {
          continue;  // 既に処理したメールはスキップ
        }
  
        var subject = message.getSubject();
        var from = message.getFrom();
        var date = message.getDate();
        var body = message.getPlainBody();
        
        // メール内容を行ごとに分割し、空行を除去
        var bodyLines = body.split('\n').filter(function(line) {
          return line.trim() !== '';  // 空行を取り除く
        });
  
        // メール内容が長すぎる場合、最初の5行だけを送信
        var truncatedBody = bodyLines.slice(0, 5).join('\n');  // 最初の5行を切り取る
        if (bodyLines.length > 5) {
          truncatedBody += '\n...';  // 省略表示を追加
        }
  
        // Discordメッセージとして送る内容を整形
        var messageContent = '**Subject**: ' + subject + '\n' +
                             '**From**: ' + from + '\n' +
                             '**Date**: ' + date + '\n' +
                             truncatedBody;
  
        // DiscordのウェブフックにPOSTリクエストを送信
        var payload = JSON.stringify({ content: messageContent });
        var options = {
          'method' : 'post',
          'contentType' : 'application/json',
          'payload' : payload
        };
  
        UrlFetchApp.fetch(webhookURL, options);
  
        // 最後に処理したメールのIDを保存
        scriptProperties.setProperty('lastProcessedId', message.getId());
      }
    }
  }
  
  