const gameEl=document.getElementById("game");
const paddleEl=document.getElementById("paddle");
const ballsEl=document.getElementById("balls");
const messageEl=document.getElementById("message");

const bricksEl =document.getElementById("bricks");
const selectEl = document.getElementById("level-select");
const restartButton= document.getElementById("restart-button");
const livesEl = document.getElementById("lives");
const scoreEl = document.getElementById("score");
const itemsEl = document.getElementById("items");


const ballCountEl = document.getElementById("ball-count");
const levelInfoEl = document.getElementById("level-info");
const blockerEl = document.getElementById("blocker");
const W=760;
const H=680;
const R=9;
const PADDLE_Y=628;
const PADDLE_H=14;
const BRICK_W=72;
const ITEM_SIZE=28;
const BRICK_H=36;
const BRICK_GAP=8;
const BRICK_TOP=82;
const BRICK_LEFT=104;
const LEVELS=[{name:"1. Co ban",kind:"basic"},
    {name:"2. Gach dem nguoc",kind:"durable"},
{name:"3. Thanh chan di chuyen",kind:"blocker"}
];
const LABELS= {wide:"<->",triple:"3",life:"+"}
const ROWS=["1111111","1111111","1111111","1111111"]
const DROPS=[
    {row:0, col:1, type:"wide"},
    {row:1, col:4, type:"triple"},
    {row:2, col:2, type:"life"}
];

let level;
let bricks=[];
let blocker;
let lives =3;
let score=0;
let gameTime=0;
let wideUntil=0;
let balls=[];
let items=[];
let paddle={
    x:320,w:120
};
let state="ready";
let speed=300;
let lastFrame=0;
const keys={left:false,right:false};




function clamp(value,min,max){
    if( value<min) return min;
    if(value>max) return max;
    return value;
}
function message(text){
    messageEl.textContent=text;
}

function createBall(x,y,vx=0,vy=0){
    const el=document.createElement("div");
    el.className="ball";
    ballsEl.append(el);
    return {x,y,vx,vy,el};
}



function resetBall(){
    ballsEl.replaceChildren();
    balls=[createBall(paddle.x+paddle.w/2,PADDLE_Y-R-3)];
    state="ready";
    message("nhan space de tha bong")
}

function render(){
    paddleEl.style.left=`${paddle.x}px`;

    paddleEl.style.top=`${PADDLE_Y}px`;

    paddleEl.style.width=`${paddle.w}px`;
    blockerEl.style.left=`${blocker.x}px`;
    blockerEl.style.top=`${blocker.y}px`;
    blockerEl.style.width=`${blocker.w}px`;

    for(const ball of balls){

        ball.el.style.left=`${ball.x-R}px`;
        ball.el.style.top=`${ball.y-R}px`;
        ball.el.style.background ="#fff"

    }
    for(const item of items){
        item.el.style.left= `${item.x}px`;

        item.el.style.top= `${item.y}px`;
    }
    updateHud();
}


function movePaddleTo(centerX){
    paddle.x=clamp(centerX-paddle.w/2,0,W-paddle.w);
    if(state==="ready") balls[0].x=paddle.x+paddle.w/2;
}

LEVELS.forEach((config, index)=>{
    const option = document.createElement("option");
    option.value=index;
    option.textContent= config.name;
    selectEl.append(option);
});
selectEl.addEventListener("change",()=> startLevel(Number(selectEl.value)));
restartButton.addEventListener("click",()=> startLevel(Number(selectEl.value)));

function pointerX(event){
    const rect = gameEl.getBoundingClientRect();
    return event.clientX-rect.left;
}
gameEl.addEventListener("pointermove", event=>{movePaddleTo(pointerX(event));
});
gameEl.addEventListener("pointerdown",event=>{
    gameEl.focus({preventScroll:true});
    movePaddleTo(pointerX(event));
    launchBall();
});
window.addEventListener("keydown",event=>{
    if(event.target===selectEl || event.target === restartButton) return;
    if(["ArrowLeft","ArrowRight","Space"].includes(event.code)) event.preventDefault();

    if(event.code==="ArrowLeft") keys.left=true;
    if(event.code==="ArrowRight") keys.right=true;
    if(event.code === "Space" && !event.repeat) launchBall();
});

window.addEventListener("keyup",event=>{
    if(event.code==="ArrowLeft") keys.left=false;
    if(event.code==="ArrowRight") keys.right=false;
});
window.addEventListener("blur",()=>{
    keys.left=false;
    keys.right=false;
});

