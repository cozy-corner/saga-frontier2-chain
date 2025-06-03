// Add linked name properties to Skill nodes
// Adds nonFinalName (前・途中) and finalName (最後) properties for skill chaining

// 正拳
MERGE (s:Skill {name: '正拳'})
SET s.nonFinalName = '正', s.finalName = '正拳';

// 裏拳
MERGE (s:Skill {name: '裏拳'})
SET s.nonFinalName = '裏', s.finalName = '裏拳';

// 胴抜き
MERGE (s:Skill {name: '胴抜き'})
SET s.nonFinalName = '胴', s.finalName = '抜き';

// 熊掌打
MERGE (s:Skill {name: '熊掌打'})
SET s.nonFinalName = '熊', s.finalName = '掌打';

// ボコボコ
MERGE (s:Skill {name: 'ボコボコ'})
SET s.nonFinalName = 'ボコ', s.finalName = 'ボコボコ';

// 鬼走り
MERGE (s:Skill {name: '鬼走り'})
SET s.nonFinalName = '鬼', s.finalName = '鬼走り';

// 爆砕鉄拳
MERGE (s:Skill {name: '爆砕鉄拳'})
SET s.nonFinalName = '爆砕', s.finalName = '鉄拳';

// ハートブレイク
MERGE (s:Skill {name: 'ハートブレイク'})
SET s.nonFinalName = 'ハート', s.finalName = 'ブレイク';

// アームハンマー
MERGE (s:Skill {name: 'アームハンマー'})
SET s.nonFinalName = 'アーム', s.finalName = 'ハンマー';

// キッククラッシュ
MERGE (s:Skill {name: 'キッククラッシュ'})
SET s.nonFinalName = 'キック', s.finalName = 'ラッシュ';

// コークスクリュー
MERGE (s:Skill {name: 'コークスクリュー'})
SET s.nonFinalName = 'コーク', s.finalName = 'スクリュー';

// 蹴り上がり
MERGE (s:Skill {name: '蹴り上がり'})
SET s.nonFinalName = '蹴り', s.finalName = '上がり';

// 三角蹴り
MERGE (s:Skill {name: '三角蹴り'})
SET s.nonFinalName = '三', s.finalName = '角蹴り';

// あびせ倒し
MERGE (s:Skill {name: 'あびせ倒し'})
SET s.nonFinalName = 'あびせ', s.finalName = '倒し';

// キッチンシンク
MERGE (s:Skill {name: 'キッチンシンク'})
SET s.nonFinalName = 'キッチン', s.finalName = 'シンク';

// ローリングサンダー
MERGE (s:Skill {name: 'ローリングサンダー'})
SET s.nonFinalName = 'ローリング', s.finalName = 'サンダー';

// 呼び戻し
MERGE (s:Skill {name: '呼び戻し'})
SET s.nonFinalName = '呼び', s.finalName = '戻し';

// 滝登り
MERGE (s:Skill {name: '滝登り'})
SET s.nonFinalName = '滝', s.finalName = '登り';

// 三龍旋
MERGE (s:Skill {name: '三龍旋'})
SET s.nonFinalName = '三龍', s.finalName = '旋';

// カムイ
MERGE (s:Skill {name: 'カムイ'})
SET s.nonFinalName = 'カムイ', s.finalName = 'カムイ';

// 断減
MERGE (s:Skill {name: '断減'})
SET s.nonFinalName = '断減', s.finalName = '断減';

// 切り返し
MERGE (s:Skill {name: '切り返し'})
SET s.nonFinalName = '返し', s.finalName = '返し';

// 十字斬り
MERGE (s:Skill {name: '十字斬り'})
SET s.nonFinalName = '十字', s.finalName = '十字';

// 追突剣
MERGE (s:Skill {name: '追突剣'})
SET s.nonFinalName = '追突', s.finalName = '剣';

// 払い抜け
MERGE (s:Skill {name: '払い抜け'})
SET s.nonFinalName = '抜け', s.finalName = '抜け';

// スマッシュ
MERGE (s:Skill {name: 'スマッシュ'})
SET s.nonFinalName = 'スマ', s.finalName = 'スマッシュ';

