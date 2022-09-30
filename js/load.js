//宽高行列
var snakeWidth=20;
var snakeHeight=20;
var tr=30;
var td=50;


//方块构造元素 创建蛇头 蛇身 食物
function Square(x, y, classname) {
    this.x=x*snakeWidth;
    this.y=y*snakeHeight;
    this.class=classname;

    this.viewContent=document.createElement("div");//每一个小方块的dom元素
    this.viewContent.className=this.class;
    this.parent=document.getElementById('snakeFather');

}

//构建方块元素和蛇的元素相匹配
//添加方块
Square.prototype.create=function(){
    this.viewContent.style.position='absolute';
    this.viewContent.style.width=snakeWidth+'px';
    this.viewContent.style.height=snakeHeight+'px';
    this.viewContent.style.left=this.x+'px';
    this.viewContent.style.top=this.y+'px';
    this.parent.appendChild(this.viewContent);

};
//删除方块
Square.prototype.remove=function(){
    this.parent.removeChild(this.viewContent);
};


//定义蛇的相关信息
function Snake(){
    this.head=null; 
    this.tail=null;
   
    this.position=[];//定义存储蛇身上每一个方块的位置

    //蛇走的方向
    this.directionNum={
        left:{
            x:-1,
            y:0,
            rotate:180  //在默认向右的前提下蛇头旋转180度使其符合前进方向上的要求
        },
        right:{
            x:1,
            y:0,
            rotate:0
            
        },
        up:{
            x:0,
            y:-1,
            rotate:-90
        },
        down:{
            x:0,
            y:1,
            rotate:90
        }
    }
}

//初始化
Snake.prototype.init=function(){
    //创建蛇头
    var snakeHead=new Square(1,0,'snakeHead');
    snakeHead.create();
    this.head=snakeHead;
    this.position.push([1,0]);//蛇头

    // //创建蛇身
    var snakeBody=new Square(0,0,'snakeBody');
    snakeBody.create();
    this.tail=snakeBody;//存入蛇尾的信息
    this.position.push([0,0]);

    //让蛇头和蛇身连接在一起
    snakeHead.last=null;
    snakeHead.next=snakeBody;

    snakeBody.last=snakeHead;
    snakeBody.next=null;

    //给蛇添加属性用来表示蛇走的方向 默认初始时蛇向右走
    this.direction=this.directionNum.right;
}


//添加一个用来获取蛇头下一个位置对应的元素 要根据元素做不同的事情
Snake.prototype.getNextPosition=function(){
    //蛇头走的下一个坐标
    var nextPosition=[                            // this.x=x*snakeWidth
        this.head.x/snakeWidth+this.direction.x,  // this.head.x/snakeWidth+this.directionNum.right.x
        this.head.y/snakeHeight+this.direction.y
    ];
    

    //下一个点是自己-->撞到了自己 死掉
    var killSelf=false;
    this.position.forEach(function(value){
       //数组中两个数据相等 说明要走的下一个点在自己身上 自杀死掉
        if(value[0]==nextPosition[0]&&value[1]==nextPosition[1]){
        killSelf=true;
        }
    });
    if(killSelf){
        console.log('自杀死掉');
        this.tactics.die.call(this);
        return;
    }


    //下一个点是墙-->死掉
    if(nextPosition[0]<0||nextPosition[1]<0||nextPosition[0]>td-3||nextPosition[1]>tr-3){
        console.log('撞墙死掉');
        this.tactics.die.call(this);
        return;
    }


    //下一个点是食物-->吃掉
    if(food&&food.position[0]==nextPosition[0]&&food.position[1]==nextPosition[1]){
        this.tactics.eat.call(this);
        return;
    }

    //下一个点是空气-->走着
    this.tactics.move.call(this);//需要在行为之后获取到蛇的所有信息，而行为中指向的是this.tactics，没有实例
                                              // 改变this指向 将this指向后边传入的那个（this）指向的是原型的实例对象

}

