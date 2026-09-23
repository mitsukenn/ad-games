/**
 * AIゲーム実験室（広告ゲーム） オンラインランキング用 Google Apps Script
 * ------------------------------------------------------------
 * 【使い方】
 * 1. Googleドライブで新しいスプレッドシートを作る（名前は「広告ゲーム_ランキング」など）
 *    ※テトリスパズルのスプレッドシートとは別にする
 * 2. メニュー「拡張機能」→「Apps Script」を開く
 * 3. 既存のコードを消して、このファイルの中身を全部貼り付けて保存
 *    （SPREADSHEET_ID は空のままでOK。そのスプレッドシートに書き込みます）
 * 4. 右上「デプロイ」→「新しいデプロイ」→ 種類の選択（歯車）で「ウェブアプリ」
 *      次のユーザーとして実行: 自分
 *      アクセスできるユーザー: 全員          ← ここ重要（ゲームから読み書きするため）
 * 5. 「デプロイ」→ 承認を求められたら許可
 * 6. 表示される「ウェブアプリのURL」(https://script.google.com/macros/s/××××/exec) をコピー
 * 7. geigeki_road.html の  const RANKING_API = "";  にそのURLを貼り付ける
 *
 * ※コードを更新したときは「デプロイ」→「デプロイを管理」→ 鉛筆マーク →
 *   バージョン「新バージョン」→ デプロイ、とすればURLは変わりません。
 *
 * 【シート構成】
 *   records … 日時 / 日付 / ゲーム / なまえ / ステージ / 兵力 / 撃破 / 端末ID
 *   無ければ自動で作られます。1回のプレイ結果を1行ずつ足していきます。
 *
 * 【順位の決め方】
 *   到達ステージが高い順 → 同じなら最高兵力が多い順 → 同じなら撃破数が多い順。
 *   ステージ 11 は「全10ステージ制覇」（またはエクストラ1面で力尽きた）の意味。
 *   12 以降はエクストラステージ（EX2, EX3…）で力尽きた＝その手前の EX まで突破。
 *   兵力は上限なく増えるので、兵力だけで比べると新しい人が絶対に追いつけなくなる。
 *   そのため「どこまで進んだか」を一番の基準にしている。
 *
 * 【API】（game は "geigeki" など。省略時は geigeki）
 *   GET  ?view=today&game=geigeki&uid=xxx … 今日の順位（1人1件・その日のベスト）
 *   GET  ?view=month&game=geigeki&uid=xxx … 今月のポイント順（続けた人ほど上位）
 *   POST {game, name, stage, army, kills, uid} … 記録を登録。今日の順位を返す
 *   どの返事にも players（これまでにランキング登録したことのある人数＝端末IDの数・全期間）が入る。
 *   GET  ?view=players … { players: { geigeki: 人数, million: 人数, all: 全ゲームで重複なしの人数 } }（トップページ用）
 *   uid を付けると、上位に入っていなくても自分の順位が me に入って返る。
 */

// 空なら、このスクリプトを作ったスプレッドシートに書き込む
var SPREADSHEET_ID = '';
var SHEET_NAME = 'records';
// ランキングに返す件数
var TOP_N = 20;
// ありえない値を弾く簡易チェック
var MAX_STAGE = 99;          // エクストラステージは終わりがないので余裕を持たせる
var CLEAR_STAGE = 11;        // これ以上なら全10ステージ制覇
var MAX_ARMY = 1e15;
var MAX_KILLS = 1e12;
var GAMES = ['geigeki', 'million'];

// 今月ポイントの配分
var PT_PLAY = 1;            // その日に遊んだ
var PT_CLEAR = 3;           // 全ステージ制覇
var PT_RANK = [10, 7, 5];   // その日の1位・2位・3位

function getSheet_() {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['日時', '日付', 'ゲーム', 'なまえ', 'ステージ', '兵力', '撃破', '端末ID']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** 日本時間の「今日」を YYYY-MM-DD で返す */
function todayKey_() {
  return Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
}

function cleanGame_(v) {
  var g = String(v || 'geigeki');
  return GAMES.indexOf(g) === -1 ? 'geigeki' : g;
}
function cleanUid_(v) {
  return String(v || '').replace(/[^\w-]/g, '').slice(0, 32);
}
/** 名前の整形（改行やタブを詰めて12文字まで） */
function cleanName_(v) {
  var name = String(v || 'ななし').replace(/[\r\n\t]/g, ' ').trim().slice(0, 12);
  return name || 'ななし';
}

/** 良い記録ほど前に来る並び順 */
function better_(a, b) {
  if (b.stage !== a.stage) return b.stage - a.stage;
  if (b.army !== a.army) return b.army - a.army;
  return b.kills - a.kills;
}

/** 指定ゲーム・指定月（YYYY-MM）の記録を読む */
function readRows_(game, ym) {
  var sh = getSheet_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, 8).getValues().map(function (row) {
    var day = row[1];
    if (day instanceof Date) day = Utilities.formatDate(day, 'Asia/Tokyo', 'yyyy-MM-dd');
    return {
      day: String(day),
      game: String(row[2]),
      name: String(row[3]),
      stage: Number(row[4]) || 0,
      army: Number(row[5]) || 0,
      kills: Number(row[6]) || 0,
      uid: String(row[7]),
    };
  }).filter(function (r) { return r.game === game && r.day.slice(0, 7) === ym; });
}