// かすみ二段
MERGE (s:Skill {name: 'かすみ二段'})
SET s.nonFinalName = 'かすみ', s.finalName = '二段';

// ファイナルレター
MERGE (s:Skill {name: 'ファイナルレター'})
SET s.nonFinalName = 'ファイナル', s.finalName = 'レター';

// デッドエンド (nonFinalName is empty)
MERGE (s:Skill {name: 'デッドエンド'})
SET s.nonFinalName = '', s.finalName = 'エンド';

// なで斬り
MERGE (s:Skill {name: 'なで斬り'})
SET s.nonFinalName = 'なで', s.finalName = 'なで';

// クロスブレイク
MERGE (s:Skill {name: 'クロスブレイク'})
SET s.nonFinalName = 'クロス', s.finalName = 'ブレイク';

// みじん斬り
MERGE (s:Skill {name: 'みじん斬り'})
SET s.nonFinalName = 'みじん', s.finalName = '斬り';

// 龍尾返し
MERGE (s:Skill {name: '龍尾返し'})
SET s.nonFinalName = '龍尾', s.finalName = '返し';

// かぶと割り
MERGE (s:Skill {name: 'かぶと割り'})
SET s.nonFinalName = 'かぶと', s.finalName = '割り';

// 天地二段
MERGE (s:Skill {name: '天地二段'})
SET s.nonFinalName = '天地', s.finalName = '二段';

// 逆風の太刀
MERGE (s:Skill {name: '逆風の太刀'})
SET s.nonFinalName = '逆風の', s.finalName = '太刀';

// ブルクラッシュ
MERGE (s:Skill {name: 'ブルクラッシュ'})
SET s.nonFinalName = 'ブル', s.finalName = 'クラッシュ';

// 残像剣 (finalName is empty)
MERGE (s:Skill {name: '残像剣'})
SET s.nonFinalName = '残像', s.finalName = '';

// 無拍子
MERGE (s:Skill {name: '無拍子'})
SET s.nonFinalName = '無', s.finalName = '拍子';

// 剣風閃 (finalName is empty)
MERGE (s:Skill {name: '剣風閃'})
SET s.nonFinalName = '剣風', s.finalName = '';

// ベアクラッシュ
MERGE (s:Skill {name: 'ベアクラッシュ'})
SET s.nonFinalName = 'ベア', s.finalName = 'クラッシュ';

// マルチウェイ
MERGE (s:Skill {name: 'マルチウェイ'})
SET s.nonFinalName = 'マルチ', s.finalName = 'ウェイ';

// 烈風剣 (finalName is empty)
MERGE (s:Skill {name: '烈風剣'})
SET s.nonFinalName = '烈風', s.finalName = '';

// 疾風剣 (finalName is empty)
MERGE (s:Skill {name: '疾風剣'})
SET s.nonFinalName = '疾風', s.finalName = '';

// 雷雲剣 (finalName is empty)
MERGE (s:Skill {name: '雷雲剣'})
SET s.nonFinalName = '雷雲', s.finalName = '';

// トマホーク
MERGE (s:Skill {name: 'トマホーク'})
SET s.nonFinalName = 'トマ', s.finalName = 'ホーク';

// かかと切り
MERGE (s:Skill {name: 'かかと切り'})
SET s.nonFinalName = 'かかと', s.finalName = '切り';

// ハイパーハンマー
MERGE (s:Skill {name: 'ハイパーハンマー'})
SET s.nonFinalName = 'ハイパー', s.finalName = 'ハンマー';

// 大木断
MERGE (s:Skill {name: '大木断'})
SET s.nonFinalName = '大木', s.finalName = '断';

// 一時間差
MERGE (s:Skill {name: '一時間差'})
SET s.nonFinalName = '時間差', s.finalName = '時間差';

// スカルクラッシュ
MERGE (s:Skill {name: 'スカルクラッシュ'})
SET s.nonFinalName = 'スカル', s.finalName = 'クラッシュ';

