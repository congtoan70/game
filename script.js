const W = 760;
const H = 680;
const R = 9;                 // bán kính bóng
const PADDLE_Y = 628;
const PADDLE_H = 14;
const ITEM_SIZE = 28;
const BRICK_W = 72;
const BRICK_H = 36;
const BRICK_GAP = 8;
const BRICK_TOP = 82;
const BRICK_LEFT = (W - (7 * BRICK_W + 6 * BRICK_GAP)) / 2;

const gameEl = document.querySelector("#game");
const shellEl = document.querySelector("#game-shell");
const bricksEl = document.querySelector("#bricks");
const ballsEl = document.querySelector("#balls");
const itemsEl = document.querySelector("#items");
const paddleEl = document.querySelector("#paddle");
const blockerEl = document.querySelector("#blocker");
const messageEl = document.querySelector("#message");
const livesEl = document.querySelector("#lives");
const scoreEl = document.querySelector("#score");
const ballCountEl = document.querySelector("#ball-count");
const levelInfoEl = document.querySelector("#level-info");
const selectEl = document.querySelector("#level-select");

// Sáu level độc lập. Menu dùng trực tiếp mảng này.
const LEVELS = [
  { name: "1. Cơ bản", kind: "basic" },
  { name: "2. Gạch đếm ngược", kind: "durable" },
  { name: "3. Thanh chắn di chuyển", kind: "blocker" },
  { name: "4. Bóng tăng tốc", kind: "speed" },
  { name: "5. Bóng đổi màu", kind: "color" },
  { name: "6. Gạch theo thứ tự", kind: "ordered" }
];

const ROWS = ["BBBBBBB", "RRRRRRR", "YYYYYYY", "GGGGGGG"];
const COLORS = { B: "#507ddc", R: "#c74846", Y: "#e5bf43", G: "#388051" };
const LABELS = { wide: "↔", triple: "3", life: "♥" };
const DROPS = [
  { row: 0, col: 1, type: "wide" },
  { row: 1, col: 4, type: "triple" },
  { row: 2, col: 2, type: "life" }
];

let level;
let bricks = [];
let balls = [];
let items = [];
let paddle;
let blocker;
let state = "ready";       // ready, playing, won, lost
let lives = 3;
let score = 0;
let speed = 300;            // pixel mỗi giây
let gameTime = 0;           // mili giây được cập nhật khi đang chơi
let wideUntil = 0;
let ballColor = "red";
let nextColorAt = 3000;
let nextNumber = 1;
let lastFrame = 0;
const keys = { left: false, right: false };
