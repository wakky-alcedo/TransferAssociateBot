// 招待リンクを作成する関数
// https://discord.com/developers/docs/resources/channel#create-channel-invite
function fetchInviteCode(token) {
  const payload = {
    apiPath: "/channels/1299991935137611868/invites", // チャンネルIDを適宜変更
    method: "POST",
    body: {
      max_age: 604800, // 7日間
      max_uses: 1, // 1回
      unique: true // 招待リンクの重複を避ける
    },
    discordToken: token // Discord Botのトークン
  };

  try {
    const response = postDiscordAPI(payload);
    const responseData = JSON.parse(response);
    // Logger.log("Response Data: " + JSON.stringify(responseData));
    // 主要な情報を抽出して，スプレッドシートに書き込む
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("招待リスト"); // シート名を適宜変更
    sheet.getRange(1, 1, 1, 7).setValues([["招待コード", "招待先チャンネル", "作成者", "使用回数", "最大使用回数", "最大使用時間", "存在"]]); // ヘッダー行を追加
    sheet.appendRow([responseData.code, responseData.channel.name, responseData.inviter.username, responseData.uses, responseData.max_uses, responseData.max_age, "exists"]); // 招待コードを追加
    return responseData.code; // 招待コードを返す
  } catch (e) {
    Logger.log("Error: " + e.toString());
    return INVITE_CODE;
  }
}

// メンバーリストを取得する関数
// https://discord.com/developers/docs/resources/guild#list-guild-members
function getMemberList(token) {
  const payload = {
    apiPath: "/guilds/1266305659868020738/members?limit=1000", // サーバーIDを適宜変更
    // apiPath: "/guilds/1266305659868020738/members/684920384822313093", // サーバーIDを適宜変更
    method: "GET",
    discordToken: token // Discord Botのトークン
  };

  try {
    const response = postDiscordAPI(payload);
    const responseData = JSON.parse(response);
    // Logger.log("Response Data: " + JSON.stringify(responseData));
    // 主要な情報を抽出して，スプレッドシートに書き込む
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("メンバーリスト"); // シート名を適宜変更
    // 一行目にヘッダー行を追加
    sheet.getRange(1, 1, 1, 9).setValues([["ユーザー名", "ユーザーID", "グローバル名", "サーバーでの名前", "代名詞", "ロール", "ロール名", "参加日時", "存在"]]);
    // 差分を取って，まだ存在しない行を追加する
    const existingData = sheet.getDataRange().getValues(); // 既存のデータを取得

    // ロール一覧シートから，ロール名を取得し，マップを作る
    const roleSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ロール一覧"); // シート名を適宜変更
    const roleData = roleSheet.getDataRange().getValues(); // 既存のロールデータを取得
    const roleMap = {}; // ロール名とロールIDのマッピング
    roleData.forEach(row => {
      const roleName = row[0]; // ロール名
      const roleId = row[1]; // ロールID
      roleMap[roleId] = roleName; // ロールIDをキーにしてロール名をマッピング
    });

    for (let i = 1; i < existingData.length; i++) {
      sheet.getRange(i + 1, 9).setValue("deleted"); // 存在フラグを「deleted」に更新
    }

    var newMembers = new Set(); // 新しいメンバーのリスト
    responseData.forEach(member => {
      const userName = member.user.username;
      const userId = member.user.id;
      const globalName = member.user.global_name || ""; // グローバル名（存在しない場合は空文字列）
      const serverNickname = member.nick || ""; // サーバーでの名前（ニックネーム）
      const pronouns = member.user.pronouns || ""; // 代名詞（存在しない場合は空文字列）
      const roles = member.roles.join(", "); // ロールをカンマ区切りで結合
      const role_names = member.roles.map(roleId => roleMap[roleId] || roleId).join(", "); // ロール名を取得
      const joinedAt = Utilities.formatDate(new Date(member.joined_at), Session.getScriptTimeZone(), "yyyy/MM/dd HH:mm:ss"); // 参加日時をフォーマット
      const existingRow = existingData.find(row => row[1] === userId);
      // Botの情報は除外する
      if (member.user.bot) {
        // Logger.log("Bot detected: " + userName + " (" + userId + ")");
        return; // Botの場合はスキップ
      }
      if (!existingRow) {
        sheet.appendRow([userName, userId, globalName, serverNickname, pronouns, roles, role_names, joinedAt, "exists"]); // 新しいメンバーを追加
        // newMembers.add(userId); // 新しいメンバーをセットに追加
        newMembers.add(member); // 新しいメンバーをセットに追加
      } else {
        // 既存の情報を更新
        const rowIndex = existingData.indexOf(existingRow) + 1; // 行番号は1から始まるので+1
        sheet.getRange(rowIndex, 1).setValue(userName); // ユーザー名を更新
        sheet.getRange(rowIndex, 3).setValue(globalName); // グローバル名を更新
        sheet.getRange(rowIndex, 4).setValue(serverNickname); // サーバーでの名前を更新
        sheet.getRange(rowIndex, 5).setValue(pronouns); // 代名詞を更新
        sheet.getRange(rowIndex, 6).setValue(roles); // ロールを更新
        sheet.getRange(rowIndex, 7).setValue(role_names); // ロール名を更新
        sheet.getRange(rowIndex, 8).setValue(joinedAt); // 参加日時を更新
        sheet.getRange(rowIndex, 9).setValue("exists"); // 存在フラグを更新
      }
    });
  } catch (e) {
    Logger.log("Error: " + e.toString());
  }
  return newMembers; // 新しいメンバーのセットを返す
}

