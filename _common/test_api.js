// メッセージを送信するテスト
function testSendMessage() {
  sendMessage("1331888326394773545", "てすと")
}

// メッセージにリアクションをつけるテスト
function testAddReaction() {
  const channelId = "1331888326394773545"; // チャンネルID
  const messageId = "1362398005071712396"; // メッセージID
  // const emoji = "👍"; // 絵文字
  // const emoji = "go:1363893249881800975"; // 絵文字 Botが持っているやつ
  const emoji = "go:1356659377968517150"; // 絵文字ID サーバーのやつ

  addReaction(channelId, messageId, encodeURIComponent(emoji));
}

// ユーザーにロールをつけるテスト
function testAddRoleToUser() {
  const userId = "684920384822313093"; // ユーザーID
  const roleId = "1299984270344851478"; // ロールID　土木

  addRoleToUser(userId, roleId);
}