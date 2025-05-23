// 1. フォームに送られてきた名前を取得
// 2. 名簿シートから名前を検索し，Discord IDを取得
// 3. Discordのロールを付与

const ROLE_ID = "1357217103928758334"; // 付与するロールのIDを指定 ピザパ参加者

function addRoleFormForm (e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("フォームの回答 1"); // シート名を適宜変更
  const row = e.range.getRow(); // 編集された行番号
  const name = getValueFromSheet(sheet, row, "氏名"); // 氏名を取得
  const studentNumber = getValueFromSheet(sheet, row, "学籍番号"); // 学籍番号を取得
  const participation = getValueFromSheet(sheet, row, "参加しますか"); // 参加の値を取得
  Logger.log("name: " + name);
  Logger.log("studentNumber: " + studentNumber);
  Logger.log("participation: " + participation);

  // Discordのロールを付与する関数を呼び出す
  const discordId = getDataFromMemberList("Discord ID", name, studentNumber); // Discord IDを取得
  if (discordId) {
    if (participation == "はい") {
      addRoleToUser(BOT_TOKEN_ADMIN, discordId, ROLE_ID); // ロールを付与する関数
      Logger.log(`Added role ${ROLE_ID} to user ${discordId}`);
    } else {
      removeRoleFromUser(BOT_TOKEN_ADMIN, discordId, ROLE_ID); // ロールを削除する関数
      Logger.log(`Removed role ${ROLE_ID} from user ${discordId}`);
    }
  } else {
    Logger.log(`User ${name} not found`);
    sendErrorMessage(`User ${name} not found`); // エラーメッセージを送信
  }
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