// アクセルターン
MERGE (s:Skill {name: 'アクセルターン'})
SET s.nonFinalName = 'アクセル', s.finalName = 'ターン';

// 夜叉横断
MERGE (s:Skill {name: '夜叉横断'})
SET s.nonFinalName = '夜叉', s.finalName = '横断';

// スカイドライヴ
MERGE (s:Skill {name: 'スカイドライヴ'})
SET s.nonFinalName = 'スカイ', s.finalName = 'ドライヴ';

// 大強撃
MERGE (s:Skill {name: '大強撃'})
SET s.nonFinalName = '大', s.finalName = '強撃';

// ヨーヨー
MERGE (s:Skill {name: 'ヨーヨー'})
SET s.nonFinalName = 'ヨー', s.finalName = 'ヨー';

// 車輪撃 (finalName is empty)
MERGE (s:Skill {name: '車輪撃'})
SET s.nonFinalName = '車', s.finalName = '';

// 高速ナブラ
MERGE (s:Skill {name: '高速ナブラ'})
SET s.nonFinalName = '高速', s.finalName = 'ナブラ';

// スカイランデヴー
MERGE (s:Skill {name: 'スカイランデヴー'})
SET s.nonFinalName = 'スカイ', s.finalName = 'ランデヴー';

// マキ割りトルネード
MERGE (s:Skill {name: 'マキ割りトルネード'})
SET s.nonFinalName = 'マキ割り', s.finalName = 'トルネード';

// 火炎車 (finalName is empty)
MERGE (s:Skill {name: '火炎車'})
SET s.nonFinalName = '火炎', s.finalName = '';

// 回し打ち
MERGE (s:Skill {name: '回し打ち'})
SET s.nonFinalName = '回し', s.finalName = '打ち';

// ハートビート
MERGE (s:Skill {name: 'ハートビート'})
SET s.nonFinalName = 'ハート', s.finalName = 'ビート';

// 海老殺し
MERGE (s:Skill {name: '海老殺し'})
SET s.nonFinalName = '海老', s.finalName = '殺し';

// 骨砕き
MERGE (s:Skill {name: '骨砕き'})
SET s.nonFinalName = '骨', s.finalName = '砕き';

// 脳天直撃
MERGE (s:Skill {name: '脳天直撃'})
SET s.nonFinalName = '脳天', s.finalName = '直撃';

// どら鳴らし
MERGE (s:Skill {name: 'どら鳴らし'})
SET s.nonFinalName = 'どら', s.finalName = '鳴らし';

// 痛打
MERGE (s:Skill {name: '痛打'})
SET s.nonFinalName = '痛', s.finalName = '痛打';

// 削岩撃
MERGE (s:Skill {name: '削岩撃'})
SET s.nonFinalName = '削岩', s.finalName = '削岩撃';

// かめごうら割り
MERGE (s:Skill {name: 'かめごうら割り'})
SET s.nonFinalName = 'かめごうら', s.finalName = 'ごうら割り';

// グランドスラム (finalName is empty)
MERGE (s:Skill {name: 'グランドスラム'})
SET s.nonFinalName = 'グランド', s.finalName = '';

// からすとうさぎ
MERGE (s:Skill {name: 'からすとうさぎ'})
SET s.nonFinalName = 'からす', s.finalName = 'とうさぎ';

// 疾風打 (finalName is empty)
MERGE (s:Skill {name: '疾風打'})
SET s.nonFinalName = '疾風', s.finalName = '';

// 払い突き
MERGE (s:Skill {name: '払い突き'})
SET s.nonFinalName = '払い', s.finalName = '突き';

// 草伏せ
MERGE (s:Skill {name: '草伏せ'})
SET s.nonFinalName = '草', s.finalName = '伏せ';

// チャージ
MERGE (s:Skill {name: 'チャージ'})
SET s.nonFinalName = 'チャー', s.finalName = 'チャージ';

// くし刺し
MERGE (s:Skill {name: 'くし刺し'})
SET s.nonFinalName = 'くし', s.finalName = 'くし';

// 高波返し
MERGE (s:Skill {name: '高波返し'})
SET s.nonFinalName = '高波', s.finalName = '返し';

