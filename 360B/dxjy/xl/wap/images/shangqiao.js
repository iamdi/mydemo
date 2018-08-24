// JavaScript Document$(function(){  
//点击按钮时判断 百度商桥代码中的“我要咨询”按钮的元素是否存在，存在的话就执行一次点击事件  
    $(".shangqiao").click(function(event) {  
            if ($('#nb_invite_ok').length > 0) {  
                $('#nb_invite_ok').click();  
            }  
    });  
}); 