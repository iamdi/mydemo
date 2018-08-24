/*首页banner广告效果*/
$(function(){
     var len  = $(".numbtn > li").length;
	 var index = 0;
	 var adTimer;
/*	 $(".numbtn li").mouseover(function(){
		index  =   $(".numbtn li").index(this);
		showImg(index);
		
	 }).eq(0).mouseover();	*/
	 
	 	 $(".numbtn li").hover(function(){
		clearInterval(adTimer);	
		index  =   $(".numbtn li").index(this);
		showImg(index);
        },function(){
						 adTimer = setInterval(function(){
			    showImg(index)
				index++;
				if(index==len){index=0;}
			  } , 3000);
			
		 }).eq(0).mouseover();
		
	 //滑入 停止动画，滑出开始动画.
	 $('.slider').hover(function(){
			 clearInterval(adTimer);
		 },function(){
			 adTimer = setInterval(function(){
			    showImg(index)
				index++;
				if(index==len){index=0;}
			  } , 3000);
	 }).trigger("mouseleave");
})
// 通过控制top ，来显示不同的幻灯片
function showImg(index){
        var adHeight = $(".slider").height();
		$(".slider").stop(true,false).animate({top : -adHeight*index},600);
		$(".numbtn li").removeClass("on")
			.eq(index).addClass("on");
}


/*刷新代码*/

function addFavorite2() {
    var url = window.location;
    var title = document.title;
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("360se") > -1) {
        alert("由于360浏览器功能限制，请按 Ctrl+D 手动收藏！");
    }
    else if (ua.indexOf("msie 8") > -1) {
        window.external.AddToFavoritesBar(url, title); //IE8
    }
    else if (document.all) {
  try{
   window.external.addFavorite(url, title);
  }catch(e){
   alert('您的浏览器不支持,请按 Ctrl+D 手动收藏!');
  }
    }
    else if (window.sidebar) {
        window.sidebar.addPanel(title, url, "");
    }
    else {
  alert('您的浏览器不支持,请按 Ctrl+D 手动收藏!');
    }
}

/*企业之声滚动*/
$(function(){
        var $this = $(".scrollNews");
		var scrollTimer;
		$this.hover(function(){
			  clearInterval(scrollTimer);
		 },function(){
		   scrollTimer = setInterval(function(){
						 scrollNews( $this );
					}, 10000 );
		}).trigger("mouseleave");
});
function scrollNews(obj){
   var $self = obj.find("ul:first"); 
   var lineHeight = $self.find("li:first").height(); //获取行高
   $self.animate({ "marginTop" : -lineHeight +"px" }, 600 , function(){
         $self.css({marginTop:0}).find("li:first").appendTo($self); //appendTo能直接移动元素
   })
}


/*就业喜报*/
function addEventSimple(obj,evt,fn){
	if(obj.addEventListener){
		obj.addEventListener(evt,fn,false);
	}else if(obj.attachEvent){
		obj.attachEvent('on'+evt,fn);
	}
}

addEventSimple(window,'load',initScrolling);

var scrollingBox;
var scrollingInterval;
var reachedBottom=false;
var bottom;

function initScrolling(){
	scrollingBox = document.getElementById('xst');
	scrollingBox.style.overflow = "hidden";
	scrollingInterval = setInterval("scrolling()",50);
	scrollingBox.onmouseover = over;
	scrollingBox.onmouseout = out; 
}



function scrolling(){
	var origin = scrollingBox.scrollTop++;
	if(origin == scrollingBox.scrollTop){
		if(!reachedBottom){
			scrollingBox.innerHTML+=scrollingBox.innerHTML;
			reachedBottom=true;
			bottom=origin;
		}else{
			scrollingBox.scrollTop=bottom;
		}
	}
}

function over(){
	clearInterval(scrollingInterval);
}
function out(){
	scrollingInterval = setInterval("scrolling()",50);
}






/*专家师资Tab 选项卡 标签*/
$(function(){
	    var $div_li =$(".tab_menu ul li");
	    $div_li.hover(function(){
			$(this).addClass("selected")            //当前<li>元素高亮
				   .siblings().removeClass("selected");  //去掉其他同辈<li>元素的高亮
            var index =  $div_li.index(this);  // 获取当前点击的<li>元素 在 全部li元素中的索引。
			$("div.tab_box .sy_js")   	//选取子节点。不选取子节点的话，会引起错误。如果里面还有div 
					.eq(index).show()   //显示 <li>元素对应的<div>元素
					.siblings().hide(); //隐藏其他几个同辈的<div>元素
		}).hover(function(){
			$(this).addClass("hover");
		},function(){
			$(this).removeClass("hover");
		})
})

