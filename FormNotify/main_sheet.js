/* コピー時のtodo */
// FORM_NAME  : 何列目の情報を送るか指定（Aが1行目）
// SEND_COLUMN: 何のフォームかを指定
// 一度実行して，権限を承認する

const FORM_NAME = "ピザパ"; // フォームの名前を指定
const SEND_COLUMNS = [2, 3, 6]; // 送信する列のインデックスを指定（Aが1行目）
const SEND_ITEM = ["氏名", "参加しますか"]; // 送信する項目名を指定

const ROLE_ID = "1357217103928758334"; // 付与するロールのIDを指定 ピザパ参加者

function onSubmit(e) {
  Logger.log(e); // デバッグ用ログ

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("フォームの回答 1"); // シート名を適宜変更
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]; // 質問の項目名を取得
  var row = e.range.getRow(); // 編集された行番号
  var nowValues = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]; // 質問の項目名を取得
  Logger.log(row)
  Logger.log(nowValues)
  var newValues = e.values; // 今回の送信データ
  Logger.log(newValues)

  // DiscordRoleを付与（"参加しますか"の値がある場合のみ実行）
  // 1. フォームに送られてきた名前を取得
  // 2. 名簿シートから名前を検索し，Discord IDを取得
  // 3. Discordのロールを付与
  const participation = getValueFromSheet(sheet, row, "参加しますか"); // 参加の値を取得
  if (participation) { // 参加の値がある場合のみ実行
    // 名前と学籍番号を取得
    const name = getValueFromSheet(sheet, row, "氏名"); // 氏名を取得
    const studentNumber = getValueFromSheet(sheet, row, "学籍番号"); // 学籍番号を取得
    const discordId = getDataFromMemberList("Discord ID", name, studentNumber); // Discord IDを取得
    Logger.log("name: " + name);
    Logger.log("studentNumber: " + studentNumber);
    Logger.log("participation: " + participation);
    Logger.log("discordId: " + discordId);
    // Discordのロールを付与する関数を呼び出す
    if (discordId) {
      if (participation == "はい") {
        addRoleToUser(BOT_TOKEN_ADMIN, discordId, ROLE_ID); // ロールを付与する関数
        Logger.log(`Added role ${ROLE_ID} to user ${discordId}`);
      } else if (participation == "いいえ") {
        removeRoleFromUser(BOT_TOKEN_ADMIN, discordId, ROLE_ID); // ロールを削除する関数
        Logger.log(`Removed role ${ROLE_ID} from user ${discordId}`);
      }
    } else {
      Logger.log(`User ${name} not found`);
      sendErrorMessage(`User ${name} not found`); // エラーメッセージを送信
    }
  }

  var body = `**${FORM_NAME}**`;
      
  // 差分チェック用の「前回の値」列を取得 (例: 最後の列)
  var is_change = false 
  for (var i = 1; i < headers.length; i++) { // iは0から（タイムスタンプは除外）
    var newValue = newValues[i] || "";

    // 変化を検知
    if (nowValues[i] !== newValue) {
      is_change = true;
    }
  }

  if (is_change) {
    body += "(変更) \n";
  } else {
    body += "(送信) \n";
  }

  // 送信する列の情報を取得
  for (var i = 0; i < SEND_COLUMNS.length; i++) {
    var columnIndex = SEND_COLUMNS[i] - 1; // 0から始まるインデックスに変換
    var columnName = headers[columnIndex];
    var newValue = newValues[columnIndex] || ""; // 新しい値を取得
    body += `${columnName}: ${newValue} \n`;
  }

  // DiscordのウェブフックにPOSTリクエストを送信
  sendMessageByWebhook(WEBHOOKURL_FORM, body); // Discordにメッセージを送信
}


function getValueFromSheet(sheet, row, header) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]; // ヘッダー行を取得
  const columnIndex = headers.indexOf(header); // ヘッダーの列番号を取得
  if (columnIndex !== -1) {
    return sheet.getRange(row, columnIndex + 1).getValue(); // 値を取得
  } else {
    Logger.log(`Header "${header}" not found`);
    return null; // ヘッダーが見つからなかった場合はnullを返す
  }
}