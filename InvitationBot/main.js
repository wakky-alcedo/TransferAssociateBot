function sendEmailOnFormSubmit(e) {
    // DiscordウェブフックURL
    var webhookURL = '';
  
    Logger.log(e); // デバッグ用ログ
  
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("フォームの回答 1"); // シート名を適宜変更
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]; // 質問の項目名を取得
    var row = e.range.getRow(); // 編集された行番号
    var rawValues  = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]; // 質問の項目名を取得
    // 値を適切な形式に変換
    var nowValues = rawValues.map((value, index) => {
      var columnLetter = String.fromCharCode(65 + index); // A=0, B=1, ..., G=6, M=12
  
      if (columnLetter === "A" /*&& value instanceof Date*/) {
        return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy/MM/dd HH:mm:ss"); // M列の値を日付形式に変換
      } else if (columnLetter === "G" /*&& typeof value === "number"*/) {
        return Math.round(value).toString(); // G列を整数にして文字列化
      } else if (columnLetter === "M" /*&& value instanceof Date*/) {
        return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy/MM/dd"); // M列の値を日付形式に変換
      }
      return value; // それ以外はそのまま
    });
    Logger.log(row)
    Logger.log(nowValues)
  
    var newValues = e.values; // 今回の送信データ
    Logger.log(newValues)
  
  
    // メールアドレスをスプレッドシートから取得
    var emailAddress = sheet.getRange(row, 2).getValue(); // 2列目にメールアドレスがあると仮定（適宜変更）
    var member_name = sheet.getRange(row, 3).getValue(); 
  
    if (!emailAddress || !emailAddress.includes("@")) {
      Logger.log("エラー: メールアドレスが無効です -> " + emailAddress);
      return;
    }
    
    // 差分チェック用の「前回の値」列を取得 (例: 最後の列)
    // var lastCol = sheet.getLastColumn();
    // var previousValues = sheet.getRange(row, lastCol).getValue(); // 前回の値（JSONとして保存）
    
    // var previousData = previousValues ? JSON.parse(previousValues) : {};
    var changesList = "<ul>";
  
    var is_change = false 
    var is_new = true
    for (var i = 1; i < headers.length; i++) { // iは0から（タイムスタンプは除外）
      var newValue = newValues[i] || "";
      
      // 変更もしくは追加する部分を表示
      if ("" !== newValue) {
        changesList += `<li>${headers[i]}: <strong>${newValue}</strong></li>`;
        is_change = true;
        Logger.log("is_change " + newValue);
      }
  
      // 新しい回答か判別
      if (nowValues[i] !== newValue) {
        is_new = false;
        // Logger.log("is_new=false " + newValue);
      }
    }
    changesList += "</ul>";
  
    // メッセージを作成
    var subject = "";
    var body = "";
    var discord_body = "**入会フォーム**";
    body += "<p>フォームの回答、ありがとうございます。</p>";
    // body += '<p> <a href="https://discord.gg/gmuBwhpBNp" target="_blank">こちら</a> より、編入生会のDiscordに参加してください。</p>';
    body += '<p>以下のリンクより、編入生会のDiscordに参加してください。<br>';
    body += 'https://discord.gg/gmuBwhpBNp</p>';
  
    if (is_new) {
      subject = "【自動返信】フォームの送信を受け付けました";
      body += "<p>フォームは以下の内容で受け付けました。</p>";
      body += changesList;
      discord_body += "(送信) ";
      Logger.log("new");
    } else if (is_change) {
      subject = "【自動返信】フォームの回答内容が変更されました";
      body += "<p>フォームは以下の内容で変更を受け付けました。</p>";
      body += changesList;
      discord_body += "(変更) ";
      Logger.log("change");
    } else {
      Logger.log("no_change, no_new");
      return
    }
    discord_body += member_name;
  
    try {
      MailApp.sendEmail({
        to: emailAddress,
        subject: subject,
        htmlBody: body, // HTML形式のメール本文
        name: "東京科学大学編入生会"
      });
      Logger.log("メール送信成功: " + emailAddress);
  
      // 新しい値を「前回の値」としてスプレッドシートに保存
      // sheet.getRange(row, lastCol).setValue(JSON.stringify(newValues));
    } catch (error) {
      Logger.log("メール送信エラー: " + error.toString());
    }
  
    // Discordにも送る
    // DiscordのウェブフックにPOSTリクエストを送信
    var payload = JSON.stringify({ content: discord_body });
    var options = {
      'method' : 'post',
      'contentType' : 'application/json',
      'payload' : payload
    };
  
    UrlFetchApp.fetch(webhookURL, options);
  
  }
  