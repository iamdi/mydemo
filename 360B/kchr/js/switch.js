$(function(){
	$(".mainBg3 a,.u_1 a,.serviceBox a,.shiting a,.fContent a,.section_02 a").removeAttr("onClick").addClass("tencentClassLive");
});
$(function(){
 	var years,months,days;
	var intYears,intMonths,intDays;
	var today;
	today = new Date();  //系统当前时间
	intMonths = today.getMonth() + 1;  //得到月份，要加1
	intDays = today.getDate();   //得到日期
	hour=today.getHours();
	minute=today.getMinutes();
	years = intYears + "-";
	if(intMonths < 10 ){
	months = "0" + intMonths +" ";
	} else {
	months = intMonths +" ";
	}
	if(intDays < 10 ){
	days = "0" + intDays +" ";
	} else {
	days = intDays + " ";
	}
	
	
	var num=hour+minute/60     
	//获取小时与分钟之和
	
	
	
	$(function(){
		if (num>=10&&num<15.25){
			$("#video1").css('display','block');
			$("#video5").css('display','none');
		}
		if(num>=11.5&&num<12.5){
			$("#video2").css('display','block');
			$("#video6").css('display','none');
		}
		if(num>=14.5&&num<15.5){
			$("#video3").css('display','block');
			$("#video7").css('display','none');
		}
		if(num>=16.5&&num<17.5){
			$("#video4").css('display','block');
			$("#video8").css('display','none');
		}
	})
	
	$(function(){
		if (num>=10&&num<15.25){
			$("#rightVideo1").css('display','block');
			$("#rightVideo5").css('display','none');
		}
		if(num>=11.5&&num<12.5){
			$("#rightVideo2").css('display','block');
			$("#rightVideo6").css('display','none');
		}
		if(num>=14.5&&num<15.5){
			$("#rightVideo3").css('display','block');
			$("#rightVideo7").css('display','none');
		}
		if(num>=16.5&&num<17.5){
			$("#rightVideo4").css('display','block');
			$("#rightVideo8").css('display','none');
		}
	})
	
	$(function(){
		if (num>=13.5&&num<14.5){
			$("#liveVideo1").css('display','block');
			$("#liveVideo5").css('display','none');
		}
		if(num>=16&&num<17){
			$("#liveVideo2").css('display','block');
			$("#liveVideo6").css('display','none');
		}
		if(num>=20&&num<21){
			$("#liveVideo3").css('display','block');
			$("#liveVideo7").css('display','none');
		}
		if(num>=20&&num<21){
			$("#liveVideo4").css('display','block');
			$("#liveVideo8").css('display','none');
		}
	})
	
	$(function(){
		if (num>=13.5&&num<14.5){
			$("#liveV1").css('display','block');
			$("#liveV5").css('display','none');
		}
		if(num>=16&&num<17){
			$("#liveV2").css('display','block');
			$("#liveV6").css('display','none');
		}
		if(num>=20&&num<21){
			$("#liveV3").css('display','block');
			$("#liveV7").css('display','none');
		}
		if(num>=20&&num<21){
			$("#liveV4").css('display','block');
			$("#liveV8").css('display','none');
		}
	})
	
	
	
	//链接随时间变化
	$(function(){
		$(".tencentClassLive").click(function(){
	//		if(num>=10&&num<11){
	//			window.open("http://ke.qq.com/cgi-bin/courseDetail?course_id=109499&open_room=1&term_id=100116817&from=41");
	//		}else if(num>=14.5&&num<15.5){
	//			window.open("http://ke.qq.com/cgi-bin/courseDetail?course_id=109499&open_room=1&term_id=100116817&from=41");
	//		}else{
				qq_url();
	//		}	
		});
	});
	
 });