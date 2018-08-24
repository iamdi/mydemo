// {/* <script> */}
    window.onload = function(){
    // when window onload
    showFakeAlert(60000);
    //	-------
        
    //	————————————————————————
    }
    $.fn.extend({
        animateCss: function (animationName) {
            var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
            this.addClass('animated ' + animationName).one(animationEnd, function() {
                $(this).removeClass('animated ' + animationName);
            });
        }
    });

    $(function(){
        $(".banner__wrap").on("beforeChange",function(event, slick, currentSlide, nextSlide){
            if(currentSlide == 0){
                $('.banner__item2_btns').animateCss("bounceInUp");
            }
            if(currentSlide == 1){
                $('.banner__item1_h1').animateCss("bounceIn");
                $('.banner__item1_h2').animateCss("bounceInLeft");
                $('.banner__item1_h3').animateCss("bounceInRight");
            }
            
        })
        $('.banner__wrap').slick({
            accessibility: false,
            dots: true,
            infinite: true,
            speed: 500,
            autoplaySpeed: 5000,
            fade: true,
            slide: 'div',
            cssEase: 'linear',
            autoplay:true,
            waitForAnimate:true,
            swipe: false,
            arrows: false
        });
    })
    function showFakeAlert(time){
        var time1 = setTimeout(function(){
            $('.aFakeAlert').css({
                'animation':'showFakeAlert 2s',
                'bottom':'0'
            })		
        },time)
    }
    $(function(){
        
        $('#aFakeAlert__btn_close').click(function(){
            $(this).parents('.aFakeAlert').css({
                'animation': 'hideFakeAlert 1.4s', 
                'bottom': '-225px',
            })
            showFakeAlert(60000);
        })
        $('#aFakeAlert__btn_footer--never').click(function(){
            $(this).parents('.aFakeAlert').css({
                'animation': 'hideFakeAlert 1.4s', 
                'display':'none',
            })
        })
        $('.download__btn--right').click(function(){
            $('.inputYourPhoneNum').css({
                'display':'block',
            })
        })
        $('.inputYourPhoneNum__btn_close').click(function(){
            $('.inputYourPhoneNum').css({
                'display':'none',
            })
        })
        
        $('.downAlert__btn_close,.downAlert__text_btns--close').click(function(){
            $('.downAlert').css({
                'display':'none'
            })
        })
    })
    $(function(){
        var tip1=new tip();
        $('.inputYourPhoneNum__btn_submit').on('click',function(){
            var phone = $('#getPhoneNum').val().trim();
            if(!phone){
                tip1.showTip({
                    bottomVal:'40%',
                    time: 2000,
                    msg: '请填写手机号'
                });
                return false;
            }
            if(!checkPhone(phone)){
                tip1.showTip({
                    bottomVal:'40%',
                    time: 2000,
                    msg: '手机号码有误，请重写'
                });
                return false;
            }
            //这里去存手机号，并提示成功
            $.getJSON("http://zd.wangxiao.cn/service/collectusers.aspx?ajax=submit&txtMobile="+phone+"&Type=12&sign=jjs&callback=?", function (result) {
                tip1.showTip({
                    bottomVal:'40%',
                    time: 2000,
                    msg: result
                });
            });
            
            //存完手机号，清空
            $('#getPhoneNum').val('');
            
            $('.downAlert').css({
                'display':'block'
            })
            $('.inputYourPhoneNum').css({
                'display':'none',
            })
        });
    })
    function checkPhone(phone){ 
        if(!(/^1[34578]\d{9}$/.test(phone))){ 		
            return false; 
        }else{
            return true;
        }
    }

    function tip() {
        this.timer=null;
    }
    tip.prototype.showTip = function(options) {
        var defaults={
            bottomVal:'20%',
            msg:'请填写提示信息',
            time:2000
        }
        if(options){
            if(options.bottomVal){
                defaults.bottomVal=options.bottomVal;
            }
            if(options.msg){
                defaults.msg=options.msg;
            }
            if(options.time){
                defaults.time=options.time;
            }
        }
        //清除之前的提示和计时器
        if(document.getElementById('tip')) {
            document.getElementById('tip').remove();
            clearTimeout(this.timer);
        }
        //创建div
        var div = document.createElement('div');
        div.id = 'tip';
        var style1 = {
            position: 'fixed',
            bottom: defaults.bottomVal,
            backgroundColor: 'rgba(0,0,0,.3)',
            padding: '3px 5px',
            color: '#fff',
            borderRadius: '5px',
            left: '50%',
            transform: 'translate(-50%)',
            fontSize:'14px',
            zIndex: 20,
        };
        for(i in style1) {
            div.style[i] = style1[i];
        }
        div.innerHTML = defaults.msg;
        //加到body中
        document.body.appendChild(div);
        //添加计时器来控制提示的消失
        this.timer = setTimeout(function() {
            document.getElementById('tip').remove();
        }, defaults.time);
    }
    //---------------------------
    
// </script>