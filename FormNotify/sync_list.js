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

function updateSpreadsheet() {
  saveDataToSpreadsheet(); // スプレッドシートにデータを保存
  saveDataToSpreadsheetFromMemberList(); // 名簿からデータを取得してスプレッドシートに保存
}

// 名簿から必要データを取得して，スプレッドシートに保存する関数
const GET_COLUMNS = [10, 11]; // 名簿からデータを取得する列を指定（Aが1行目）
function saveDataToSpreadsheetFromMemberList() {
  const nowSS = SpreadsheetApp.getActiveSpreadsheet();
  const nowSheet = nowSS.getSheets()[0]; // 最初のシートを取得
  const numRows = nowSheet.getLastRow() - 1;
  // if (numRows > 0) {
  //   nowSheet.getRange(2, 1, numRows, nowSheet.getLastColumn()).clearContent(); // 2行目以降をクリア
  // }
  const nowHeaders = nowSheet.getRange(1, 1, 1, nowSheet.getLastColumn()).getValues()[0]; // ヘッダー行を取得
  const nameColumn = nowHeaders.indexOf("氏名") + 1; // "氏名" の列番号を取得
  let studentNumberColumn = -1; // 学籍番号の列番号を初期化
  try { // 学籍番号は集めないこともあるので，try-catchで囲む
    studentNumberColumn = nowHeaders.indexOf("学籍番号") + 1; // "学籍番号" の列番号を取得
  } catch (e) {
    Logger.log("学籍番号の列が見つかりませんでした。");
  }
  for (let i = 2; i <= numRows + 1; i++) { // 2行目から最終行までループ
    const row = nowSheet.getRange(i, 1, 1, nowSheet.getLastColumn()).getValues()[0]; // 行を取得
    const nameInput = row[nameColumn - 1]; // 氏名の入力値を取得
    let studentNumberInput = ""; // 学籍番号の入力値を初期化
    if (studentNumberColumn !== -1) { // 学籍番号の列が存在する場合
      studentNumberInput = row[studentNumberColumn - 1]; // 学籍番号の入力値を取得
    }
    for (let j = 0; j < GET_COLUMNS.length; j++) {
      const columnIndex = GET_COLUMNS[j] - 1; // 0から始まるインデックスに変換
      const columnName = nowHeaders[columnIndex];
      const data = getDataFromMemberList(columnName, nameInput, studentNumberInput); // 名簿からデータを取得
      if (data) {
        nowSheet.getRange(i, columnIndex + 1).setValue(data); // データを保存
      }
    }
  }
}

// （フォームの回答が保存される）参照先スプレッドシートから，データを保存する関数
function saveDataToSpreadsheet() {
  // 今のスプレッドシートについて
  const nowSS = SpreadsheetApp.getActiveSpreadsheet();
  const nowSheet = nowSS.getSheets()[0]; // 最初のシートを取得
  const numRows = nowSheet.getLastRow() - 1;
  if (numRows > 0) {
    nowSheet.getRange(2, 1, numRows, nowSheet.getLastColumn()).clearContent(); // 2行目以降をクリア
  }
  const nowHeaders = nowSheet.getRange(1, 1, 1, nowSheet.getLastColumn()).getValues()[0]; // ヘッダー行を取得
  // 参照先のスプレッドシートからデータを取得
  const refSS = SpreadsheetApp.openById(SPREADSHEET_ID); // スプレッドシートのIDを指定
  const refSheet = refSS.getSheets()[0]; // 最初のシートを取得
  const refData = refSheet.getDataRange().getValues(); // シートのデータを取得
  const refHeaders = refData[0]; // ヘッダー行を取得
  // nowHheadersの各列について，refHeadersの列を探し，今のスプレッドシートに保存する
  for (let i = 0; i < nowHeaders.length; i++) {
    const nowHeader = nowHeaders[i];
    try {
      const refIndex = refHeaders.indexOf(nowHeader); // refHeadersの列番号を取得
      if (refIndex !== -1) { // 列が見つかった場合
        const refColumn = refSheet.getRange(2, refIndex + 1, refSheet.getLastRow() - 1, 1).getValues(); // データを取得
        nowSheet.getRange(2, i + 1, refColumn.length, 1).setValues(refColumn); // データを保存
      }
    } catch (e) {
      // Logger.log("Error: " + e); // エラーログを出力
      // Logger.log("Column not found: " + nowHeader); // 列が見つからなかった場合のログ
    }
  }

  // 2行目以降を1列目，2列目で昇順にソートする
  const range = nowSheet.getRange(2, 1, nowSheet.getLastRow() - 1, nowSheet.getLastColumn());
  range.sort([{column: 1, ascending: true}, {column: 2, ascending: true}]); // 1列目，2列目で昇順にソート

  // "参加しますか" が "いいえ" の場合，その行を削除
  // const data = nowSheet.getDataRange().getValues(); // シートのデータを取得
  // const isParticipatingColumn = nowHeaders.indexOf("参加しますか") + 1; // "参加しますか" の列番号を取得
  // // 行を逆順にループして，削除する
  // for (let i = data.length - 1; i >= 1; i--) { // 1行目はヘッダーなのでスキップ
  //   const row = data[i];
  //   const isParticipating = row[isParticipatingColumn - 1]; // "参加しますか" の値を取得
  //   if (isParticipating === "いいえ") { // "いいえ" の場合
  //     nowSheet.deleteRow(i + 1); // 行を削除
  //   }
  // }
}
