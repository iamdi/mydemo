$(function(){
	$(".auto_div_i").click(function(event) {
		event.preventDefault();
		$(".auto_div").fadeOut('300');
	});
	$('.container_xl_two_ul').find('li').hover(function() {
		$(this).addClass('cur').siblings('li').removeClass('cur');
	}, function() {
		/* Stuff to do when the mouse leaves the element */
	});
})
