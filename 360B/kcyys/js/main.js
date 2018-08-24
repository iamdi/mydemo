// JavaScript Document
function chimg(t,na)
{
	t.src="images/"+na+".jpg";
}

function chimg2(t,na)
{
	document.getElementById(t).src="images/"+na+".jpg";
}



//选项卡
$(function () {
    $("#lockNav img").click(function () {//tt是切换标签的class
        var index = $("#lockNav img").index($(this));
        //$(".classTab").hide();//tab是切换的内容div
        //$(".classTab:eq("+index+")").show();
		
		
		var $img = $("img:eq("+index+")", "#lockNav");
        $("img", "#lockNav").each(function () { 
            $(this).attr("src", "images/" + $(this).attr("lang") + ".png");
        });
        $img.attr("src", "images/" + $img.attr("lang") + "1.png");

    });
});












//为什么要学习软件测试？（切换）
$(function () {
	function hover(obj) {
		var img = obj.attr("himg");
		var oldobj = $("#picbar .on");
		var oldimg = oldobj.attr("himg");
		if (oldimg != img) {
			oldobj.removeClass("on");
			oldobj.attr("src", "images/" + oldimg + ".gif");
			obj.addClass("on");
			obj.attr("src", "images/" + img + "1.gif");
			//$("#bigpic").attr("src", "images/" + img + "Img.jpg")
			$("#" + img + "Div").fadeIn(200);

			$("#" + oldimg + "Div").fadeOut(200);
		}
	}
	var B;
	var curr = 0;
	function autopic() {
		B = setInterval(function () {
			curr++;
			if (curr >= $("#picbar img").length)
				curr = 0;
			hover($("#picbar img").eq(curr))
		}, 1000000);
	}
	$("#picbar img").hover(function () {
		clearInterval(B);
		hover($(this));
	}, function () {
		autopic();
	});
	autopic();
});









//学软件测试为什么一定要选达内！（切换）
$(function () {
	function hover(obj) {
		var img = obj.attr("himg2");
		var oldobj = $("#picbar2 .on2");
		var oldimg = oldobj.attr("himg2");
		if (oldimg != img) {
			oldobj.removeClass("on2");
			oldobj.attr("src", "images/" + oldimg + ".gif");
			obj.addClass("on2");
			obj.attr("src", "images/" + img + "1.gif");
			//$("#bigpic").attr("src", "images/" + img + "Img.jpg")
			$("#" + img + "Div").fadeIn(200);

			$("#" + oldimg + "Div").fadeOut(200);
		}
	}
	var B;
	var curr = 0;
	function autopic() {
		B = setInterval(function () {
			curr++;
			if (curr >= $("#picbar2 img").length)
				curr = 0;
			hover($("#picbar2 img").eq(curr))
		}, 1000000);
	}
	$("#picbar2 img").hover(function () {
		clearInterval(B);
		hover($(this));
	}, function () {
		autopic();
	});
	autopic();
});





//合作企业（切换）
$(function () {
	function hover(obj) {
		var img = obj.attr("himg3");
		var oldobj = $("#picbar3 .on3");
		var oldimg = oldobj.attr("himg3");
		if (oldimg != img) {
			oldobj.removeClass("on3");
			oldobj.attr("src", "images/" + oldimg + ".gif");
			obj.addClass("on3");
			obj.attr("src", "images/" + img + "1.gif");
			//$("#bigpic").attr("src", "images/" + img + "Img.jpg")
			$("#" + img + "Div").fadeIn(200);

			$("#" + oldimg + "Div").fadeOut(200);
		}
	}
	var B;
	var curr = 0;
	function autopic() {
		B = setInterval(function () {
			curr++;
			if (curr >= $("#picbar3 img").length)
				curr = 0;
			hover($("#picbar3 img").eq(curr))
		}, 1000000);
	}
	$("#picbar3 img").hover(function () {
		clearInterval(B);
		hover($(this));
	}, function () {
		autopic();
	});
	autopic();
});





