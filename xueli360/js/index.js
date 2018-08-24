$(function(){
	$(".top").animate({top:0,opacity:1},800);
	$(".ban_txt h1").animate({fontSize:"60px",fontWeight: 'normal'},'slow');
	$(".ban_txt h3").animate({fontSize:"30px",fontWeight: 'normal'},'slow');
	//顶部导航动画效果
	$('.li').find('li').hover(function () {
		$(this).animate({marginTop:'-10px',height:'50px',width:'130px',marginRight:'-10px'});
		$(this).find('a').animate({lineHeight:'65px'});
    },function () {
		$(this).animate({height:'40px',width:'120px',marginTop:'0px',marginRight:'0px'});
		$(this).find('a').animate({lineHeight:'40px'});
    });

    // 顶部响应下拉导航
	var oo = 1;
	$(window).resize(function(){
			if($(window).width()>750){
				$('.nav-menu').slideUp();
    			oo = 1;
			}
	});
    $('.nav-n2,.nav-menu').click(function(){
    	if(oo == 1){
			$('.nav-menu').slideDown();
			oo = 0 ;
    	}else{
    		$('.nav-menu').slideUp();
    		oo = 1;
    	}
    });
    // 首页大图轮播
	// .ban 为轮播图div的class名  请用ban1.... ban3定义class
	// 	.ban_bt 为轮播图控制按钮的class名 后边跟数字命名 .ban_bt1...ban_bt3
	// .ban_tm 按钮被选中时的状态
	var num = 3; //轮播图片数量
    var ary = new Array(num);
    for (var i = 0;i < num ;i++ ){
        ary[i] = i+1;
        if(ary[i] == 1){
        	eval("var c"+ary[i]+"=2");
		}else{
        	eval("var c"+ary[i]+"=1");
        }
    }
    nextDiv(1);
    function nextDiv(a) {
        for(var i = 0;i < num;i++){
            if(ary[i] == a){                
                var vl = eval("c"+ary[i]);
                for(var b = 0;b<num;b++){
                    if(a != ary[b]){
                        eval("$('#ban_bt"+ ary[b]+"').removeClass('ban_tm')");
                        eval("$('.ban"+ary[b]+"').fadeOut('slow')");
                        eval("$('.ban_txt"+ary[b]+"').hide()");
                        eval("$('.ban_txt"+ary[b]+"').animate({left:'0',})");
                    }
                }
                eval("$('.ban"+a+"').fadeIn('slow')");
                eval("$('.ban_txt"+a+"').show()");
                eval("$('.ban_txt"+a+"').animate({opacity:'1',left:'10%'},'slow')");
                eval("$('#ban_bt"+ ary[i]+"').addClass('ban_tm')");
            }
        }
    }
    var a = 2;
    setInterval(function(){
    	nextDiv(a);
    	if(a>=num){
    		a =1;
		}else{
    		a++ ;
    	}
	},10000);
    $('.ban-c').click(function () {
        var i = $(this).attr('value');
        nextDiv(i);
    });

       //锚点滚到样式
    $('.scroll').click(function () {
        var srcId = $(this).attr('href');
        var hash =$(srcId).offset().top;
        alert(hash);
        // var hash = $('#fot').offset().top;
        $('html,body').animate({scrollTop:hash},1000);
    });

    //模块图片放大文字移动
    function txtHide(cla){
         var sa = -10;
        for(var i = 1;i<=3;i++){
           eval("cla.find('.s"+ i+"').animate({marginLeft:'"+sa+"px',opacity: 0})");
           sa = sa -5;
       }
    }
    txtHide($('.mo-pd'));
    $('.mo-pd').hover(function () {
        $(this).find('.img').animate({top:'-30px',left:'-30px',height:'115%',width:'120%'},700);
        $(this).find('.mo-bottom').animate({bottom:'-25px',opacity:'0'});
        $(this).find('.mo-o').addClass('mo-oo');
        $(this).find('.s1').show(100);
        $(this).find('.s2').show(200);
        $(this).find('.s3').show(300);
       for(var i = 1;i<=3;i++){
           eval("$(this).find('.s"+ i+"').animate({marginLeft:'40px',opacity: 1},300)");
       }
    },function () {
        $(this).find('.mo-o').removeClass('mo-oo');
        $(this).find('.s1,.s2,.s3').hide();
        $(this).find('.mo-bottom').animate({bottom:'25%',opacity:'1'});
        $(this).find('.img').animate({top:'0px',left:'0px',height:'100%',width:'100%'},700);
        txtHide($(this));
    });

    // 六大提升方案鼠标滑过样式
    function objBg(){
        // for(var s=1;s<=6;s++){
        //     $('.obj-bg'+s).css({'background':'url(images/wu00'+s+'.png)','cursor':'pointer','transition-property': 'background'});
        // }
        for(var i=1;i<=6;i++){
            var hvimg = "<img class='wu0"+i+" ' src=\"images/wu0"+i+".png\"><img class='wu00"+i+" ' src=\"images/wu00"+i+".png\">";

            $('.obj-bg'+i).append(hvimg);
            $('.wu00'+i).hide();
        }
    }
    objBg();
    $('.obj-hv').hover(function(){
        var oid = $(this).attr('id');

        $('.obj-bg'+oid).find('.wu0'+oid).hide();
        $('.obj-bg'+oid).find('.wu00'+oid).show();
        $('.obtxt0'+oid).show();
        for(var i=1;i<=6;i++){
            if(i!=oid){
                $('.obtxt0'+i).hide();
            }
        }
    },function () {
        var oid = $(this).attr('id');
         $('.obj-bg'+oid).find('.wu0'+oid).show();
        $('.obj-bg'+oid).find('.wu00'+oid).hide();
        // $('.obj-bg'+oid).css({'background':'url(images/wu0'+oid+'.png)','cursor':'pointer','transition-property': 'background'});
    });

    //倒计时代码块
        var d_d= 4; //数字代表截止时间为3天后
        function BaoMing(DayNum){
            var dd = new Date();
                dd.setDate(dd.getDate()+DayNum);
            var y = dd.getFullYear();
            var m = dd.getMonth()+1;    
            var d = dd.getDate();
            return {'y':y,'m':m,'d':d}
        }
        var da = BaoMing(d_d);
        var starttime = new Date(da.y+"/"+da.m+"/"+da.d);
        setInterval(function () {
        var nowtime = new Date();
        var time = starttime - nowtime;
        var day = parseInt(time / 1000 / 60 / 60 / 24);
        var hour = parseInt(time / 1000 / 60 / 60 % 24);
        var minute = parseInt(time / 1000 / 60 % 60);
        var seconds = parseInt(time / 1000 % 60);
        $('.d').text(day);
        $('.h').text(hour);
        $('.m').text(minute);
        $('.s').text(seconds);
      }, 1000);


    // 名校列表

    function listEdu(){
        for(var i=0;i<20;i++){
            var a = i*64
            $('.edu-li'+i).css({'background-position':'0 '+a+'px'});
            var htm = "<img src=\"images/academy-pic"+(i+1)+".jpg\" width=\"321\" height=\"237\">";
            $('.edu-iml0'+(i+1)).append(htm);
            if(i!=0){
                $('.edu-iml0'+(i+1)).css('display','none');
            }
        }
    }
    listEdu();
    $('.edu-img li').hover(function(){
        var cl = $(this).find('.edu-li').attr('l');
        $(this).find('.edu-li').css({'background-position':'-64px '+(cl*-64)+'px'});
        var ii=parseInt(cl)+1;
         $('.edu-iml0'+ii).show();
         for(var i=1;i<=20;i++){
            if(i!=ii){
                $('.edu-iml0'+i).hide();
            }
         }
    },function(){
        var cl = $(this).find('.edu-li').attr('l');
        $(this).find('.edu-li').css({'background-position':'0 '+(cl*-64)+'px'});
        
    });

    // 左侧导航控制按钮
    var lebt = 1;
    $('.lebt').click(function(){
        if(lebt==1){
            $('.frame_box').animate({left:'-122px'});
            $(this).css({'background-image':'url(images/openimg.png)'});
            lebt=2;
        }else{
            $('.frame_box').animate({left:'17px'});
            $(this).css({'background-image':'url(images/outimg.png)'});
            lebt=1;
        }
    });
	// window.onscroll = function(){
 //    var scrollTop = document.body.scrollTop;
	//     if(scrollTop >= 1){
	//     	$(".top").stop();
	//     	$(".top").animate({border-bottom: 1px solid #D2D2D2;});
 //   		 }else{
 //   		 	$(".top").stop();
	//     	$(".top").animate({border:0});
 //   		 };
	// };
});