// 1. フォームに送られてきた名前を取得
// 2. 名簿シートから名前を検索し，Discord IDを取得
// 3. Discordのロールを付与

const ROLE_ID = "1357217103928758334"; // 付与するロールのIDを指定 ピザパ参加者

function addRoleFormForm (e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("フォームの回答 1"); // シート名を適宜変更
  const row = e.range.getRow(); // 編集された行番号
  const nowValues = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0]; // 編集された行の値を取得
  let name = ""; // 氏名を初期化
  try {
    const nameColumn = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf("氏名") + 1; // "氏名" の列番号を取得
    name = nowValues[nameColumn - 1]; // 氏名を取得
  } catch (e) {
    Logger.log("Error: " + e.toString());
    sendErrorMessage("Error: (フォーム)「氏名」という項目が見つかりませんでした．"); // エラーメッセージを送信
    return; // 名前がなかったら終了
  }
  let studentNumber = ""; // 学籍番号を初期化
  try {
    const studentNumberColumn = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf("学籍番号") + 1; // "学籍番号" の列番号を取得
    studentNumber = nowValues[studentNumberColumn - 1]; // 学籍番号を取得
  } catch (e) {
    Logger.log("Error: " + e.toString());
  }

  Logger.log("name: " + name);

  const participationColumn = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf("参加しますか") + 1; // "参加" の列番号を取得
  const participation = nowValues[participationColumn - 1]; // 参加の回答を取得

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