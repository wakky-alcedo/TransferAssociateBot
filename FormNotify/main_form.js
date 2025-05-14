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
  sendMessageByWebhook(WEBHOOKURL_FORM, data);
};