// スウィング
MERGE (s:Skill {name: 'スウィング'})
SET s.nonFinalName = 'スウィング', s.finalName = 'スウィング';

// 脳削り
MERGE (s:Skill {name: '脳削り'})
SET s.nonFinalName = '脳', s.finalName = '削り';

// エイミング
MERGE (s:Skill {name: 'エイミング'})
SET s.nonFinalName = 'エイ', s.finalName = 'ミング';

// スカッシュ
MERGE (s:Skill {name: 'スカッシュ'})
SET s.nonFinalName = 'スカ', s.finalName = 'ッシュ';

// 光の腕
MERGE (s:Skill {name: '光の腕'})
SET s.nonFinalName = '光の', s.finalName = '腕';

// 極楽連衝
MERGE (s:Skill {name: '極楽連衝'})
SET s.nonFinalName = '極楽', s.finalName = '連衝';

// 活殺獣閃衝
MERGE (s:Skill {name: '活殺獣閃衝'})
SET s.nonFinalName = '活殺', s.finalName = '獣閃衝';

// 蓮華衝
MERGE (s:Skill {name: '蓮華衝'})
SET s.nonFinalName = '蓮華', s.finalName = '蓮華衝';

// 無双三段
MERGE (s:Skill {name: '無双三段'})
SET s.nonFinalName = '無双', s.finalName = '三段';

// ミツチ (finalName is empty)
MERGE (s:Skill {name: 'ミツチ'})
SET s.nonFinalName = 'ミツチ', s.finalName = '';

// 双龍破 (finalName is empty)
MERGE (s:Skill {name: '双龍破'})
SET s.nonFinalName = '双龍', s.finalName = '';

// アルダーストライク (finalName is empty)
MERGE (s:Skill {name: 'アルダーストライク'})
SET s.nonFinalName = 'アルダー', s.finalName = '';

// 狙い撃ち
MERGE (s:Skill {name: '狙い撃ち'})
SET s.nonFinalName = '狙い', s.finalName = '撃ち';

// でたらめ矢 (finalName is empty)
MERGE (s:Skill {name: 'でたらめ矢'})
SET s.nonFinalName = 'でたらめ', s.finalName = '';

// 影ぬい (finalName is empty)
MERGE (s:Skill {name: '影ぬい'})
SET s.nonFinalName = '影', s.finalName = '';

// イド・ブレイク
MERGE (s:Skill {name: 'イド・ブレイク'})
SET s.nonFinalName = 'イド・', s.finalName = 'ブレイク';

// サイドワインダー
MERGE (s:Skill {name: 'サイドワインダー'})
SET s.nonFinalName = 'サイド', s.finalName = 'ワインダー';

// 影矢
MERGE (s:Skill {name: '影矢'})
SET s.nonFinalName = '影', s.finalName = '矢';

// 針千本
MERGE (s:Skill {name: '針千本'})
SET s.nonFinalName = '針千', s.finalName = '本';

// 連射
MERGE (s:Skill {name: '連射'})
SET s.nonFinalName = '連', s.finalName = '連射';

// 瞬速の矢
MERGE (s:Skill {name: '瞬速の矢'})
SET s.nonFinalName = '瞬速の', s.finalName = '瞬速の矢';

// 水晶のピラミッド
MERGE (s:Skill {name: '水晶のピラミッド'})
SET s.nonFinalName = '水晶の', s.finalName = 'ピラミッド';

// バードハンティング (finalName is empty)
MERGE (s:Skill {name: 'バードハンティング'})
SET s.nonFinalName = 'バード', s.finalName = '';

// 毒矢 (finalName is empty)
MERGE (s:Skill {name: '毒矢'})
SET s.nonFinalName = '毒', s.finalName = '';

// 死ね矢 (finalName is empty)
MERGE (s:Skill {name: '死ね矢'})
SET s.nonFinalName = '死ね', s.finalName = '';

// 光の矢 (finalName is empty)
MERGE (s:Skill {name: '光の矢'})
SET s.nonFinalName = '光の', s.finalName = '';

