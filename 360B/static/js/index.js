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
                        $('#ban_bt'+ ary[b]).removeClass('ban_tm');
                        $('.ban'+ary[b]).hide();
                        $('.ban_txt'+ary[b]).hide();
                        $('.ban_txt'+ary[b]).animate({left:'0'});
                        $('.im'+ary[b]).hide();
                        $('.im'+ary[b]).animate({right:'0'})
                    }
                }
                $('.ban'+a).show();
                $('.ban_txt'+a).show();
                $('.ban_txt'+a).animate({opacity:'1',left:'10%'},'slow')
                $('.im'+a).show();
                $('.im'+a).animate({right:'10%'});
                $('#ban_bt'+ ary[i]).addClass('ban_tm')
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
        var hash = $(srcId).offset().top-100;
        $('html,body').animate({scrollTop:hash},1000);
    });

    $('.r_phone').mouseover(function(){
            $('.phone').css('display','');
        });
    $('.r_phone').mouseout(function(){
        $('.phone').css('display','none');
    });
    $('.r_qq').mouseover(function(){
        $('.qq').css('display','');
    });
    $('.r_qq').mouseout(function(){
        $('.qq').css('display','none');
    });
    $('.r_wx').mouseover(function(){
        $('.wx').css('display','');
    });
    $('.r_wx').mouseout(function(){
        $('.wx').css('display','none');
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