function launchBall(){
    if(state!=="ready") return;
    balls[0].vx=speed*0.6;
    balls[0].vy=-speed*0.8;
    state="playing";
    message("");
}

function updateBall(ball,dt){
    const oldX=ball.x;
    const oldY=ball.y;
    ball.x+=ball.vx*dt;
    ball.y+= ball.vy*dt;
    if(ball.x-R<0){
        ball.x=R;
        ball.vx=Math.abs(ball.vx);
    }
    if(ball.x+R > W){
        ball.x= W-R;
        ball.vx=  -Math.abs(ball.vx);
    }
    if(ball.y-R<0){
        ball.y=R;
        ball.vy=Math.abs(ball.vy);
    }
    if (level.kind ==="blocker" && circleHitsRect(ball,blocker)){
        bounceFromRect(ball,blocker, oldX,oldY,blocker.oldX);
    }
    paddleHit(ball,oldY);
    for (let i= bricks.length-1;i>=0;i--){
        const brick= bricks[i];
        if(!circleHitsRect(ball,brick)) continue;
        bounceFromRect(ball,brick,oldX,oldY);
        damageBrick(brick);
        break;
    }
}

function circleHitsRect(ball,rect){
    const nearX=clamp(ball.x,rect.x,rect.x+rect.w);
    const nearY=clamp(ball.y,rect.y,rect.y+rect.h);
    const dx=ball.x-nearX;
    const dy=ball.y-nearY;
    const distanceSquared= dx*dx+dy*dy;
    return distanceSquared <=R*R;
}

function paddleHit(ball,oldY){
    const rect={x: paddle.x,y:PADDLE_Y,w:paddle.w,h:PADDLE_H};
    if(ball.vy>0 && oldY +R<= PADDLE_Y && circleHitsRect(ball,rect)){
        ball.y = PADDLE_Y-R;
        const centerX= paddle.x+ paddle.w/2;
        const halfWidth =paddle.w/2;
        const offset =clamp((ball.x-centerX)/halfWidth,-1,1);
        const angle=offset* Math.PI/3;
        ball.vx=speed*Math.sin(angle);
        ball.vy=-speed*Math.cos(angle);
    }
}


function frame(now){
    const elapsedSeconds = (now - lastFrame) /1000;
    const dt =clamp(elapsedSeconds,0,0.033);
    lastFrame=now;
    if(state==="ready" || state==="playing"){
        let direction=0;
        if(keys.left) direction-=1;
        if(keys.right) direction +=1;
        if(direction) movePaddleTo(paddle.x+paddle.w/2+direction*470*dt);
    }
    if(state==="playing"){
        gameTime +=dt;
        if(wideUntil >0 && gameTime >= wideUntil){
            wideUntil =0;
            paddle.w=120;
            paddle.x=clamp(paddle.x,0,W - paddle.w);
        }
        updateBlocker(dt);
        updateItems(dt);
        for(const ball of balls) updateBall(ball,dt);
        for(let  i = balls.length -1; i>= 0; i--){
            if(balls[i].y -R >H){
                balls[i].el.remove();
                balls.splice(i,1);
            }
        }
        if(bricks.length===0){
            state="won";
            message(" ban da chien thang voi diem "+ score);
        } else if(balls.length===0) {
            lives-=1;
            wideUntil=0;
            paddle.w=120;
            paddle.x= clamp(paddle.x,0,W - paddle.w);
            if(lives <= 0){
                state="lost";
                message("het mang.Diem" +score);
            } else resetBall();

        }
    }
    render();
    requestAnimationFrame(frame);
}



function makeBricks(){
    bricksEl.replaceChildren();
    bricks=[];
    for (let row=0; row < ROWS.length;row++){
        for(let col=0;col< ROWS[row].length;col++){
            if (ROWS[row][col] === ".") continue;
            let hp=1;
            if(level.kind==="durable") hp=2;
            let drop = null;
            for(const item of DROPS){
                if(item.row=== row && item.col === col) drop = item.type;
            }
            const el= document.createElement("div");
            el.className="brick";
            const brick={
                x:BRICK_LEFT+col*(BRICK_W+BRICK_GAP),
                y:BRICK_TOP+row*(BRICK_H+BRICK_GAP),
                w:BRICK_W,h:BRICK_H, el,hp, drop
            };
            el.style.left=`${brick.x}px`

            el.style.top=`${brick.y}px`
            el.style.width=`${brick.w}px`
            el.style.height=`${brick.h}px`
            paintBrick(brick);
            bricksEl.append(el);
            bricks.push(brick);
        }
    }
}


