
/* 滚动效果
 函数startmarquee的参数：
 lh：文字一次向上滚动的距离或高度； (样式高度也要修改)（可配置样式高度和这里一样来显示一次滚动几条）
 speed：滚动速度；
 delay：滚动停顿的时间间隔；
 index：可以使封装后的函数应用于页面当中不同的元素；
 */
$(function(){
    function startmarquee(lh, speed, delay, index) {
        var t;
        var p = false; //p是true还是false直接影响到下面start()函数的执行
        //获取文档中的滚动区域对象 (DIV)
        var o = document.getElementById("marqueebox" + index);
        o.innerHTML += o.innerHTML; //对象中的实际内容被复制了一份，复制的目的在于给文字不间断向上滚动提供过渡。
        //鼠标滑过，停止滚动；
        o.onmouseover = function() { p = true; }
        //鼠标离开，开始滚动；
        o.onmouseout = function() { p = false; }
        //文字内容顶端与滚动区域顶端的距离，初始值为0；
        o.scrollTop = 0;
        function start() {
            t = setInterval(scrolling, speed); //每隔一段时间，setInterval便会执行一次
            //滚动停止或开始，取决于p传来的布尔值；
            if (!p) {
                o.scrollTop += 1;
            }
        }
        function scrolling() {
            //如果不被整除，即一次上移的高度达不到lh，则内容会继续往上滚动；
            if (o.scrollTop % lh != 0) {
                o.scrollTop += 1;
                //对象o中的内容之前被复制了一次，所以它的滚动高度，其实是原来内容的两倍高度；
                //当内容向上滚动到scrollHeight/2的高度时，全部3行文字已经显示了一遍，至此整块内容
                //scrollTop归0；再等待下一轮的滚动，从而达到文字不间断向上滚动的效果；
                if (o.scrollTop >= o.scrollHeight / 2)
                    o.scrollTop = 0;
            } else {
                //否则清除t，暂停滚动
                clearInterval(t);
                //经过delay间隔后，启动start() 再连续滚动
                setTimeout(start, delay);
            }
        }
        //第一次启动滚动；setTimeout会在一定的时间后执行函数start()，且只执行一次
        setTimeout(start, delay);
    }
    /*头部滚动*/
//带停顿效果
    startmarquee(40, 25, 1500, 0);
//不间断连续
//startmarquee(25,40,0,1);
})

/*距离结束时间*/
$(function(){
    function GetRTime(){
        var myDate = new Date();//开始时间
        myDate.setDate(myDate.getDate()+1);//获取AddDayCount天后的日期
        var mon=myDate.getMonth()+1;
        var day=myDate.getDate();
        document.getElementById("mon").innerHTML = mon + "";
        document.getElementById("day").innerHTML = day + "";
    }
    setInterval(GetRTime,0);
})
/*弹窗*/
$(function(){
    /*倒计时40d*/
    function countDown(){
        var waitTime=40;
        var span=$(".timespan");
        var countdown=setInterval(function(){
            waitTime-=1;
            if(waitTime<=0){
                waitTime=0;
                clearInterval(countdown);
            }
            console.log(1);
            span.html(waitTime);
        },1000);
    }
    //countDown();
    /*打开页面后5s弹出弹窗，关闭弹窗后10s弹出弹窗*/
    $('.popup').animate({'display':'none'},1000*15,function(){
        $('.popup').fadeIn(function(){
            countDown();
        });
    })
    $('.close').click(
        function(event) {
            $('.popup').fadeOut(function(){
                $('.popup').animate({'display':'none'},1000*20,function(){
                    $('.popup').fadeIn()
                })
            })
        });
});


