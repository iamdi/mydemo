$(function(){

	    //表单提交
    $('.sub').click(function () {
            var fm = $(this).attr('nm');
            var fo = $('#form'+fm).serialize();
            $.ajax({
                url: 'http://brobj.xueshawang.com/brbm/addstu/',
                type: 'post',
                dataType: 'json',
                data: fo,
                success: function (data) {
                    if (data.code == 200) {
                        $('input[type="text"]').val('');
                        alert(data.status);
                    }else{
                        if (data.status.bm_name){alert(data.status.bm_name);}
                        if (data.status.bm_tell){alert(data.status.bm_tell);}    
                    } 
                }
            });
        });
       //锚点滚到样式
    $('.scroll').click(function () {
        var srcId = $(this).attr('href');
        var hash =$(srcId).offset().top+500;

        // var hash = $('#fot').offset().top;
        $('html,body').animate({scrollTop:hash},1000);
    }); 

        //弹出表单
    $('.m-close').click(function(){
        $('.meng').addClass('hide');
    });
    $('.m-open').click(function(){
        $('.meng').removeClass('hide');
    }); 
});