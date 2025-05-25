// 名簿のスプレッドシートからデータを取得する関数
// headers: 取得したいデータのヘッダー（配列）
// nameInput: 氏名の入力値
// studentNumberInput: 学籍番号の入力値（なければ""を入れる）
function getDataFromMemberList(headers, nameInput, studentNumberInput) {
  // アクティブではないスプレッドシートを開く
  const ss = SpreadsheetApp.openById(MEMBER_LIST_ID); // スプレッドシートのIDを指定
  // ssのすべてのシートをループ
  const sheets = ss.getSheets();
  for (const sheet of sheets) {
    const data = sheet.getDataRange().getValues(); // シートのデータを取得
    const nameColumn = data[0].indexOf("氏名") + 1; // "氏名" の列番号を取得
    const studentNumberColumn = data[0].indexOf("学籍番号") + 1; // "学籍番号" の列番号を取得
    // headers配列の各ヘッダーの列番号を取得
    const dataColumns = headers.map(header => data[0].indexOf(header) + 1); 
    for (let i = 1; i < data.length; i++) { // 1行目はヘッダーなのでスキップ
      const row = data[i];
      const nameWithoutSpaceInput = nameInput.replace(/\s+/g, "").toLowerCase(); // スペースを除去，小文字に変換
      const nameWithoutSpace = row[nameColumn - 1].replace(/\s+/g, "").toLowerCase(); // スペースを除去，小文字に変換
      Logger.log(nameWithoutSpaceInput + " == " + nameWithoutSpace)
      const studentNumber = row[studentNumberColumn - 1];
      if (nameWithoutSpaceInput && nameWithoutSpace === nameWithoutSpaceInput) { // 氏名が一致する行を探す
        Logger.log("Found name: " + nameWithoutSpace);
        // 各ヘッダーのデータを配列で返す
        return dataColumns.map(col => row[col - 1]);
      } else if (studentNumberInput && studentNumber === studentNumberInput) { // 学籍番号が一致する行を探す
        Logger.log("Found student number: " + studentNumber);
        return dataColumns.map(col => row[col - 1]);
      }
    }
  }
  Logger.log("Data not found for name: " + nameInput + " or student number: " + studentNumberInput);
  return null; // 見つからなかった場合はnullを返す
}