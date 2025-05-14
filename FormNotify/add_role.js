// 1. フォームに送られてきた名前を取得
// 2. 名簿シートから名前を検索し，Discord IDを取得
// 3. Discordのロールを付与

const ROLE_ID = "1357217103928758334"; // 付与するロールのIDを指定 ピザパ参加者

function addRoleFormForm (e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("フォームの回答 1"); // シート名を適宜変更
  const row = e.range.getRow(); // 編集された行番号
  const nowValues = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]; // 編集された行の値を取得
  const nameColumn = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf("氏名") + 1; // "氏名" の列番号を取得
  const name = nowValues[nameColumn - 1]; // 氏名を取得

  Logger.log("name: " + name);

  // Discordのロールを付与する関数を呼び出す
  const discordId = getDiscordId(name); // Discord IDを取得する関数（実装が必要）
  if (discordId) {
    addRoleToUser(BOT_TOKEN_ADMIN, discordId, ROLE_ID); // ロールを付与する関数（実装が必要）
    Logger.log(`Added role ${ROLE_ID} to user ${discordId}`);
  } else {
    Logger.log(`User ${name} not found`);
    // sendMessageByWebhook(WEBHOOKURL_BOT_ERROR, `User ${name} not found`); // エラーメッセージを送信
  }
}

function getDiscordId(name) {
  // 名簿のスプレッドシートからDiscord IDを取得する関数
  // アクティブではないスプレッドシートを開く
  const ss = SpreadsheetApp.openById(MEMBER_LIST_ID); // スプレッドシートのIDを指定
  // ssのすべてのシートをループ
  const sheets = ss.getSheets();
  for (const sheet of sheets) {
    const data = sheet.getDataRange().getValues(); // シートのデータを取得
    const nameColumn = data[0].indexOf("氏名") + 1; // "氏名" の列番号を取得
    const discordIdColumn = data[0].indexOf("Discord ID") + 1; // "Discord ID" の列番号を取得
    for (let i = 1; i < data.length; i++) { // 1行目はヘッダーなのでスキップ
      const row = data[i];
      // 名前の一致は，スペースを除去して比較
      const nameWithoutSpace = row[nameColumn - 1].replace(/\s+/g, "");
      const nameWithoutSpaceInput = name.replace(/\s+/g, "");
      if (nameWithoutSpace === nameWithoutSpaceInput) { // 氏名が一致する行を探す
        Logger.log("Found name: " + row[nameColumn - 1]);
        return row[discordIdColumn - 1]; // Discord IDを返す
      }
    }
  }
  return null; // 見つからなかった場合はnullを返す
}

function testAddRole() {
  const damy_name = "ダミーネーム"; // テスト用の名前
  const dummy = {
    range: {
      getRow: () => 2, // 編集された行番号
    },
    values: ["", damy_name, "", "", "", "", "", ""], // フォームの回答データ
  };
  addRoleFormForm(dummy);
}