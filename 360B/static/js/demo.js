$(function () {
    var num = 3;
    var ary = new Array(num);
    for (var i = 0;i < num ;i++ ){
        ary[i] = i+1;
        var s = "$('.demo').append(ary[i])";
        eval(s);
    }
    var a = 1;
    var c1 =2;
    var c2 =1;
    var c3 =1;
    $('.ban1').show();
    function nextDiv() {
        for(var i = 0;i < num;i++){
            if(ary[i] == a){
                var ee = "$('.ban_bt"+ a +"').addClass(ban_tm)";
                var vl ="c"+ary[i];
                eval(ee);
                eval(vl);
                for(var b = 0;b<num;b++){
                    if(a != ary[b]){
                        var ee = "$('.ban_bt"+ ary[b]+"').removeClass(ban_tm)";
                    }
                }
                if(eval(vl) == 2){
                    for(var s = 0 ;s < num;s++){
                        if(ary[s] != ary[i]){
                            var ban = "$('.ban"+ary[s]+"').slideUp('slow')";
                            // var bat = "$('.ban_txt"+ary[s]+"').hide()";
                            eval(ban);eval(bat);
                            eval('c'+ary[s]+"=1");
                        }else{
                            eval("$('.ban"+ary[s]+"').slideDown('slow')");
                        }
                    }
                }
            }

        }
    }
});


 var a = 2;
    var ca = 2;
    var cb = 1;
    var cc = 1;
    $('.ban1').show();
    function nextDiv(){
    	if (a == 1) {
    		$('.ban_bt1').addClass('ban_tm');
    		$('.ban_bt2,.ban_bt3').removeClass('ban_tm');
    		if(ca == 2){
				$('.ban2,.ban3').slideUp('slow');
				$('.ban_txt2,.ban_txt3').hide();
    			$('.ban_txt1').fadeIn('slow');
    			cb = 1;cc = 1;
			}else{
    			$('.ban_txt2,.ban_txt3').hide();
				$('.ban1').slideDown('slow');
				$('.ban_txt1').fadeIn('slow');
				ca = 2;
			}
    	}else if( a == 2){
    		$('.ban_bt2').addClass('ban_tm');
    		$('.ban_bt1,.ban_bt3').removeClass('ban_tm');
    		if(cb == 2){
				$('.ban1,.ban3').slideUp('slow');
				$('.ban_txt1,.ban_txt3').hide();
    			$('.ban_txt2').fadeIn('slow');
    			ca = 1;cc = 1;
			}else{
    			$('.ban_txt1,.ban_txt3').hide();
				$('.ban2').slideDown('slow');
				$('.ban_txt2').fadeIn('slow');
				cb = 2;
			}
    	}else if( a == 3){
    		$('.ban_bt3').addClass('ban_tm');
    		$('.ban_bt2,.ban_bt1').removeClass('ban_tm');
    		if(cc == 2){
				$('.ban2,.ban1').slideUp('slow');
				$('.ban_txt1,.ban_txt2').hide();
    			$('.ban_txt3').fadeIn('slow');
    			cb = 1;ca = 1;
			}else{
    			$('.ban_txt1,.ban_txt2').hide();
				$('.ban3').slideDown('slow');
				$('.ban_txt3').fadeIn('slow');
				cc = 2;
			}
    		a = 0;
    	}
    }