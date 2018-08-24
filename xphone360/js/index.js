$(function(){

	   //锚点滚到样式
    $('.scroll').click(function () {
        var srcId = $(this).attr('href');
        var hash =$(srcId).offset().top;
        // var hash = $('#fot').offset().top;
        $('html,body').animate({scrollTop:hash},1000);
    });
})