const WORKER_URL = "https://*************************-cloudflare.workers.dev";  // Cloudflare Workers のURL
const DISCORD_BOT_TOKEN = "YOUR_DISCORD_BOT_TOKEN"; // Discord Botのトークン


function createClassChangel(e) {
  // フォームから名前とURLを取得
  // Logger.log(e.values)
  const name = e.values[1]
  const url = e.values[2]

  // シラバスから科目名と科目コードを取得
  let response = UrlFetchApp.fetch(url);
  let content = response.getContentText("utf-8");
  var class_name = Parser.data(content).from('<h1 class="c-h1">').to('\n').build();
  var class_code = Parser.data(content).from('<dt>科目コード</dt>\n                <dd>').to('</dd>').build();
  console.log(class_name)
  console.log(class_code)
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("フォームの回答 1"); // シート名を適宜変更
  var row = e.range.getRow(); // 編集された行番号
  sheet.getRange(row, 4).setValue(class_code)
  sheet.getRange(row, 5).setValue(class_name)

  // ロールを作成
  const role_name = class_code.substring(0, 3) + "-" + class_name;
  const role_id = createRole(role_name);


  // チャンネル作成
  // チャンネル名は「科目コードの前3文字+科目名」にする
  const channel_name = class_code.substring(0, 3) + "-" + class_name;
  const channel_id = createChangel(channel_name, url, role_id);
  const admin_role_id = "1266305943344517211"; // Discord管理ロールID

  // オンボーディングの質問にロールとチャンネルを追加
  const message_id = postToDiscord("1331176449389887578", 
                      `<@&${admin_role_id}> ${name}さんが ${class_code} ${class_name} の授業を受講します。\n` +
                  `ロール: <@&${role_id}>，` +
                  `チャンネル: <#${channel_id}>\n` +
                  // `ロール名: ${role_name}\n` +
                  // `チャンネル名: ${channel_name}\n` +
                  // `科目コード: ${class_code}\n` + 
                  `サーバー設定 > オンボーディング > 質問 > "見たい授業チャンネルを...” にロールとチャンネルを追加してください．\n` + 
                  `終わったら，以下メッセージをコピペして，<#1273491503355793510>に投稿してください．`);
  Logger.log(message_id);


  const announce_message_id = postToDiscord("1331176449389887578", 
                      "`"+`${channel_name}(<#${channel_id}>)を作成しました．` +
                      `<id:customize>の"見たい授業チャンネル..."から選択してください` +"`");
  Logger.log(announce_message_id);

  // シートにロールIDとチャンネルIDを保存
  sheet.getRange(row, 6).setValue(role_id); // ロールIDを保存
  sheet.getRange(row, 7).setValue(channel_id); // チャンネルIDを保存
  // sheet.getRange(row, 8).setValue(message_id); // メッセージIDを保存
  // sheet.getRange(row, 9).setValue(announce_message_id); // メッセージIDを保存
}

// テスト関数
function testCreateClassChangel() {
  const testEvent = {
    values: [
      "", // フォームの回答番号
      "テストユーザー", // 名前
      "https://syllabus.s.isct.ac.jp/courses/-/-/-/202534026", // URL
      "", // 科目コード（空欄）
      "", // 科目名（空欄）
      "", // ロールID（空欄）
      "", // チャンネルID（空欄）
      "", // メッセージID（空欄）
      ""  // アナウンスメッセージID（空欄）
    ],
    range: {
      getRow: function() { return 2; } // テスト行番号
    }
  };
  createClassChangel(testEvent);
}
function testCreateRole() {
  const role_name = "新しいロールテスト";
  const role_id = createRole(role_name);
  Logger.log("role_id = " + role_id);
  // return role_id;
}
function testCreateChangel() {
  const channel_id = createChangel("テストチャンネル", "トピックです", "1362390181675663541");
}
function testPostToDiscord() {
  const channelId = "1331888326394773545"; // チャンネルID
  const message = "テストメッセージ";
  const messageId = postToDiscord(channelId, message);
  Logger.log(messageId);
}

// ロールを作成する関数
function createRole(role_name) {
  const payload = {
    apiPath: "/guilds/1266305659868020738/roles", // サーバーIDを指定
    method: "POST",
    body: {
      name: role_name, // ロール名
      color: 0x9b59b6, // 色
      hoist: false, // 表示フラグ
      permissions: 0, // 権限
      position: 0, // ポジション
      mentionable: true // メンション可能フラグ
    },
    discordToken: DISCORD_BOT_TOKEN // Discord Botのトークン
  };
  const response = postDiscordAPI(payload);
  const response_json = JSON.parse(response);
  Logger.log(response_json);
  const role_id = response_json.id;
  Logger.log("role_id = " + role_id);
  return role_id;
}

// チャンネルを作成する関数
function createChangel(name, topic, role_id) {
  const admin_role_id = "1266305943344517211"; // Discord管理ロールID
  const payload = {
    apiPath: "/guilds/1266305659868020738/channels",
    method: "POST",
    body: {
      name: name, // チャンネル名
      type: 0, // テキストチャンネル
      topic: topic, // トピック
      position: 2, // チャンネルの位置 todo 一番下にする
      // https://discord.com/developers/docs/topics/permissions#permissions
      permission_overwrites: [
          { // 先程作ったロールは閲覧とメッセージ送信，スレッドなどの権限を持つ
              id: role_id, // ロールID
              type: 0, // ロール
              allow: "3072", // 権限を許可（VIEW_CHANNEL + SEND_MESSAGES）
              deny: "16" // 権限を拒否（MANAGE_CHANNELS）
          },
          // { // Discord管理ロールはチャンネルの管理権限を持つ
          //     id: admin_role_id, // ロールID
          //     type: 0, // ロール
          //     allow: "3072", // 権限を許可（VIEW_CHANNEL + SEND_MESSAGES）
          //     deny: "0" // 権限を拒否
          // },
          { // @everyoneは閲覧できない
              id: "1266305659868020738", // サーバーID
              type: 0, // ロール
              allow: "0", // 権限を許可
              deny: "3072" // 権限を拒否（VIEW_CHANNEL + SEND_MESSAGES）
          }
      ],
      parent_id: "1273475189522305035", // カテゴリIDを指定（"授業-Class"）
      nsfw: false // NSFWフラグ（NSFWとはNot Safe For Workの略で，18禁コンテンツを含むチャンネルのこと）
    },
    discordToken: DISCORD_BOT_TOKEN // Discord Botのトークン
  };
  const response = postDiscordAPI(payload);
  const response_json = JSON.parse(response);
  Logger.log(response_json);
  const channel_id = response_json.id;
  Logger.log("channel_id = " + channel_id);
  return channel_id;
}

// メッセージ
function postToDiscord(channelId, message) {
  if (!message) return;
  const payload = {
    apiPath: `/channels/${channelId}/messages`,
    method: "POST",
    body: {
      content: message
    },
    discordToken: DISCORD_BOT_TOKEN // Discord Botのトークン
  };

  Logger.log("Sending Payload: " + JSON.stringify(payload));

  const response = postDiscordAPI(payload);
  const responseData = JSON.parse(response);
  Logger.log("Response Data: " + JSON.stringify(responseData));
  if (responseData && responseData.id) {
    Logger.log("message_id = " + responseData.id);
    return responseData.id;  // DiscordのメッセージIDを返す
  } else {
    Logger.log("Error: " + responseData);
    return null;
  }
}
  
