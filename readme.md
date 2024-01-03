# koishi-plugin-bangumi-onair

[![npm](https://img.shields.io/npm/v/koishi-plugin-bangumi-onair?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-bangumi-onair)

This is a plugin for [Koishi](https://koishi.chat/).

Query and display bangumi that is onair today/this season in text, can also query any day/season.

Supported Sources:
 - `bangumi-data`:
   - **Slow update** at the beginning of seasons
   - Includes bangumi of all time
   - Includes start time (accurate to minute)
 - `bangumi-API-Calendar`:
   - **Fast update** at the beginning of seasons
   - Only includes bangumi of this season
   - Does not include start time

这是一个 [Koishi](https://koishi.chat/) 插件。

查询并以文本展示 今日/本季 正在放送的番剧，也支持查询任意 一天/一季。

支持的数据源：
 - `bangumi-data`:
   - **换季更新慢**
   - 包含历史动画
   - 包含播出时间（精确到分钟）
 - `bangumi-API-Calendar`:
   - **换季更新快**
   - 只包含本季动画
   - 不包含播出时间

## Examples / 示例

### onair.day [offset: number]:

Will first check if database exists. If not, will automatically execute `.update`.

Output bangumi that is onair **today plus offset**.

Source `bangumi-data`.

将首先检查数据库是否存在。如果不存在则自动执行 `.update`。

输出**今日加上偏移量**当天放送的动画。

数据来源 `bangumi-data`。

```
> onair.day
# or use alias / 或者使用别名
> bd
```

<details>
<summary>output / 输出:</summary>

> 00:05   スプリガン<br>
> 00:28   不死不幸<br>
> 00:58   破灭之国<br>
> 08:30   影之诗F 七影篇<br>
> 16:30   特搜组大吾 救国的橘色部队<br>
> 16:55   全力兔子<br>
> 16:55   パウ・パトロール(シーズン4)<br>
> 17:25   希望的力量～大人光之美少女'23～<br>
> 18:00   哆啦A梦<br>
> \> --- 23/12/30 18:52 ---<br>
> 21:00   世界尽头的圣骑士 铁锈之山的君王<br>
> 21:30   家里蹲吸血姬的苦闷<br>
> 22:00   间谍过家家 第二季<br>
> 22:00   极速车魂<br>
> 22:00   死神 千年血战篇-诀别谭-<br>
> 22:30   新上司是天然呆<br>
> 23:00   药屋少女的呢喃<br>
> 23:00   归还者的魔法要特别<br>
> 23:00   小不点<br>
> 23:30   猪肝记得煮熟再吃<br>

</details>

```
# query tomorrow / 查询明天
> onair.day 1
```

### onair.cday [offset: number]:

Will first check if database exists. If not, will automatically execute `.update`.

Output bangumi that is onair **today plus offset**.

Source `bangumi-API`.

将首先检查数据库是否存在。如果不存在则自动执行 `.update`。

输出**今日加上偏移量**当天放送的动画。

数据来源 `bangumi-API`。

```
> onair.cday
# or use alias / 或者使用别名
> bcd
```

<details>
<summary>output / 输出:</summary>

> --- Wednesday 24/01/03 ---<br>
> 弱角友崎同学 第二季<br>
> 欢迎来到实力至上主义教室 第三季<br>
> 异修罗<br>
> 梦想成为魔法少女<br>

</details>

### onair.season [offset: number]:

Will first check if database exists. If not, will automatically execute `.update`.

Output bangumi that is onair **this season plus offset**.

Source `bangumi-data`.

将首先检查数据库是否存在。如果不存在则自动执行 `.update`。

输出**本季加上偏移量**当季放送的动画。

数据来源 `bangumi-data`。


```
> onair.season
# or use alias / 或者使用别名
> bs
```

<details>
<summary>output (uncheck showChineseTitle) / 输出（未勾选“显示中文标题”）:</summary>

> \> --- 23/10 ---<br>
> --- Monday ---<br>
> 00:00 10-02   しーくれっとみっしょん～潜入捜査官は絶対に負けない！～<br>
> 20:00 10-09   星屑テレパス<br>
> 20:30 10-02   B-PROJECT ～熱烈＊ラブコール～<br>
> 21:00 10-02   ミギとダリ<br>
> 21:30 10-02   鴨乃橋ロンの禁断推理<br>
> 22:00 10-09   川越ボーイズ・シング<br>
> 23:00 10-02   SHY<br>
> 23:30 10-02   私の推しは悪役令嬢。<br>
> --- Tuesday ---<br>
> 00:00 10-03   とあるおっさんのVRMMO活動記<br>
> 00:00 10-10   デッドマウント・デスプレイ(第2クール)<br>
> 00:30 10-03   聖剣学院の魔剣使い<br>
> 22:00 10-03   聖女の魔力は万能です Season2<br>
> 22:00 10-03   Paradox Live THE ANIMATION<br>
> 23:00 10-03   東京リベンジャーズ 天竺編<br>
> --- Wednesday ---<br>
> 00:00 10-04   忍ばない！クリプトニンジャ咲耶<br>
> 00:00 11-01   転生したらスライムだった件 コリウスの夢<br>
> 20:00 10-04   ブルバスター<br>
> 21:00 10-04   婚約破棄された令嬢を拾った俺が、イケナイことを教え込む<br>
> 21:30 10-04   陰の実力者になりたくて！ 2nd season<br>
> 23:00 10-04   絆のアリル セカンドシーズン<br>
> 23:00 10-04   ウマ娘 プリティーダービー Season 3<br>
> 23:30 10-04   16bitセンセーション -ANOTHER LAYER-<br>
> 23:55 10-04   カミエラビ GOD.app<br>
> --- Thursday ---<br>
> 00:00 10-12   グッド・ナイト・ワールド<br>
> 00:00 10-26   PLUTO<br>
> 00:00 11-02   鬼武者<br>
> 00:00 11-09   悪魔くん<br>
> 00:00 11-23   ぼくのデーモン<br>
> 00:30 10-05   暴食のベルセルク<br>
> 21:00 10-05   魔法使いの嫁 SEASON2 第2クール<br>
> 21:05 10-12   まついぬ<br>
> 21:30 10-12   Dr.STONE NEW WORLD(第2クール)<br>
> 22:30 10-05   柚木さんちの四兄弟。<br>
> 22:30 10-05   ビックリメン<br>
> --- Friday ---<br>
> 00:00 10-06   レヱル・ロマネスク２<br>
> 00:00 11-10   機甲英雄 機鬥勇者 第2季<br>
> 00:33 10-06   アンダーニンジャ<br>
> 00:58 10-13   放課後少年花子くん<br>
> 01:23 10-06   カノジョも彼女 Season 2<br>
> 17:25 10-06   BEYBLADE X<br>
> 20:00 10-06   盾の勇者の成り上がり Season 3<br>
> 21:00 10-06   ゴブリンスレイヤーⅡ<br>
> 21:30 10-06   葬送のフリーレン<br>
> 21:30 10-06   経験済みなキミと、経験ゼロなオレが、お付き合いする話。<br>
> 22:00 10-06   攻略うぉんてっど！～異世界救います!?～<br>
> 23:00 10-06   ヒプノシスマイク -Division Rap Battle- Rhyme Anima ＋<br>
> 23:00 11-03   進撃の巨人 The Final Season 完結編 後編<br>
> --- Saturday ---<br>
> 00:28 10-07   アンデッドアンラック<br>
> 00:58 10-07   はめつのおうこく<br>
> 01:10 10-07   アークナイツ【冬隠帰路/PERISH IN FROST】<br>
> 08:00 10-07   おしりたんてい(第8シリーズ)<br>
> 16:55 10-07   全力ウサギ(2023)<br>
> 17:25 10-07   キボウノチカラ～オトナプリキュア'23～<br>
> 21:00 10-07   最果てのパラディン 鉄錆の山の王<br>
> 21:30 10-07   ひきこまり吸血姫の悶々<br>
> 22:00 10-07   SPY×FAMILY Season 2<br>
> 22:30 10-07   新しい上司はど天然<br>
> 23:00 10-07   帰還者の魔法は特別です<br>
> 23:00 10-07   オチビサン<br>
> 23:00 10-28   薬屋のひとりごと<br>
> 23:30 10-07   豚のレバーは加熱しろ<br>
> --- Sunday ---<br>
> 00:00 10-08   ティアムーン帝国物語～断頭台から始まる、姫の転生逆転ストー<br>リー～
> 00:30 10-08   僕らの雨いろプロトコル<br>
> 01:00 10-08   ポーション頼みで生き延びます！<br>
> 08:15 10-01   トランスフォーマー アーススパーク<br>
> 15:30 10-08   七つの大罪 黙示録の四騎士<br>
> 16:00 10-01   シャングリラ・フロンティア～クソゲーハンター、神ゲーに挑ま<br>んとす～
> 16:00 10-22   ドッグシグナル<br>
> 16:30 10-01   キャプテン翼シーズン2 ジュニアユース編<br>
> 21:00 10-01   オーバーテイク！<br>
> 21:00 10-01   でこぼこ魔女の親子事情<br>
> 21:30 10-08   君のことが大大大大大好きな100人の彼女<br>

</details>

```
# query last season / 查询上一季
> onair.season -1
```

### onair.cseason:

Will first check if database exists. If not, will automatically execute `.update`.

Output bangumi that is onair **this season**.

Source `bangumi-API`.

将首先检查数据库是否存在。如果不存在则自动执行 `.update`。

输出**本季**当季放送的动画。

数据来源 `bangumi-API`。

```
> onair.cseason
# or use alias / 或者使用别名
> bcs
```

<details>
<summary>output / 输出:</summary>

> \> --- 24/01 ---<br>
> --- Monday ---<br>
> 01-01   万古狂帝<br>
> 01-08   奇异贤伴 黑色天使 第2部分<br>
> 01-08   公主大人“拷问”的时间到了<br>
> 01-08   愚蠢天使与恶魔共舞<br>
> 01-08   至高之牌 第二季<br>
> 01-08   北海道辣妹贼拉可爱<br>
> 01-08   事与愿违的不死冒险者<br>
> 01-08   月光下的异世界之旅 第二幕<br>
> 01-22   大宇宙时代<br>
> --- Tuesday ---<br>
> 01-02   无脑魔女 第二季<br>
> 01-09   忍ばない！クリプトニンジャ咲耶 弐ノ巻<br>
> 01-09   反派大小姐等级99～我是隐藏BOSS但不是魔王～<br>
> 01-09   通灵王 FLOWERS<br>
> --- Wednesday ---<br>
> 10-20   海贼王<br>
> 01-03   梦想成为魔法少女<br>
> 01-03   异修罗<br>
> 01-03   欢迎来到实力至上主义教室 第三季<br>
> 01-03   弱角友崎同学 第二季<br>
> 01-10   炎上撲滅！魔法少女アイ子<br>
> 01-10   战国妖狐<br>
> 01-10   到了30岁还是处男，似乎会变成魔法师<br>
> 01-10   金属胭脂<br>
> 01-10   外科医生爱丽丝<br>
> 01-24   异人君莫邪<br>
> --- Thursday ---<br>
> 01-04   秒杀外挂太强了，异世界的家伙们根本就不是对手。<br>
> 01-04   迷宫饭<br>
> 01-04   魔都精兵的奴隶<br>
> 01-11   人气温泉『异世界温泉』开拓记 ～40岁左右的温泉爱好者转世到了悠闲的温泉天堂～<br>
> 01-11   月刊妄想科学<br>
> 01-11   勇气爆发BangBravern<br>
> 01-11   福星小子 第二季<br>
> 01-11   魔女与野兽<br>
> 01-18   地下城与勇士之破界少女<br>
> --- Friday ---<br>
> 09-29   葬送的芙莉莲<br>
> 01-05   百千家的妖怪王子<br>
> 01-05   碰之道<br>
> 01-05   超普通县千叶传说<br>
> 01-05   佐佐木与文鸟小哔<br>
> 01-05   治愈魔法的错误使用方法<br>
> 01-12   スナックバス江<br>
> 01-12   最弱的驯养师开启的捡垃圾的旅途。<br>
> 01-19   地狱客栈<br>
> 01-26   剑网3·侠肝义胆沈剑心 第三季（下卷）<br>
> 01-08   名侦探柯南<br>
> --- Saturday ---<br>
> 01-06   最强肉盾的迷宫攻略～拥有稀少技能体力9999的肉盾，被勇者队伍辞退了～<br>
> 01-06   貼りまわれ！こいぬ<br>
> 01-06   指尖相触，恋恋不舍<br>
> 01-06   物理魔法使马修 第二季<br>
> 01-06   我心里危险的东西 第二季<br>
> 01-06   婚戒物语<br>
> 01-06   青之驱魔师 岛根启明结社篇<br>
> 01-06   王者天下 第五季<br>
> 01-06   我独自升级<br>
> 01-13   卡片战斗先导者 DivineZ<br>
> 01-13   ぶっちぎり?!<br>
> 01-13   王者荣耀：荣耀之章 碎月篇<br>
> 01-20   肥志百科 原来你是这样的发明<br>
> 00-00   我的三体 第四季<br>
> --- Sunday ---<br>
> 01-07   挣扎吧，亚当<br>
> 01-07   Grimsburg<br>
> 01-07   轮回七次的反派大小姐，在前敌国享受随心所欲的新婚生活<br>
> 01-07   休假日的坏人先生<br>
> 01-07   因为不是命中注定的同伴而被赶出了勇者的队伍、从此以后过上了悠闲的隐居生活 第二季<br>
> 01-07   一世之尊<br>
> 01-07   为了在异世界也能抚摸毛茸茸而努力<br>
> 01-14   不白吃古诗词漫游记 第一季<br>
> 01-14   明治击剑－1874－<br>
> 01-14   暗芝居 第十二季<br>
> 01-14   狩火之王 第二季<br>
> 01-21   怪兽 一百三情飞龙侍极<br>

</details>

### onair.update:

Will fetch data from CDN & bangumi-API and upsert into the database.

将从 CDN & bangumi-API 获取数据并存入数据库。

```
> onair.update
# or use alias / 或者使用别名
> bupdate
```

### onair.drop:

Will try to drop the database. Not called under normal condition.

将尝试删除数据库。正常情况下不需要使用。

```
> onair.drop
# or use alias / 或者使用别名
> bdrop
```

## TODOs / 开发计划
 - [x] 功能：显示本季动画 -> `.season` | `.cseason`
   - [x] 参数：季度（每三月）偏移 -> `.season [offset: number]`
 - [x] 功能：显示今日动画 -> `.day` | `.cday`
   - [x] 参数：日期偏移 -> `.day [offset: number]` | `.cday [offset: number]`
 - [x] 功能：更新动画数据 -> `.update`
 - [x] 功能：清除动画数据 -> `.drop`
 - [x] 设置：排除非本季度开播动画 -> `excludeOld`
 - [x] 设置：显示中文标题 -> `showChineseTitle`
 - [x] 设置：按星期分割显示季度动画，避免消息过长 -> `separateWeekdays`
 - [x] 基础：使用数据库减少请求
 - [x] 基础：使用 *bangumi-API-Calendar* 获取准确当日数据
 - [x] 语言：中文设置和提示
 - [ ] 设置：限宽
 - [ ] 设置：限长
 - [ ] 设置：今日动画隐藏开播时间
 - [ ] 设置：季度动画隐藏开播时间/日期
 - [ ] 功能：订阅动画
 - [ ] 功能：仅显示订阅
 - [ ] 功能：订阅开播提醒
 - [ ] 功能：参数覆写设置
 - [ ] 功能：以图片展示

## Credits / 鸣谢
 - [Koishi](https://koishi.chat/)
 - [Bangumi API](https://github.com/bangumi/api/)
 - [Bangumi Data](https://github.com/bangumi-data/bangumi-data)
