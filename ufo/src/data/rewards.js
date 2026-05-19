(() => {
  "use strict";

const growthRewards = [
  {
    correct: 0,
    level: 1,
    title: "星の見習い",
    item: "なかよしハート",
    icon: "assets/yuri/extra/items/15_friendship_heart.png",
  },
  {
    correct: 5,
    level: 2,
    title: "星くず集め",
    item: "スターコイン",
    icon: "assets/yuri/extra/items/22_star_coin.png",
  },
  {
    correct: 15,
    level: 3,
    title: "月のおやつ係",
    item: "ムーンクッキー",
    icon: "assets/yuri/extra/items/02_moon_cookie.png",
  },
  {
    correct: 30,
    level: 4,
    title: "リボン整備士",
    item: "リボンアンテナ",
    icon: "assets/yuri/extra/items/06_bow_ribbon.png",
  },
  {
    correct: 50,
    level: 5,
    title: "航行バッテリー担当",
    item: "ラベンダーバッテリー",
    icon: "assets/yuri/extra/items/04_lavender_battery.png",
  },
  {
    correct: 80,
    level: 6,
    title: "きらめき観測士",
    item: "きらめきクリスタル",
    icon: "assets/yuri/extra/items/07_sparkle_crystal.png",
  },
  {
    correct: 120,
    level: 7,
    title: "小惑星ナビゲーター",
    item: "ミニ惑星トイ",
    icon: "assets/yuri/extra/items/10_mini_planet_toy.png",
  },
  {
    correct: 180,
    level: 8,
    title: "ハート燃料整備士",
    item: "ハート燃料セル",
    icon: "assets/yuri/extra/items/01_heart_fuel_cell.png",
  },
  {
    correct: 250,
    level: 9,
    title: "銀河キャンディ係",
    item: "スターキャンディ",
    icon: "assets/yuri/extra/items/03_star_candy.png",
  },
  {
    correct: 350,
    level: 10,
    title: "工具ドック見習い",
    item: "リペアレンチ",
    icon: "assets/yuri/extra/items/05_repair_wrench.png",
  },
  {
    correct: 500,
    level: 11,
    title: "夢見ステーション守り",
    item: "ふわふわピロー",
    icon: "assets/yuri/extra/items/08_soft_pillow.png",
  },
  {
    correct: 700,
    level: 12,
    title: "音符通信士",
    item: "ミュージックチャーム",
    icon: "assets/yuri/extra/items/09_music_note_charm.png",
  },
  {
    correct: 1000,
    level: 13,
    title: "彗星おやつハンター",
    item: "コメットキャンディ",
    icon: "assets/yuri/extra/items/11_comet_candy.png",
  },
  {
    correct: 1300,
    level: 14,
    title: "ミルキー補給係",
    item: "ミルクボトル",
    icon: "assets/yuri/extra/items/12_milk_bottle.png",
  },
  {
    correct: 1600,
    level: 15,
    title: "ぬくぬく基地長",
    item: "タイニーブランケット",
    icon: "assets/yuri/extra/items/13_tiny_blanket.png",
  },
  {
    correct: 2000,
    level: 16,
    title: "星間チケット係",
    item: "UFOチケット",
    icon: "assets/yuri/extra/items/14_ufo_ticket.png",
  },
  {
    correct: 2500,
    level: 17,
    title: "雲海レーダー係",
    item: "クラウドパフ",
    icon: "assets/yuri/extra/items/16_cloud_puff.png",
  },
  {
    correct: 3000,
    level: 18,
    title: "おやすみ管制官",
    item: "スリープカプセル",
    icon: "assets/yuri/extra/items/17_sleep_capsule.png",
  },
  {
    correct: 3800,
    level: 19,
    title: "ピンク星雲コレクター",
    item: "ピンクジェム",
    icon: "assets/yuri/extra/items/18_pink_gem.png",
  },
  {
    correct: 4600,
    level: 20,
    title: "ティータイム司令",
    item: "コズミックティーカップ",
    icon: "assets/yuri/extra/items/19_cosmic_teacup.png",
  },
  {
    correct: 5500,
    level: 21,
    title: "アンテナクラフト担当",
    item: "アンテナパーツ",
    icon: "assets/yuri/extra/items/20_antenna_part.png",
  },
  {
    correct: 6500,
    level: 22,
    title: "ランプ航路案内人",
    item: "ランプバルブ",
    icon: "assets/yuri/extra/items/21_lamp_bulb.png",
  },
  {
    correct: 7600,
    level: 23,
    title: "なかよし補給隊",
    item: "ペットトリート",
    icon: "assets/yuri/extra/items/23_pet_treat.png",
  },
  {
    correct: 8800,
    level: 24,
    title: "数式ステーション長",
    item: "数式ワンド",
    icon: "assets/yuri/extra/items/24_magic_wand.png",
  },
  {
    correct: 10000,
    level: 25,
    title: "銀河プリンセス",
    item: "グランドオービット",
    icon: "assets/yuri/extra/effects/20_magic_circle.png",
  },
];

const titleRewardSlots = [
  { x: 82, y: 76, size: 38, rotate: -14 },
  { x: 28, y: 10, size: 30, rotate: 9 },
  { x: 50, y: 16, size: 34, rotate: -7 },
  { x: 72, y: 12, size: 32, rotate: 12 },
  { x: 90, y: 20, size: 40, rotate: -10 },
  { x: 15, y: 64, size: 32, rotate: 11 },
  { x: 38, y: 72, size: 28, rotate: -12 },
  { x: 62, y: 70, size: 31, rotate: 8 },
  { x: 84, y: 62, size: 33, rotate: 13 },
  { x: 6, y: 46, size: 28, rotate: 7 },
  { x: 24, y: 44, size: 24, rotate: -8 },
  { x: 43, y: 40, size: 24, rotate: 10 },
  { x: 58, y: 42, size: 25, rotate: -11 },
  { x: 78, y: 42, size: 27, rotate: 7 },
  { x: 94, y: 48, size: 30, rotate: -8 },
  { x: 13, y: 88, size: 26, rotate: -11 },
  { x: 30, y: 88, size: 24, rotate: 9 },
  { x: 47, y: 88, size: 24, rotate: -7 },
  { x: 64, y: 88, size: 25, rotate: 11 },
  { x: 84, y: 86, size: 28, rotate: -10 },
  { x: 18, y: 8, size: 22, rotate: 8 },
  { x: 66, y: 8, size: 22, rotate: -9 },
  { x: 36, y: 18, size: 21, rotate: 13 },
  { x: 56, y: 76, size: 22, rotate: -13 },
  { x: 96, y: 82, size: 36, rotate: 14 },
];

  function getGrowthRewards() {
    return growthRewards;
  }

  function getTitleRewardSlots() {
    return titleRewardSlots;
  }

  window.MathFitRewards = {
    growthRewards,
    titleRewardSlots,
    getGrowthRewards,
    getTitleRewardSlots,
  };
})();