// 招待リストを取得する関数
// https://discord.com/developers/docs/resources/guild#get-guild-invites
function getInviteList(token) {
  const payload = {
    apiPath: "/guilds/1266305659868020738/invites", // サーバーIDを適宜変更
    method: "GET",
    discordToken: token // Discord Botのトークン
  };

  try {
    const response = postDiscordAPI(payload);
    const responseData = JSON.parse(response);
    // Logger.log("Response Data: " + JSON.stringify(responseData));
    // 主要な情報を抽出して，スプレッドシートに書き込む
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("招待リスト"); // シート名を適宜変更
    sheet.getRange(1, 1, 1, 8).setValues([["招待コード", "招待先チャンネル", "作成者", "作成日時", "使用回数", "最大使用回数", "最大使用時間", "存在"]]); // ヘッダー行を追加
    // 差分を取って，まだ存在しない行を追加する，使用回数が増えていたら，その行を更新する
    const existingData = sheet.getDataRange().getValues(); // 既存のデータを取得 最初は0
    // 前回の値を保存し，存在の列を一旦すべて「deleted」にする
    var previousExist = [];
    for (let i = 1; i < existingData.length; i++) {
      previousExist.push(existingData[i][6]); // 存在フラグを保存
      sheet.getRange(i + 1, 7).setValue("deleted"); // 存在フラグを「deleted」に更新
    }
    Logger.log("previousExist: " + previousExist);
    var updatedInviteCodes = new Set(); // 使用回数が更新されていた招待コードのリスト
    responseData.forEach(invite => {
      const inviteCode = invite.code;
      const channelName = invite.channel.name;
      const inviterName = invite.inviter.username;
      const createdAt = Utilities.formatDate(new Date(invite.created_at), Session.getScriptTimeZone(), "yyyy/MM/dd HH:mm:ss"); // 作成日時をフォーマット
      const uses = invite.uses || 0; // 使用回数がない場合は0
      const maxUses = invite.max_uses || "unlimited"; // 最大使用回数がない場合は無制限
      const maxAge = invite.max_age || "unlimited"; // 最大使用時間がない場合は無制限
      const existingRow = existingData.find(row => row[0] === inviteCode);
      if (!existingRow) {
        sheet.appendRow([inviteCode, channelName, inviterName, createdAt, uses, maxUses, maxAge, "exists"]); // 新しい招待コードを追加
        previousExist.push("exists"); // 存在フラグを保存
      } else {
        const rowIndex = existingData.indexOf(existingRow) + 1; // getRangeに使うときは+1
        // 存在フラグを「exists」に更新
        sheet.getRange(rowIndex, 7).setValue("exists"); // 存在フラグを更新
        // 使用回数が増えていたら，その行を更新する
        const existingUses = existingRow[3] || 0; // 既存の使用回数
        if (existingUses < uses) {
          sheet.getRange(rowIndex, 4).setValue(uses); // 使用回数を更新
          updatedInviteCodes.add(inviteCode); // 更新された招待コードをセットに追加
        }
      }
    });
    // 今回削除された招待コードをupdatedInviteCodesに追加する
    var nowExist = [];
    for (let i = 1; i < existingData.length; i++) {
      nowExist.push(sheet.getRange(i + 1, 7).getValue()); // 存在フラグを保存
    }
    Logger.log("nowExist: " + nowExist);
    for (let i = 0; i < existingData.length; i++) {
      if (previousExist[i] === "exists" && sheet.getRange(1 + i + 1, 7).getValue() === "deleted") {
        updatedInviteCodes.add(existingData[i+1][0]); // 招待コードをセットに追加
        Logger.log("now deleted: " + existingData[i+1][0]);
      }
    }
  } catch (e) {
    Logger.log("Error: " + e.toString());
  }
  Logger.log("updatedInviteCodes: " + Array.from(updatedInviteCodes));
  return updatedInviteCodes; // 更新された招待コードのセットを返す
}

// ロール一覧を取得する関数
// https://discord.com/developers/docs/resources/guild#get-guild-roles
function getRoleList(token) {
  const payload = {
    apiPath: "/guilds/1266305659868020738/roles", // サーバーIDを適宜変更
    method: "GET",
    discordToken: token // Discord Botのトークン
  };

  try {
    const response = postDiscordAPI(payload);
    const responseData = JSON.parse(response);
    // Logger.log("Response Data: " + JSON.stringify(responseData));
    // 主要な情報を抽出して，スプレッドシートに書き込む
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ロール一覧"); // シート名を適宜変更
    sheet.getRange(1, 1, 1, 2).setValues([["ロール名", "ロールID"]]); // ヘッダー行を追加
    // 差分を取って，まだ存在しない行を追加する
    const existingData = sheet.getDataRange().getValues(); // 既存のデータを取得
    var newRoles = new Set(); // 新しいロールのリスト
    responseData.forEach(role => {
      const roleName = role.name;
      const roleId = role.id;
      const existingRow = existingData.find(row => row[1] === roleId);
      if (!existingRow) {
        sheet.appendRow([roleName, roleId]);
        newRoles.add(roleId); // 新しいロールをセットに追加
      }
    });
  } catch (e) {
    Logger.log("Error: " + e.toString());
  }
  return newRoles; // 新しいロールのセットを返す
}