const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(100,100,100,30);
const paddle = {
  x: 300,
  y: 520,
  width: 120,
  height: 16,
  speed: 8
};

function drawPaddle() {
  ctx.fillStyle = 'blue';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

drawPaddle();
const ball = {
  x: 360,
  y: 480,
  radius: 9,
  dx: 4,
  dy: -4
};
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#91dcff';
  ctx.fill();
}
drawBall();