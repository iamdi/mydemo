function _makeUID() {
	var s = [];
	var hexDigits = "0123456789ABCDEF";
	for ( var i = 0; i < 32; i++) {
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	// bits 12-15 of the time_hi_and_version field to 0010
	s[12] = "4";
	// bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);

	var uuid = s.join("");
	return uuid;
}
var _vds = _vds || [];
window._vds = _vds;
(function(){
	accountId='9de550852858bc45'
	var logtime = new Date().getTime();
	window.join_key=_makeUID()+"_"+logtime;

	_vds.push(['setAccountId', accountId]);
	_vds.push(['setCS1', 'join_key', window.join_key]);
	(function() {
		var vds = document.createElement('script');
		vds.type='text/javascript';
		vds.async = true;
		vds.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'dn-growing.qbox.me/vds.js';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(vds, s);

	})();
})();

(function () {
  var ie = !!(window.attachEvent && !window.opera);
  var wk = /webkit\/(\d+)/i.test(navigator.userAgent) && (RegExp.$1 < 525);
  var fn = [];
  var run = function () { for (var i = 0; i < fn.length; i++) fn[i](); };
  var d = document;
  d.ready = function (f) {
    if (!ie && !wk && d.addEventListener)
      return d.addEventListener('DOMContentLoaded', f, false);
    if (fn.push(f) > 1) return;
    if (ie)
      (function () {
        try { d.documentElement.doScroll('left'); run(); }
        catch (err) { setTimeout(arguments.callee, 0); }
      })();
    else if (wk)
      var t = setInterval(function () {
        if (/^(loaded|complete)$/.test(d.readyState))
          clearInterval(t), run();
      }, 0);
  };
})();

document.ready(
    function _change53URL() {
        var a_x=document.getElementsByTagName("a");
        for(var i=0;i<a_x.length;i++){
            if((a_x[i].href).indexOf("53kf.com") != -1){
                if((a_x[i].href).indexOf("?") != -1){
                    rep_str     = a_x[i].href+"&u_stat_id="+window.join_key;
                    a_x[i].href = rep_str;
                }
                else{
                    rep_str     = a_x[i].href+"?u_stat_id="+window.join_key;
                    a_x[i].href = rep_str;
                }
            }
        }
        var div_x=document.getElementsByTagName("div");
        for(var i=0;i<div_x.length;i++){
            if((div_x[i].onclick) != null){
                var str_func = (div_x[i].onclick).toString();
                if(str_func.indexOf("webCompany.php") != -1){
                    var s = str_func.replace(/webCompany.php%3F/,"webCompany.php%3Fu_stat_id="+window.join_key+"%26");
                    s = s.replace(/function\s*onclick\(event\)\s*{\s*/,"");
                    s = s.replace(/}/,"");
                    div_x[i].onclick = function(){eval(s)};
                }
            }
        }
    }
);