function damageBrick(brick){
    brick.hp-=1;
    if (brick.hp>0){
        paintBrick(brick);
        return;
    }
    brick.el.remove();
    bricks.splice(bricks.indexOf(brick),1);
    spawnItem(brick);
    score+=10;
}

function applyItem(type){
    if( type =="wide"){
        const centerX = paddle.x+ paddle.w/2;
        paddle.w=180;
        paddle.x= clamp(centerX - paddle.w/2,0, W- paddle.w);
        wideUntil= gameTime +12;
    }
    else if (type === "triple"){
        const created=[];
        const spreadAngle = 25 * Math.PI /180;
        for (const ball of balls){
            const angle = Math.atan2(ball.vy, ball.vx);
            for( const side of [-1,1]){
                const newAngle = angle + side * spreadAngle;
                const vx = speed * Math.cos( newAngle);
                const vy=speed * Math.sin(newAngle);
                created.push(createBall(ball.x, ball.y, vx, vy));
            }
        }
        for(const ball of created) balls.push(ball);
    } else if ( type ==="life"){
        lives +=1;
    }
}

function updateItems(dt){
    for (let i = items.length -1;i>= 0;i--){
        const item = items[i];
        item.y += 150*dt;
        const overlapsX = item.x + ITEM_SIZE >= paddle.x && item.x <=paddle.x + paddle.w;

        const overlapsY = item.y + ITEM_SIZE >= PADDLE_Y && item.y <=PADDLE_Y + PADDLE_H;
        const caught= overlapsX && overlapsY;
        if(caught|| item.y > H){
            item.el.remove();
            items.splice(i,1);
            if(caught) applyItem(item.type);
        }
    }
}

function bounceFromRect(ball, rect,oldX, oldY, oldRectX= rect.x){
    const fromLeft = oldX+R <=oldRectX;
    const fromRight = oldX- R  >= oldRectX+rect.w;
    const fromTop =oldY+R  <= rect.y;

    if(fromLeft){
        ball.x=rect.x-R;
        ball.vx= -Math.abs(ball.vx);
    }
    else if(fromRight){
        ball.x=rect.x+rect.w+R;
        ball.vx= Math.abs(ball.vx);
    }
    else if(fromTop){
        ball.y= rect.y- R;
        ball.vy= -Math.abs(ball.vy);
    }
    else {
        ball.y= rect.y + rect.h + R;
        ball.vy = Math.abs(ball.vy);
    }

}

function startLevel(index){
    level=LEVELS[index];
    lives=3;
    score=0;

    speed=300;
    gameTime=0;
    wideUntil=0;
    items=[];
    itemsEl.replaceChildren();
    paddle = {x:(W-120)/2, w:120};
    blocker ={x:300,oldX:300, y:365, w:160, h:14, vx:165};
    blockerEl.style.display="none";
    if (level.kind==="blocker") blockerEl.style.display="block";
    makeBricks();
    resetBall();
    render();
}
function spawnItem(brick){
    if(!brick.drop) return;
    const el = document.createElement("div");
    el.className="item";
    el.textContent=LABELS[brick.drop];
    itemsEl.append(el);
    items.push({
        x:brick.x+ brick.w/2-ITEM_SIZE/2,
        y: brick.y+ brick.h/2, type: brick.drop, el
    });
}

function updateHud(){
    livesEl.textContent=`mang:${lives}`;

    scoreEl.textContent=`diem:${score}`;
    ballCountEl.textContent=`bong:${balls.length}`;
    levelInfoEl.textContent="";

    if(wideUntil > gameTime) levelInfoEl.textContent=" Thanh rong";
}
function updateBlocker(dt){
if(level.kind !== "blocker") return;
blocker.oldX=blocker.x;
blocker.x+= blocker.vx* dt;
if (blocker.x <0){
    blocker.x=0;
    blocker.vx =Math.abs(blocker.vx);
} else if (blocker.x + blocker.w >W){
    blocker.x= W - blocker.w;
    blocker.vx= -Math.abs(blocker.vx);
}
}

function paintBrick(brick){
    let text ="";
    if(level.kind=== "durable") text =String(brick.hp);
    if(brick.drop) text +=" " + LABELS[brick.drop];
    brick.el.textContent=text.trim();

}




startLevel(0);
requestAnimationFrame(frame);