/** これまでにランキング登録したことのある人数（端末IDの数・全期間）をゲームごとに数える。
 *  all は全ゲーム合わせて重複なしの人数（2つのゲームで同じ端末は1人） */
function playersAll_() {
  var sh = getSheet_();
  var last = sh.getLastRow();
  var seen = {}, count = { all: 0 }, seenAll = {};
  GAMES.forEach(function (g) { seen[g] = {}; count[g] = 0; });
  if (last < 2) return count;
  sh.getRange(2, 3, last - 1, 6).getValues().forEach(function (row) {
    var g = String(row[0]), uid = String(row[5]);
    if (!seen[g] || !uid || seen[g][uid]) return;
    seen[g][uid] = true;
    count[g]++;
    if (!seenAll[uid]) { seenAll[uid] = true; count.all++; }
  });
  return count;
}

/** 同じ端末はベストの1件だけ残して並べる */
function bestPerUid_(rows) {
  var byUid = {};
  rows.forEach(function (r) {
    var cur = byUid[r.uid];
    if (!cur || better_(r, cur) < 0) byUid[r.uid] = r;
    else if (cur) cur.name = r.name;             // 表示名は最新のものにする
  });
  var list = Object.keys(byUid).map(function (k) { return byUid[k]; });
  list.sort(better_);
  return list;
}

/** 今日のランキング（全員分・順位つき） */
function todayAll_(game) {
  var today = todayKey_();
  var list = bestPerUid_(readRows_(game, today.slice(0, 7)).filter(function (r) { return r.day === today; }));
  return list.map(function (r, i) {
    return { rank: i + 1, name: r.name, stage: r.stage, army: r.army, kills: r.kills, uid: r.uid };
  });
}

/** 今月のポイント順（全員分・順位つき） */
function monthAll_(game) {
  var rows = readRows_(game, todayKey_().slice(0, 7));
  var byDay = {};
  rows.forEach(function (r) { (byDay[r.day] = byDay[r.day] || []).push(r); });

  var agg = {};
  Object.keys(byDay).sort().forEach(function (day) {
    bestPerUid_(byDay[day]).forEach(function (r, i) {
      var a = agg[r.uid] || (agg[r.uid] = { uid: r.uid, name: r.name, points: 0, days: 0, stage: 0, army: 0, kills: 0 });
      a.name = r.name;
      a.days += 1;
      a.points += PT_PLAY;
      if (r.stage >= CLEAR_STAGE) a.points += PT_CLEAR;
      if (i < PT_RANK.length) a.points += PT_RANK[i];
      if (better_(r, a) < 0) { a.stage = r.stage; a.army = r.army; a.kills = r.kills; }
    });
  });

  var list = Object.keys(agg).map(function (k) { return agg[k]; });
  list.sort(function (a, b) { return b.points !== a.points ? b.points - a.points : better_(a, b); });
  return list.map(function (a, i) {
    return { rank: i + 1, name: a.name, points: a.points, days: a.days, stage: a.stage, army: a.army, uid: a.uid };
  });
}

/** 上位だけを返し、uid があれば自分の順位も添える（端末IDは自分のものだけ返す） */
function pack_(view, all, uid, game) {
  var me = null;
  var entries = all.slice(0, TOP_N).map(function (e) {
    var o = shallow_(e);
    o.mine = !!uid && e.uid === uid;
    delete o.uid;
    return o;
  });
  if (uid) {
    for (var i = 0; i < all.length; i++) {
      if (all[i].uid === uid) { me = shallow_(all[i]); delete me.uid; break; }
    }
  }
  return { view: view, total: all.length, entries: entries, me: me, players: playersAll_()[game] || 0 };
}
function shallow_(o) {
  var r = {};
  for (var k in o) r[k] = o[k];
  return r;
}

function doGet(e) {
  try {
    var p = (e && e.parameter) || {};
    if (p.view === 'players') return json_({ players: playersAll_() });
    var game = cleanGame_(p.game);
    var uid = cleanUid_(p.uid);
    if (p.view === 'month') return json_(pack_('month', monthAll_(game), uid, game));
    return json_(pack_('today', todayAll_(game), uid, game));
  } catch (err) {
    return json_({ entries: [], error: String(err) });
  }
}

/** 記録の登録： POST（本文はJSON、Content-Type は text/plain にしてプリフライトを避ける） */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var game = cleanGame_(body.game);
    var uid = cleanUid_(body.uid);
    if (!uid) return json_({ ok: false, error: 'invalid uid' });

    var stage = Math.floor(Number(body.stage));
    var army = Math.floor(Number(body.army));
    var kills = Math.floor(Number(body.kills));
    if (!isFinite(stage) || stage < 1 || stage > MAX_STAGE) return json_({ ok: false, error: 'invalid stage' });
    if (!isFinite(army) || army < 0 || army > MAX_ARMY) return json_({ ok: false, error: 'invalid army' });
    if (!isFinite(kills) || kills < 0 || kills > MAX_KILLS) return json_({ ok: false, error: 'invalid kills' });

    // 日付はサーバー側で決める（過去の日に入れ直せないように）
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      getSheet_().appendRow([new Date(), todayKey_(), game, cleanName_(body.name), stage, army, kills, uid]);
    } finally {
      lock.releaseLock();
    }
    var res = pack_('today', todayAll_(game), uid, game);
    res.ok = true;
    return json_(res);
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
