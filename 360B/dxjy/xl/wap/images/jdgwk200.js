// $(function(){
//    var $div=$('<div class="double-twelve">' +
//        '<div class="red-packet">'+
//            '<img  onclick="NTKF_kf()" src="http://img.hengqijiaoyu.cn/html/idx_m/activity/images/xcbmyh.png" alt=""/>' +
//            '<span class="close"><img src="http://img.hengqijiaoyu.cn/html/idx_m/activity/images/close.png" alt=""/></span>'+
//            /*'<span class="open"></span>'+*/
//        '</div>'+
//    '</div>');
//    var $style=
//        $("<style>" +
//            ".double-twelve{display:none;position: fixed;left: 0;top: 0;width:100%;height:100%;background:rgba(51,51,51,0.8);z-index:1000;}" +
//            ".double-twelve img{width:100%}"+
//            ".red-packet{position: absolute;top:215px;left:0;}"+
//            "span.close{display:inline-block;width:35px;height:35px;border-radius:50%;" +
//            "background: transparent;position:absolute;top:-3%;right:8%;z-index:9999;}"+
//            /*"span.open{display:inline-block;width:80px;height:80px;border-radius:50%;"+
//            "background: transparent;position:absolute;top:51.68%;left:39.5%;z-index:1000;}"+*/
//        "<style>");
//    $('body').append($div);
//    $('head').append($style);
//
//   var timeOpen=setInterval(function (){
//        $(".double-twelve").fadeIn();
//    },1000*10);
//
//    //$('.double-twelve').animate({'display':'none'},5000,function(){
//    //    $('.double-twelve').fadeIn()
//    //});
//    function on_off() {
//        clearInterval(timeOpen);
//        $('.double-twelve').fadeOut(function(){
//            $('.double-twelve').animate({'display':'none'},1000*15,function(){
//                $('.double-twelve').fadeIn()
//            })
//        })
//    }
//    $('span.close').click(
//        function (){
//            on_off();
//        });
//    // $(".double-twelve").click(function(){
//    //     on_off();
//    // });
//
// });
