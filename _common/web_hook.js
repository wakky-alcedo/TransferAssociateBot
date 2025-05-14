function sendMessageByWebhook(webhookUrl, message) {
  var payload = JSON.stringify({ content: message });
  var options = {
    'method' : 'post',
    'contentType' : 'application/json',
    'payload' : payload
  };
  UrlFetchApp.fetch(webhookUrl, options);
}

function test() {
  const message = "テストメッセージ";
  sendMessageByWebhook(WEBHOOKURL_TEST, message);
}
