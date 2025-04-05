const WEBHOOK_URL = "";
const WEBHOOK_URL_PRIVATE = "";

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
  if (data["送信先チャンネル"] == "「to-幹部（質問・意見）」＆「to-幹部（質問・意見-幹部限定）」") {
    sendMessage(WEBHOOK_URL, data["分類"]+": "+data["意見質問の内容"])
    if (data["名前（やり取りが必要な場合のみ）"] != "") {
      sendMessage(WEBHOOK_URL_PRIVATE, data["分類"]+" （"+data["名前（やり取りが必要な場合のみ）"]+"）\n内容: "+data["意見質問の内容"])
    }
  } else {
    if (data["名前（やり取りが必要な場合のみ）"] != "") {
      sendMessage(WEBHOOK_URL_PRIVATE, data["分類"]+" （"+data["名前（やり取りが必要な場合のみ）"]+"）\n内容: "+data["意見質問の内容"])
    } else {
      sendMessage(WEBHOOK_URL_PRIVATE, data["分類"]+"\n内容: "+data["意見質問の内容"])
    }
  }
};

const sendMessage = (webhook_url, massage) => {
  const request = {
    method: "post",
    "content-type": "application/json",
    payload: {
      content: massage,
    },
  };
  UrlFetchApp.fetch(webhook_url, request);
}

// テスト用
function testOnSubmit() {
  const dummy = {
    response: {
      getItemResponses: () => [
        {
          getItem: () => ({ getTitle: () => "送信先チャンネル" }),
          getResponse: () => "「to-幹部（質問・意見）」＆「to-幹部（質問・意見-幹部限定）」",
        },
        {
          getItem: () => ({ getTitle: () => "分類" }),
          getResponse: () => "意見",
        },
        {
          getItem: () => ({ getTitle: () => "意見質問の内容" }),
          getResponse: () => "動作確認：もっと予算を増やしてほしい",
        },
        {
          getItem: () => ({ getTitle: () => "名前（やり取りが必要な場合のみ）" }),
          getResponse: () => "田中",
        },
      ],
    },
  };
  onSubmit(dummy);
}