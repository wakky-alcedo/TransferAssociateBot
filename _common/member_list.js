// 名簿のスプレッドシートからデータを取得する関数
// dataName: 取得したいデータの列名
// nameInput: 氏名の入力値
// studentNumberInput: 学籍番号の入力値（なければ""を入れる）
function getDataFromMemberList(dataName, nameInput, studentNumberInput) {
  // アクティブではないスプレッドシートを開く
  const ss = SpreadsheetApp.openById(MEMBER_LIST_ID); // スプレッドシートのIDを指定
  // ssのすべてのシートをループ
  const sheets = ss.getSheets();
  for (const sheet of sheets) {
    const data = sheet.getDataRange().getValues(); // シートのデータを取得
    const nameColumn = data[0].indexOf("氏名") + 1; // "氏名" の列番号を取得
    const studentNumberColumn = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf("学籍番号") + 1; // "学籍番号" の列番号を取得
    const dataColumn = data[0].indexOf(dataName) + 1; // dataName の列番号を取得
    for (let i = 1; i < data.length; i++) { // 1行目はヘッダーなのでスキップ
      const row = data[i];
      // 名前の一致は，スペースを除去して比較
      const nameWithoutSpaceInput = nameInput.replace(/\s+/g, "");
      const nameWithoutSpace = row[nameColumn - 1].replace(/\s+/g, "");
      const studentNumber = row[studentNumberColumn - 1];
      if (nameWithoutSpaceInput && nameWithoutSpace === nameWithoutSpaceInput) { // 氏名が一致する行を探す
        Logger.log("Found name: " + nameWithoutSpace);
        return row[dataColumn - 1]; // dataを返す
      } else if (studentNumberInput && studentNumber === studentNumberInput) { // 学籍番号が一致する行を探す
        Logger.log("Found student number: " + studentNumber);
        return row[dataColumn - 1]; // dataを返す
      }
    }
  }
  Logger.log("Data not found for name: " + nameInput + " or student number: " + studentNumberInput);
  return null; // 見つからなかった場合はnullを返す
}