// ウィンドブレーカー (finalName is empty)
MERGE (s:Skill {name: 'ウィンドブレーカー'})
SET s.nonFinalName = 'ウィンド', s.finalName = '';

// イツナ (finalName is empty)
MERGE (s:Skill {name: 'イツナ'})
SET s.nonFinalName = 'イツナ', s.finalName = '';

// ゴッドバード (finalName is empty)
MERGE (s:Skill {name: 'ゴッドバード'})
SET s.nonFinalName = 'ゴッド', s.finalName = '';

// ニードルショット
MERGE (s:Skill {name: 'ニードルショット'})
SET s.nonFinalName = 'ニードル', s.finalName = 'ショット';

// ブッシュファイア (finalName is empty)
MERGE (s:Skill {name: 'ブッシュファイア'})
SET s.nonFinalName = 'ブッシュ', s.finalName = '';

// ウッドストック
MERGE (s:Skill {name: 'ウッドストック'})
SET s.nonFinalName = 'ウッド', s.finalName = 'ストック';

// スリープ (finalName is empty)
MERGE (s:Skill {name: 'スリープ'})
SET s.nonFinalName = 'スリー', s.finalName = '';

// 風と樹のうた (finalName is empty)
MERGE (s:Skill {name: '風と樹のうた'})
SET s.nonFinalName = '風と樹の', s.finalName = '';

// マグマプロージョン (finalName is empty)
MERGE (s:Skill {name: 'マグマプロージョン'})
SET s.nonFinalName = 'マグマ', s.finalName = '';

// ウォーターハンマー
MERGE (s:Skill {name: 'ウォーターハンマー'})
SET s.nonFinalName = 'ウォーター', s.finalName = 'ハンマー';

// フレイムナーガ
MERGE (s:Skill {name: 'フレイムナーガ'})
SET s.nonFinalName = 'ナーガ', s.finalName = 'ナーガ';

// ファイアストーム (finalName is empty)
MERGE (s:Skill {name: 'ファイアストーム'})
SET s.nonFinalName = 'ファイア', s.finalName = '';

// 焼殺
MERGE (s:Skill {name: '焼殺'})
SET s.nonFinalName = '焼', s.finalName = '殺';

// 毒音 (finalName is empty)
MERGE (s:Skill {name: '毒音'})
SET s.nonFinalName = '毒音', s.finalName = '';

// アクアバイパー (finalName is empty)
MERGE (s:Skill {name: 'アクアバイパー'})
SET s.nonFinalName = 'バイパー', s.finalName = '';

// 召雷
MERGE (s:Skill {name: '召雷'})
SET s.nonFinalName = '召雷', s.finalName = '召雷';

// パーマネンス (finalName is empty)
MERGE (s:Skill {name: 'パーマネンス'})
SET s.nonFinalName = 'パーマ', s.finalName = '';

// 天雷
MERGE (s:Skill {name: '天雷'})
SET s.nonFinalName = '天雷', s.finalName = '天雷';

// ソニックバーナー (finalName is empty)
MERGE (s:Skill {name: 'ソニックバーナー'})
SET s.nonFinalName = 'ソニック', s.finalName = '';

// スポイルウェイヴ (finalName is empty)
MERGE (s:Skill {name: 'スポイルウェイヴ'})
SET s.nonFinalName = 'スポイル', s.finalName = '';

// 石の記憶 (finalName is empty)
MERGE (s:Skill {name: '石の記憶'})
SET s.nonFinalName = '石の', s.finalName = '';

// 清歌 (finalName is empty)
MERGE (s:Skill {name: '清歌'})
SET s.nonFinalName = '清歌', s.finalName = '';

// ハウリングヘヴン (finalName is empty)
MERGE (s:Skill {name: 'ハウリングヘヴン'})
SET s.nonFinalName = 'ハウ', s.finalName = '';

// 生命力強化 (finalName is empty)
MERGE (s:Skill {name: '生命力強化'})
SET s.nonFinalName = '生命力', s.finalName = '';

