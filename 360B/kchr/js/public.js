// JavaScript Document




$(window).resize(function(){ 
    $("#leftFloat").css({ 
        position: "fixed", 
        top: ($(window).height() - $("#leftFloat").outerHeight())/2 
    });        
    $(".cyouce").css({
    	position: "fixed", 
        top: ($(window).height() - $(".cyouce").outerHeight())/2 
    }); 
}); 

$(function(){ 
    $(window).resize(); 
}); 