/*合作企业、友情链接*/
$(function(){
	    var $div_li2 =$(".tab_menu2 ul li");
	    $div_li2.hover(function(){
			$(this).addClass("selected2")            //当前<li>元素高亮
				   .siblings().removeClass("selected2");  //去掉其他同辈<li>元素的高亮
            var index =  $div_li2.index(this);  // 获取当前点击的<li>元素 在 全部li元素中的索引。
			$("div.tab_box2 .tabboximg")   	//选取子节点。不选取子节点的话，会引起错误。如果里面还有div 
					.eq(index).show()   //显示 <li>元素对应的<div>元素
					.siblings().hide(); //隐藏其他几个同辈的<div>元素
		}).hover(function(){
			$(this).addClass("hover");
		},function(){
			$(this).removeClass("hover");
		})
})


/*学员生活*/

function SlideShow(c) {
    var a = document.getElementById("slideContainer"), f = document.getElementById("slidesImgs").getElementsByTagName("li"), h = document.getElementById("slideBar"), n = h.getElementsByTagName("li"), d = f.length, c = c || 3000, e = lastI = 0, j, m;
    function b() {
        m = setInterval(function () {
            e = e + 1 >= d ? e + 1 - d : e + 1;
            g()
        }, c)
    }
    function k() {
        clearInterval(m)
    }
    function g() {
        f[lastI].style.display = "none";
        n[lastI].className = "";
        f[e].style.display = "block";
        n[e].className = "on";
        lastI = e
    }
    f[e].style.display = "block";
    a.onmouseover = k;
    a.onmouseout = b;
    h.onmouseover = function (i) {
        j = i ? i.target : window.event.srcElement;
        if (j.nodeName === "LI") {
            e = parseInt(j.innerHTML, 10) - 1;
            g()
        }
    };
    b()
}
;

/*就业明星*/

// JavaScript Document
$(function(){
    //@Mr.Think***变量
    var $cur = 1;//初始化显示的版面
    var $i = 5;//每版显示数
    var $len = $('.showbox>ul>li').length;//计算列表总长度(个数)
    var $pages = Math.ceil($len / $i);//计算展示版面数量
    var $w = $('.ibox').width();//取得展示区外围宽度
    var $showbox = $('.showbox');
    var $num = $('span.num li')
    var $pre = $('span.pre')
    var $next = $('span.next');
    var $autoFun;
    //@Mr.Think***调用自动滚动
    autoSlide();
    //@Mr.Think***向前滚动
    $pre.click(function(){
        if (!$showbox.is(':animated')) {  //判断展示区是否动画
            if ($cur == 1) {   //在第一个版面时,再向前滚动到最后一个版面
                $showbox.animate({
                    left: '-=' + $w * ($pages - 1)
                }, 500); //改变left值,切换显示版面,500(ms)为滚动时间,下同
                $cur = $pages; //初始化版面为最后一个版面
            }
            else {
                $showbox.animate({
                    left: '+=' + $w
                }, 500); //改变left值,切换显示版面
                $cur--; //版面累减
            }
            $num.eq($cur - 1).addClass('numcur').siblings().removeClass('numcur'); //为对应的版面数字加上高亮样式,并移除同级元素的高亮样式
        }
    });
    //@Mr.Think***向后滚动
    $next.click(function(){
        if (!$showbox.is(':animated')) { //判断展示区是否动画
            if ($cur == $pages) {  //在最后一个版面时,再向后滚动到第一个版面
                $showbox.animate({
                    left: 0
                }, 500); //改变left值,切换显示版面,500(ms)为滚动时间,下同
                $cur = 1; //初始化版面为第一个版面
            }
            else {
                $showbox.animate({
                    left: '-=' + $w
                }, 500);//改变left值,切换显示版面
                $cur++; //版面数累加
            }
            $num.eq($cur - 1).addClass('numcur').siblings().removeClass('numcur'); //为对应的版面数字加上高亮样式,并移除同级元素的高亮样式
        }
    });
    //@Mr.Think***数字点击事件
    $num.click(function(){
        if (!$showbox.is(':animated')) { //判断展示区是否动画
            var $index = $num.index(this); //索引出当前点击在列表中的位置值
            $showbox.animate({
                left: '-' + ($w * $index)
            }, 500); //改变left值,切换显示版面,500(ms)为滚动时间
            $cur = $index + 1; //初始化版面值,这一句可避免当滚动到第三版时,点击向后按钮,出面空白版.index()取值是从0开始的,故加1
            $(this).addClass('numcur').siblings().removeClass('numcur'); //为当前点击加上高亮样式,并移除同级元素的高亮样式
        }
    });
    //@Mr.Think***停止滚动
    clearFun($showbox);
    clearFun($pre);
    clearFun($next);
    clearFun($num);
    //@Mr.Think***事件划入时停止自动滚动
    function clearFun(elem){
        elem.hover(function(){
            clearAuto();
        }, function(){
            autoSlide();
        });
    }
    //@Mr.Think***自动滚动
    function autoSlide(){
        $next.trigger('click');
        $autoFun = setTimeout(autoSlide, 5000);//此处不可使用setInterval,setInterval是重复执行传入函数,这会引起第二次划入时停止失效
    }
    //@Mr.Think***清除自动滚动
    function clearAuto(){
        clearTimeout($autoFun);
    }
});
