/* コピー時のtodo */
// FORM_NAME  : 何列目の情報を送るか指定（Aが1行目）
// SEND_COLUMN: 何のフォームかを指定
// 一度実行して，権限を承認する

const FORM_NAME = "サークル紹介"; // フォームの名前を指定
const SEND_COLUMN = 3; // 何列目の情報を送るか指定（Aが1行目）

function sendDiscord(e) {
  Logger.log(e); // デバッグ用ログ

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("フォームの回答 1"); // シート名を適宜変更
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]; // 質問の項目名を取得
  var row = e.range.getRow(); // 編集された行番号
  var nowValues = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]; // 質問の項目名を取得
  Logger.log(row)
  Logger.log(nowValues)
  var newValues = e.values; // 今回の送信データ
  Logger.log(newValues)

  var name = sheet.getRange(row, SEND_COLUMN).getValue(); // 送る情報を取得
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
    body += "(変更) ";
  } else {
    body += "(送信) ";
  }
  body += name;

  // DiscordのウェブフックにPOSTリクエストを送信
  var payload = JSON.stringify({ content: body });
  var options = {
    'method' : 'post',
    'contentType' : 'application/json',
    'payload' : payload
  };

  UrlFetchApp.fetch(WEBHOOKURL_FORM, options);

}


