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
  sendMessage(data);
};

const sendMessage = (webhook_url, massage) => {
  const request = {
    method: "post",
    "content-type": "application/json",
    payload: {
      content: massage,
    },
  };
  UrlFetchApp.fetch(WEBHOOKURL_FORM, request);
}

