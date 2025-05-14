/* コピー時のtodo */
// FORM_NAME  : 何列目の情報を送るか指定（Aが1行目）
// SEND_ITEM  : 何のフォームかを指定
// 一度実行して，権限を承認する

const FORM_NAME = "〇〇イベントアンケート"; // フォームの名前を指定
const SEND_ITEM = [2, 3]; // 送信する項目が何列目か指定（1番目が1）何も要らなければなしでOK

FormApp.getActiveForm();

const onSubmit = (e) => {
  Logger.log("実行");
  const data = e.response
    .getItemResponses()
    .reduce(
      (p, c) => ({ ...p, [c.getItem().getTitle()]: c.getResponse() }),
      {}
    );
  Logger.log(data);

  // SEND_ITEMの質問名と回答を取得し，messageに格納
  let message = `**${FORM_NAME}**`;

  if (SEND_ITEM.length === 0) {
    Logger.log("SEND_ITEMが空です。");
    message += ` 回答がありました`;
  } else {
    message += `\n`;
    SEND_ITEM.forEach((item) => {
      const itemName = Object.keys(data)[item - 1]; // 0から始まるインデックスに変換
      const itemValue = data[itemName];
      if (itemValue !== "") {
        message += `${itemName}: ${itemValue}\n`;
      }
    });
  }

  sendMessageByWebhook(WEBHOOKURL_FORM, message);
};