//处理碰撞之后的走 吃 死掉
Snake.prototype.tactics={

    //在旧蛇头的位置创建新的身体 头向前移动之后 后面的依次往前添加 然后将最后的尾巴删去
    move:function(deTail){ 
        var newBody=new Square(this.head.x/snakeWidth,this.head.y/snakeHeight,'snakeBody');


        //更新蛇头蛇身的链表关系
        newBody.next=this.head.next;
        newBody.next.last=newBody;
        newBody.last=null;


        //在旧位置删去旧的蛇头 添加上新创建的身体
        this.head.remove();
        newBody.create();

        //头向前移动(创建出新的蛇头在nextPosition) 
        var newHead=new Square(this.head.x/snakeWidth+this.direction.x,this.head.y/snakeHeight+this.direction.y,'snakeHead')

        //更新蛇头蛇身的链表关系
        newHead.next=newBody;
        newHead.last=null;
        newBody.last=newHead;

        newHead.viewContent.style.transform='rotate('+this.direction.rotate+'deg)';                                     //这里没太明白

        newHead.create();

        //在行动之后 ，其他所有的方块也要进行相应的更新，更新坐标位置
        this.position.splice(0,0,[this.head.x/snakeWidth+this.direction.x,this.head.y/snakeHeight+this.direction.y]);
        this.head=newHead;

        //deTail为false，进行删除 就是除了吃之外的其他任何操作
        if(!deTail){
            this.tail.remove();
            this.tail=this.tail.last;

            this.position.pop();
        }

        
    },
    eat:function(){
        this.tactics.move.call(this,true);
        createFood();
        game.score++;


    },
    die:function(){
        game.over();
    }
}

var snake=new Snake();

// snake.getNextPosition();

//创建食物 
var food=null;
function createFood(){
    //食物不能出现在墙上和蛇的身上
    var include=true;
    //确保食物不能出现在蛇身上 出现在蛇身上 进入循环 false表示食物坐标不在蛇身上 则不再进行循环
    while(include){
        //食物的随机坐标
        var x=Math.round(Math.random()*(td-3));
        var y=Math.round(Math.random()*(tr-3));

        var count=0;
        snake.position.forEach(function(value){
            if (x!=value[0]&&y!=value[1]) {
                count++;
            }
            if(count==snake.position.length){
                include=false;
            }
        });
    }

    //生成食物 
    food =new Square(x,y,'food');
    food.position=[x,y]; //保存食物在这里生成的坐标 来跟蛇头走的下一个点进行比较
    
    var foodEat=document.querySelector('.food');
    if(foodEat){
        // foodEat.addEventListener('click', function(){});
        foodEat.style.left=x*snakeWidth+'px';
        foodEat.style.top=y*snakeHeight+'px';
    }else{
        food.create();
    }

}


//生成游戏思路

var game=null;
function Game(){
    this.timer=null;
    this.score=0;
}

//对蛇的行为进行初始化和合理的规范
Game.prototype.init = function(){
    snake.init();
    createFood();
    //键盘监听控制
    document.onkeydown=function(e){
        //37为左键的ASCII码值 38-上 39-右 40-下  向右的时候不能掉头向左 其他方向同理
        if(e.which==37 && snake.direction!=snake.directionNum.right){  
            snake.direction=snake.directionNum.left;
        }
        else if(e.which==38 && snake.direction!=snake.directionNum.down){
            snake.direction=snake.directionNum.up;
        }
        else if(e.which==39 && snake.direction!=snake.directionNum.left){
            snake.direction=snake.directionNum.right;
        }
        else if(e.which==40 && snake.direction!=snake.directionNum.up){
            snake.direction=snake.directionNum.down;
        }
    }

    this.start();
}


//开始游戏（开启计时器）
Game.prototype.start=function(){
    this.timer=setInterval(function(){
        snake.getNextPosition();
    },150);
};


//清除计时器
Game.prototype.pause=function(){
    clearInterval(this.timer);
}




//结束游戏
Game.prototype.over=function(){
    clearInterval(this.timer);
    var scoreShow=document.querySelector('.scoreShow');
    scoreShow=this.score;
   alert('分数：'+scoreShow);                         //分数无法显示在scoreShow的位置上

};

game=new Game();
game.init();