// 樹
MERGE (s:Skill {name: '樹'})
SET s.nonFinalName = '樹', s.finalName = '樹';

// 樹気撃
MERGE (s:Skill {name: '樹気撃'})
SET s.nonFinalName = '樹気', s.finalName = '気撃';

// 樹烈斬り
MERGE (s:Skill {name: '樹烈斬り'})
SET s.nonFinalName = '樹烈', s.finalName = '斬り';

// 樹打
MERGE (s:Skill {name: '樹打'})
SET s.nonFinalName = '樹打', s.finalName = '樹打';

// 緑の牙
MERGE (s:Skill {name: '緑の牙'})
SET s.nonFinalName = '緑の', s.finalName = '牙';

// 樹木の矢
MERGE (s:Skill {name: '樹木の矢'})
SET s.nonFinalName = '樹木の', s.finalName = '矢';

// ニードルバースト (finalName is empty)
MERGE (s:Skill {name: 'ニードルバースト'})
SET s.nonFinalName = 'ニードル', s.finalName = '';

// 石
MERGE (s:Skill {name: '石'})
SET s.nonFinalName = '石', s.finalName = '石';

// 石の拳
MERGE (s:Skill {name: '石の拳'})
SET s.nonFinalName = '石の', s.finalName = '拳';

// 石の剣
MERGE (s:Skill {name: '石の剣'})
SET s.nonFinalName = '石の', s.finalName = '剣';

// 石斧断
MERGE (s:Skill {name: '石斧断'})
SET s.nonFinalName = '石斧', s.finalName = '斧断';

// 石撃
MERGE (s:Skill {name: '石撃'})
SET s.nonFinalName = '石撃', s.finalName = '石撃';

// 石突き
MERGE (s:Skill {name: '石突き'})
SET s.nonFinalName = '石', s.finalName = '突き';

// 炎
MERGE (s:Skill {name: '炎'})
SET s.nonFinalName = '炎', s.finalName = '炎';

// 炎の太刀
MERGE (s:Skill {name: '炎の太刀'})
SET s.nonFinalName = '炎の', s.finalName = '太刀';

// 炎でまっぷたつ
MERGE (s:Skill {name: '炎でまっぷたつ'})
SET s.nonFinalName = '炎で', s.finalName = 'まっぷたつ';

// 火炎龍
MERGE (s:Skill {name: '火炎龍'})
SET s.nonFinalName = '火炎', s.finalName = '炎龍';

// 火矢
MERGE (s:Skill {name: '火矢'})
SET s.nonFinalName = '火矢', s.finalName = '火矢';

// 暗殺術・蛇 (only nonFinalName, no finalName in CSV)
MERGE (s:Skill {name: '暗殺術・蛇'})
SET s.nonFinalName = '暗殺術・蛇', s.finalName = '';

// 音
MERGE (s:Skill {name: '音'})
SET s.nonFinalName = '音', s.finalName = '音';

// 音波剣
MERGE (s:Skill {name: '音波剣'})
SET s.nonFinalName = '音波', s.finalName = '波剣';

// 音波撃
MERGE (s:Skill {name: '音波撃'})
SET s.nonFinalName = '音波', s.finalName = '波撃';

// 音波弾
MERGE (s:Skill {name: '音波弾'})
SET s.nonFinalName = '音波', s.finalName = '波弾';

// メガボルト (finalName is empty)
MERGE (s:Skill {name: 'メガボルト'})
SET s.nonFinalName = 'メガ', s.finalName = '';

// ブレス
MERGE (s:Skill {name: 'ブレス'})
SET s.nonFinalName = 'ブレス', s.finalName = 'ブレス';

// ためる (finalName is empty)
MERGE (s:Skill {name: 'ためる'})
SET s.nonFinalName = 'ため', s.finalName = '';

// メディテーション (finalName is empty)
MERGE (s:Skill {name: 'メディテーション'})
SET s.nonFinalName = 'メディ', s.finalName = '';

// ハードフォーム (finalName is empty)
MERGE (s:Skill {name: 'ハードフォーム'})
SET s.nonFinalName = 'ハード', s.finalName = '';