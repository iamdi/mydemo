var $;

(function (opt) {
    var ua = navigator.userAgent.toLowerCase(), domReady = false, domCheck = false,
        doc = document, loc = document.location.href;
    var domain = doc.location.hostname;
    domain = domain.substring(domain.indexOf('.'));

    var citems;
    var querySelectorAll = function (n, sel) {
        var items = n.children;
        for (var i = 0; i < items.length; i++) {
            if (items[i].className && items[i].className.indexOf(sel) != -1) {
                citems.push(items[i]);
            }
            querySelectorAll(items[i], sel);
        }
        return citems;
    };
    $ = function (o, p) {
        if (typeof o == 'string' && o.indexOf('.') == 0) {
            p = p || document.body;
            if (typeof(document.querySelector) != 'undefined') {
                return p.querySelector(o);
            }
            citems = [];
            var items = querySelectorAll(p, o.substring(1));
            return items.length == 0 ? null : items[0]
        }
        return (typeof o == 'string' ? doc.getElementById(o) : o);
    };
    var sep = loc.indexOf('?'), qbase = loc.substring(0, sep), qstr = loc.substring(sep + 1);
    $.url2param = function (qs) {
        var qsa = qs.split('&'), obj = {};
        for (var v = 0; v < qsa.length; v++) {
            var lv = qsa[v].split('=');
            if (lv[0].indexOf('_') != 0) obj[lv[0]] = decodeURIComponent(lv[1] || '');
        }
        return obj;
    };
    window.queryParam = $.url2param(qstr);

    (function () {

        $.goTab = function (tar) {
            window.location.href = $.tabUrl(tar);
        };
        $.tabUrl = function (tar) {
            if (!queryParam.u) queryParam.u = opt.UId;
            if (!queryParam.v) queryParam.v = opt.VId;
            queryParam.command = tar;
            if (tar == 'freePhone') queryParam.n = opt.userName;
            var str = $.params(queryParam);
            return qbase + '?' + str;
        };
        $.back = function () {
            var ref = queryParam['loc'];
            if (ref) {
                window.location.href = ref;
            } else {
                $.closeWindow();
            }
        }

    })();
    $.apply = function () {
        var t = arguments[0] || {}, i = 1, len = arguments.length;
        for (; i < len; i++) {
            var o = arguments[i];
            for (var v in o) {
                t[v] = o[v];
            }
        }
        return t;
    };
    $.apply(Function.prototype, {
        delegate: function (obj, args) {
            var method = this;
            return function () {
                var callArgs = args || arguments;
                return method.apply(obj || window, callArgs);
            };
        }
    });
    $.apply(String.prototype, {
        replaceAll: function (s, t) {
            var r = this;
            while (r.indexOf(s) != -1) {
                r = r.replace(s, t);
            }
            return r;
        }
    });

    $.apply($, {
        browser: {
            css1: doc.compatMode == 'CSS1Compat',
            version: (ua.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
            webkit: /webkit/.test(ua),
            opera: /opera/.test(ua),
            msie: /msie/.test(ua) && !/opera/.test(ua),
            gecko: !/webkit/.test(ua) && /gecko/.test(ua),
            maxthon: /maxthon/.test(ua),
            theworld: /theworld/.test(ua),
            sogou: /;\sse\s\d/.test(ua),
            se360: /360se/.test(ua),
            secure: (loc.indexOf('https') == 0),
            uc: /ucweb|ucbrowser/.test(ua),
            iphone: /iphone/.test(ua),
            qq: /qq/.test(ua),
            encrypt: doc.location.href.indexOf('https://') == 0,
            supportAudio: (function () {
                return !!(document.createElement('audio').canPlayType);
            })()
        },
        addCssRuler: function (ruler) {
            var ss1 = document.createElement('style');
            ss1.setAttribute('type', 'text/css');
            var hh1 = document.getElementsByTagName('head')[0];
            hh1.appendChild(ss1);
            if (ss1.styleSheet) {
                ss1.styleSheet.cssText = ruler;
            } else {
                var tt1 = document.createTextNode(ruler);
                ss1.appendChild(tt1);
            }

        },
        genID: (function () {
            var idSeed = 0;
            return function () {
                return 'dui_' + idSeed++;
            }
        })(),
        closeWindow: function () {
            try {
                window.open('', '_self', '').close();
                window.close();
                if (typeof WeixinJSBridge != 'undefined')
                    WeixinJSBridge.invoke('closeWindow', {}, function (res) {
                    });
            } catch (e) {

            }
        },
        isFunction: function (fn) {
            return !!fn && typeof fn != 'string' && !fn.nodeName &&
                fn.constructor != Array && /^[\s[]?function/.test(fn + '');
        },
        isBlank: function (s) {
            return (typeof s == 'undefined') || s == null || s.length == 0;
        },
        isNumber: function (s) {
            return s != null && (typeof s == 'number' || (typeof s == 'string' && /^[0-9]+$/.test(s)));
        },
        shortId: function (id, name) {
            if ($.isVisitor(id)) {
                if (!$.isBlank(name) && !$.isVisitor(name)) {
                    return name;
                }
                else name = id;

                var pre = (i18n && i18n.guest) ? i18n.guest : '\u6765\u5bbe';
                var v = pre;
                for (var i = 0; i < 5; i++) v += name.charCodeAt(i);
                if (v.length > 7) v = v.substring(0, 7);
                return v;
            } else {
                return $.isBlank(name) ? id : name;
            }
        },
        isVisitor: function (id) {
            return id.length > 30;
        },
        tpl: function (s, o) {
            return s.replace(/\$?\{([a-zA-z0-9]*)\}/ig, function ($1, $2) {
                return o[$2];
            });
        },
        dateString: function (o, d) {
            o != null || (o = 'HH:mm:ss');
            d = d || new Date(), m = d.getMonth() + 1, day = d.getDate(), h = d.getHours(), mi = d.getMinutes(), ss = d.getSeconds();
            var f2 = function (i) {
                return i >= 10 ? i + '' : '0' + i;
            };
            var s = o.replace('yyyy', d.getFullYear());
            s = s.replace('MM', f2(m));
            s = s.replace('dd', f2(day));
            s = s.replace('HH', f2(h));
            s = s.replace('mm', f2(mi));
            s = s.replace('ss', f2(ss));
            return s;
        },
        escapeHTML: function (s) {
            var reg = /[<>&]/g;
            s = s.replace(reg, function ($0) {
                switch ($0) {
                    case '<':
                        return '&lt;';
                    case '>':
                        return '&gt;';
                    case '&':
                        return '&amp;';
                }
            });
            return s;
        },
        escapeNull: function (s) {
            return s ? s : '';
        },
        parseURL: function (s) {
            var reg = /(http:\/\/|https:\/\/|ftp:\/\/|www)((?:\&amp;|[\w\.!\:\/=%_\-,~\?\&])*)/g;
            s = s.replace(reg, function ($0, $1, $2) {
                $2 = $2.replace(/\&amp;/g, function (s) {
                    return '&';
                });
                var u = ($1 == 'www' ? 'http://www' : $1) + $2;
                return '<a class="linkText" href="' + u + '" target="_blank">' + u + '</a>';
            });
            return s;
        },
        parseEmail: function (s) {
            var reg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
            s = s.replace(reg, function ($0) {
                return '<a href="mailto:' + $0 + '">' + $0 + '</a>';
            });
            return s;
        },
        parsePhone: function (s) {
            var reg = /[84]00\d{7,8}|1[3587]\d{9}|0\d{2,3}\-?\d{7,8}/;
            s = s.replace(reg, function ($0) {
                return '<a href="tel://' + $0 + '" target="_blank">' + $0 + '</a>';
            });
            return s;
        },
        currentStyle: function (el) {
            return el.currentStyle || doc.defaultView && doc.defaultView.getComputedStyle(el, null);
        },
        hide: function (id) {
            var obj = $(id);
            if(!obj) return;
            obj.old = obj.style.display;
            obj.style.display = 'none';
        },
        show: function (id) {
            var ob = $(id);
            if(!ob) return;
            ob.style.display = ob.old || '';
            if ($.currentStyle(ob).display === 'none') ob.style.display = 'block';
        },
        toggle: function (id) {
            var o = $(id);
            if (o) {
                o.style.display = ($.currentStyle(o).display == 'none' ? 'block' : 'none');
            }
        },
        hasClass: function (id, clz) {
            var o = $(id);
            if (o && o.className) return o.className.match(new RegExp('(^|\\s)' + clz + '($|\\s)', 'ig'));
            return false;
        },
        addClass: function (id, clz) {
            var o = $(id);
            if (o) {
                o.className && $.hasClass(id, clz) ||
                o.className && (o.className += ' ' + clz) ||
                (o.className = clz);
            }
        },
        removeClass: function (id, clz) {
            var o = $(id);
            o && o.className && $.hasClass(id, clz) && (o.className = o.className.replace(new RegExp('(^|\\s)' + clz + '($|\\s)', 'ig'), ' '));
        },
        remove: function (ele) {
            ele.parentNode.removeChild(ele);
        },
        attachE: function (t, e, f) {
            if (t.addEventListener) t.addEventListener(e, f, false);
            else if (t.attachEvent) t.attachEvent('on' + e, f);
            else
                t['on' + e] = f;
        },
        detachE: function (t, e, f) {
            if (t.removeEventListener) {
                t.removeEventListener(e, f, false);
            } else if (t.detachEvent) {
                t.detachEvent('on' + e, f);
            } else {
                t['on' + e] = null;
            }
        },
        loadSwf: function (tar, path) {
            var str = ' <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%">'
                + '<param name="movie" value="{path}"/>'
                + '<embed src="{path}" width="100%" height="100%"  type="application/x-shockwave-flash"></embed></object> ';
            tar.innerHTML = $.tpl(str, {path: path});
        },
        getCookie: function (name) {
            var arr, reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
            arr = doc.cookie.match(reg);
            return arr ? unescape(arr[2]) : null;
        }, setCookie: function (name, value, t) {
            t = (t || 120 * 30 * 24 * 60 * 60 ) * 1000;
            var exp = new Date();
            exp.setTime(exp.getTime() + t);
            doc.cookie = name + '=' + escape(value) + ';expires=' + exp.toGMTString() + ';domain=' + domain + ';path=/';
        },
        value: (function () {
            var selbox = /select-(one|multiple)/i, radiochk = /radio|checkbox/i;
            return function (ele) {
                var type = ele.type;
                if (selbox.test(type)) {
                    var opt = ele.options;
                    return opt.selectedIndex != -1 && opt[opt.selectedIndex].value
                } else if (radiochk.test(type)) {
                    return ele.checked && ele.value;
                } else {
                    return ele.value;
                }
            }
        })(),
        ajaxSetting: {
            url: location.href,
            global: true,
            type: 'GET',
            timeout: 0,
            contentType: 'application/x-www-form-urlencoded;charset=utf-8',
            processData: true,
            async: true,
            data: null,
            username: null,
            password: null,
            accepts: {
                xml: 'application/xml, text/xml',
                html: 'text/html',
                script: 'text/javascript, application/javascript',
                json: 'application/json, text/javascript',
                text: 'text/plain',
                _default: '*/*'
            }
        },
        lastModified: {},
        params: function (o) {
            var s = [], enc = encodeURIComponent;

            function oa(a, ta) {
                for (var i = 0; i < a.length; i++) {
                    ta.push(enc(a[i]).name + '=' + enc(a[i]).value);
                }
            }

            if (typeof o == 'Array') {
                oa(o, s);
            }
            else {
                for (var v in o) {
                    if (typeof o[v] == 'Array') oa(o[v], s);
                    else s.push(enc(v) + '=' + enc(o[v]));
                }
            }
            s.push('_d=' + (new Date()).getTime());
            return s.join('&').replace(/%20/g, '+');
        },
        httpSuccess: function (xhr) {
            try {
                return !xhr.status && location.protocol == 'file:' ||
                    ( xhr.status >= 200 && xhr.status < 300 ) || xhr.status == 304 || xhr.status == 1223 ||
                    $.browser.safari && xhr.status == undefined;
            } catch (e) {
            }
            return false;
        },
        httpNotModified: function (xhr, url) {
            try {
                var xhrRes = xhr.getResponseHeader('Last-Modified');
                return xhr.status == 304 || xhrRes == $.lastModified[url] ||
                    $.browser.safari && xhr.status == undefined;
            } catch (e) {
            }
            return false;
        },
        httpData: function (xhr, type, filter) {
            var ct = xhr.getResponseHeader('content-type'),
                xml = type == 'xml' || !type && ct && ct.indexOf('xml') >= 0,
                data = xml ? xhr.responseXML : xhr.responseText;
            if (xml && data.documentElement.tagName == 'parsererror')
                throw 'parsererror';
            if (filter)
                data = filter(data, type);
            if (type == 'json')
                data = eval('(' + data + ')');

            return data;
        },
        active: 0,
        ajaxSetup: function (o) {
            $.apply($.ajaxSetting, o);
        },
        ajax: function (o) {
            var status, data;
            o = $.apply(o, $.apply({}, $.ajaxSetting, o));
            if (o.data && typeof o.data != 'string' && o.processData !== false) {
                o.data = $.params(o.data);
            }
            if (o.data && o.type == 'GET') {
                o.url += (o.url.match(/\?/) ? '&' : '?') + o.data;
                o.data = null;
            }
            var requestDone = false;
            var xhr = window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest();
            xhr.open(o.type, o.url, o.async);
            try {
                o.contentType === false || !o.data || xhr.setRequestHeader('Content-Type', o.contentType);
                //!o.ifModified ||xhr.setRequestHeader("If-Modified-Since",dut.lastModified[o.url] || "Thu, 01 Jan 1970 00:00:00 GMT" );
                //xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                xhr.setRequestHeader('Accept', o.dataType && o.accepts[o.dataType] || o.accepts._default);
            } catch (e) {
                console.log(e.message);
            }
            var success = function () {
                if (o.success)
                    o.success(data, status);
            };
            var error = function () {
                if (o.error)
                    o.error(status);
            };
            var complete = function () {
                if (o.complete)
                    o.complete(xhr, status);
                if (o.global) {
                }
                if (o.global && !--$.active) {
                }
            };
            var onreadystatechange = function (isTimeout) {
                if (!requestDone && xhr && (xhr.readyState == 4 || isTimeout == 'timeout')) {
                    requestDone = true;
                    if (ival) {
                        clearInterval(ival);
                        ival = null;
                    }

                    status = (isTimeout == 'timeout' && 'timeout' ||
                    !$.httpSuccess(xhr) && 'error' ||
                    o.ifModified && $.httpNotModified(xhr, s.url) && 'notmodified' ||
                    'success');

                    if (status == 'success') {
                        try {
                            data = $.httpData(xhr, o.dataType, o.dataFilter);
                        } catch (e) {
                            status = 'parsererror';
                        }
                    }

                    if (status == 'success') {
                        var modRes;
                        try {
                            modRes = xhr.getResponseHeader('Last-Modified');
                        } catch (e) {
                        }
                        if (o.ifModified && modRes)
                            $.lastModified[o.url] = modRes;
                        try {
                            success();
                        } catch (e) {

                        }
                    } else
                        error();
                    complete();
                    if (o.async) xhr = null;
                }
            };
            if (o.async) {
                var ival = setInterval(onreadystatechange, 13);
                if (o.timeout > 0)
                    setTimeout(function () {
                        if (xhr) {
                            xhr.abort();
                            if (!requestDone) onreadystatechange('timeout');
                        }
                    }, o.timeout);
            }
            try {
                xhr.send(o.data);
            } catch (e) {
                typeof console != 'undefined' && console.log && console.log(e.message);
            }
            if (!o.async)
                onreadystatechange();


            return xhr;
        },
        get: function (url, data, callback, method, error) {
            if ($.isFunction(data)) {
                callback = data;
                data = null;
            }
            return $.ajax({
                type: method || 'GET',
                url: url,
                data: data,
                success: callback,
                error: error,
                dataType: 'json'
            });
        },
        onReady: (function () {
            var func = [];
            var ready = function () {
                if (!domReady) {
                    domReady = true;
                    for (var i = 0; i < func.length; i++)
                        func[i]();
                    func = [];
                }
            };
            var bindReady = function () {
                if (domCheck) return;
                domCheck = true;
                if (doc.addEventListener) {
                    doc.addEventListener('DOMContentLoaded', function () {
                        doc.removeEventListener('DOMContentLoaded', arguments.callee, false);
                        ready();
                    }, false);
                } else if (doc.attachEvent) {
                    doc.attachEvent('onreadystatechange', function () {
                        if (doc.readyState === 'complete') {
                            doc.detachEvent('onreadystatechange', arguments.callee);
                            ready();
                        }
                    });
                    if (doc.documentElement.doScroll && window == window.top) (function () {
                        if (domReady) return;

                        try {
                            doc.documentElement.doScroll('left');
                        } catch (error) {
                            setTimeout(arguments.callee, 0);
                            return;
                        }
                        ready();
                    })();
                }
                $.attachE(window, 'load', ready);
            };
            return function (fn) {
                if (domReady) fn();
                else {
                    func.push(fn);
                    bindReady();
                }
            }
        })(),
        emot: {
            em14: '8o\|',
            em28: '\$P',
            em20: '\(\*z\)',
            em21: '\(zz\)',
            em11: '\*P',
            em24: '\*xD',
            em25: '\*xp',
            em12: '\*zz',
            em29: '\+\+\(',
            em16: '\+\+\|',
            em17: '\+o\(',
            em7: '\:D',
            em8: '\:S',
            em5: '\:\$',
            em27: '\:\'D',
            em1: '\:\'\(',
            em33: '\:\)',
            em22: '\:\-\#',
            em4: '\:\@',
            em6: '\:\|',
            em32: '\:x\)',
            em9: '\:xp',
            em13: '\;\(',
            em18: '\;\)',
            em19: '\;\-\)',
            em23: '\;xD',
            em15: '\^o\)',
            em2: '\|\(',
            em10: '\|\-\)',
            em30: 'o\('
        },
        emotTable: function () {
            try {
                var tt = doc.createElement('table'), tb = doc.createElement('tbody'), i = 0, tr;
                tt.setAttribute('cellspacing', 1);
                tt.appendChild(tb);
                var td;
                for (var v = 1; v <= 33; v++) {
                    if (i % 11 == 0) {
                        tr = doc.createElement('tr');
                        tb.appendChild(tr)
                    }
                    td = doc.createElement('td');
                    var txt = '[!' + v + ']', sty = 'em' + v;
                    td.innerHTML = '<a class="btn emot2 ' + sty + '"/>';
                    td.onclick = appendEmot.delegate(null, [txt, sty]);
                    i++;
                    tr.appendChild(td);
                }
                while (i % 11 != 0) {
                    td = doc.createElement('td');
                    td.innerHTML = '&nbsp;';
                    tr.appendChild(td);
                    i++;
                }
                return tt;
            } catch (ex) {
                alert(ex.message + ex.lineNumber);
            }

        },
        clickIn: function (t, e) {
            var src = e.srcElement || e.target;
            while (src.id != t && src != null && src.tagName.toLowerCase() != 'html') {
                src = src.parentNode;
            }
            return src && src.id == t;
        },
        mask: function (f) {
            var o = $('maskDiv');
            if (!o) {
                o = doc.createElement('div');
                o.id = 'maskDiv';
                doc.body.appendChild(o);
            }
            (f === false ? $.hide : $.show)(o);
        },
        buildMenu: (function () {
            var tpl = '<a href="#" onclick="return false"><span id="{sid}">{text}</span></a>';

            return function (id, pos, items, sel) {
                if ($(id)) return;
                var d = doc.createElement('div');
                d.className = 'gmenu';
                d.id = id;
                $.apply(d.style, pos);

                var ul = doc.createElement('ul');
                for (var v = 0; v < items.length; v++) {
                    var li = doc.createElement('li'), item = items[v];
                    li.innerHTML = $.tpl(tpl, item);
                    li.id = item.lid;
                    if (v == sel) {
                        li.className = 'active';
                        d.setAttribute('selected', li.id);
                    }
                    $.attachE(li, 'click', item.cb);
                    ul.appendChild(li);
                }
                d.appendChild(ul);
                doc.body.appendChild(d);
            }
        })(),
        launchFullscreen: function (element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        }
    });

    var env = $.browser;
    $.apply($, {
        getBody: function () {
            return !env.css1 ? doc.body : doc.documentElement;
        },
        docH: function () {
            return Math.max($.getBody().scrollHeight, env.msie ? $.getBody().clientHeight : self.innerHeight);
        },
        docW: function () {
            return Math.max($.getBody().scrollWidth, !env.css1 && !env.opera ? doc.body.clientWidth : env.msie ? doc.documentElement.clientWidth : self.innerWidth);
        },
        center: function (el, w, h) {
            el = $(el);
            $.apply(el.style, {top: ($.docH() - h) / 3 + 'px', left: ($.docW() - w) / 2 + 'px'});
        }

    });
    var winTpl = '<div class="win-wrap"><div class="win-tl"><div class="win-tr"><div class="win-tc"><span>{title}</span></div></div></div>'
        + '<div class="win-ml"><div class="win-mr"><div class="win-mc"><div class="win-bwrap" id="{wrapId}"></div>'
        + ' <div class="win-btns" id="{btnId}"></div></div></div></div>'
        + '<div class="win-bl"><div class="win-br"><div class="win-bc">&nbsp;</div></div></div></div>';


    $.win = function (config) {
        this.obj = document.createElement('div');
        this.obj.id = $.genID();
        this.obj.className = 'win';
        this.wrapId = $.genID();
        this.btnId = $.genID();
        $.apply(this, config);
        this.obj.innerHTML = $.tpl(winTpl, this);
        doc.body.appendChild(this.obj);
        this.wrap = $(this.wrapId);
        this.btns = $(this.btnId);
        this.width && $.apply(this.obj.style, {width: this.width + 'px', height: this.height + 'px'});
        this.wrap.appendChild(this.content);
        this.width && $.apply(this.wrap.style, {width: (this.width - 26) + 'px', height: (this.height - 100) + 'px'});
        this.okBtn = this.addBtn({text: i18n.OK, callback: this.onOK.delegate(this)});
        if (this.closable) {
            this.cancelBtn = this.addBtn({isCancel: true, text: i18n.cancel, callback: this.onCancel.delegate(this)});
        }
        $.show(this.content);
    };
    $.apply($.win.prototype, {
        show: function () {
            $.mask();
            $.center(this.obj, this.width, this.height);
            if (!this.closable && this.cancelBtn) {
                $.hide(this.cancelBtn);
            }
            $.show(this.obj);
        },
        hide: function () {
            if (this.onClose) this.onClose();
            $.mask(false);
            $.hide(this.obj);

        },
        addBtn: function (o) {
            var id = $.genID(), a = doc.createElement('a');
            var clz = 'win-btn ';
            if (o.isCancel) {
                clz += 'win-btn-cancel'
            }
            a.className = clz;
            a.id = id;
            a.innerHTML = '<span>' + o.text + '</span>';
            this.btns.appendChild(a);
            $.attachE(a, 'click', o.callback);
            return a.id;
        },
        onOK: function () {
            if (!this.handler || this.handler.call(this))
                this.hide();
        },
        onCancel: function () {
            this.hide();
        }
    });

    $.apply(window, {
        showCall: function () {
            $.mask();
            refreshCode();
            $.show('phoneWin');
        },
        closeCall: function (id) {
            $.hide(id);
            $.mask(false);
        },
        switchPhone: function (v) {
            $.hide('phoneNumber' + (v == 0 ? 1 : 0));
            $.show('phoneNumber' + v);
        },
        phoneCall: (function () {
            var calling = false;
            var showInfo = function (msg, clz) {
                var obj = $('phoneCallInfo');
                obj.innerHTML = i18n[msg] || msg;
                obj.className = 'phone-info-' + clz;
            };
            return function () {
                if (calling) return;
                var number = $('phoneCallMobile').checked ? $('mobileNumber').value : ($('phoneZone').value + $('phoneNumber').value + $('phoneExt').value);


                if ($.isBlank(number)) {
                    showInfo('invalidNumber', 'error');
                    return;
                }
                var code = '';
                if (!opt.phoneNoCode) {
                    code = $('checkCode').value;
                    if ($.isBlank(code)) {
                        showInfo('invalidCheckCode', 'error');
                        return;
                    }
                }
                if (!checkCallTime()) {
                    showInfo('freqCall', 'error');
                    return;
                }
                showInfo('phoneCalling', 'normal');
                calling = true;
                $.get('call', {
                    c: conf.compId,
                    g: conf.groupId || '',
                    n: conf.userName,
                    phone: number,
                    code: code
                }, function (resp) {
                    calling = false;
                    showInfo(resp.error || 'phoneCalled', resp.error && 'error' || 'success');
                    resp.error || markCallTime();
                    refreshCode();
                });
            }
        })(),
        refreshCode: function () {
            var img = $('checkCodeImg');
            if (!img) return;
            img.src = 'check?w=' + parseInt(img.style.width) + '&h=' + parseInt(img.style.height) + '&_t=' + (+new Date());
        },
        checkCallTime: function () {
            return !$.getCookie('_call');
        }, markCallTime: function () {
            $.setCookie('_call', 1, 120);
        }
    });

})(conf);

var prot = ($.browser.secure ? 'https://' : 'http://');
$.chatFile = prot + conf.version;
var resizeLayout = function () {
    var ad1 = $('ad1'), stage = $('stage'), ad2 = $('ad2'), desc = $('descInfo'), tool = $('tool'),
        inputer = $('inputer');
    var main = $('main');
    if (!stage && !main)
        return;
    var winh = document.documentElement.clientHeight || document.body.clientHeight,
        winw = document.documentElement.clientWidth || document.body.clientWidth;
    if (stage) {
        var h1 = (winh - 73 - 35 - 125), h2 = (winh - 102), w = (winw - 164);
        h1 = (h1 < 0 ? 0 : h1) + 'px';
        h2 = (h2 < 0 ? 0 : h2) + 'px';
        w = (w < 0 ? 0 : w) + 'px';
        stage.style.height = ad1 ? h1 : h2;
        ad2.style.height = h2;
        desc && (desc.style.height = h1);
        stage && (stage.style.width = w);
        tool && (tool.style.width = w);
        inputer && (inputer.style.width = w);
    } else if (main) {
        main.style.height = winh + 'px';
        $('.forceStage').style.height = (winh - 41 - 70 - 28 - 30) + 'px';
    }

};
var initStyle = function (opt) {

    if (!opt.mobile) {
        if (opt.fontSize) {
            var stage = $('chatDiv');
            if (stage) {
                stage.style.fontSize = opt.fontSize + 'px';
                stage.style.lineHeight = '1.5';
            }
        }
        return;
    }
    var mobileColor = opt.mobileChatColor || '#40a0fc';
    var messageColor = opt.messageColor || mobileColor;
    var mobileTpl = '.mobile .header{background-color:{0}}' +
        ' .mobile .inMsg,.mobile .inMsg .msg{background-color:{1};color:#FFF} ' +
        ' .mobile .inMsg .msg-cursor{border-left-color:{1}}' +
        ' .mobile .inMsg .msg-cursor-inner {border-right-color:{1}}' +
        ' .mobile .main-color {color:{0}}' +
        ' .mobile .main-back-color {background-color:{0}}';
    var cssStyle = $.tpl(mobileTpl, [mobileColor,messageColor]);
    $.addCssRuler(cssStyle);
    if (opt.userPhoto) {
        if ($.browser.encrypt && opt.userPhoto.indexOf('http://') == 0) {
            opt.userPhoto = 'https://' + opt.userPhoto.substring(7);
        }
        var photoTpl = '.mobile .inMsg .m-photo-head{background:url({0}) no-repeat transparent;background-size:44px}';
        $.addCssRuler($.tpl(photoTpl, [opt.userPhoto]));
    }
};
$.onReady(function () {
    initStyle(conf);
    if (conf.mobile != 1) {
        var ad = {logo: $('header'), ad1: $('ad1'), ad2: $('ad2'), card: conf.cardImage && $('ad2')};
        if (conf.command == 'forceChat') {
            var mainColor = conf.miniStyle, header = $('header'), miniMain = $('main'), btnSend = $('.btn-chat-send'),
                tabActive = $('.active');

            header && (header.style.backgroundColor = mainColor);
            miniMain && (main.style.borderColor = mainColor);
            btnSend && (btnSend.style.backgroundColor = mainColor);

        } else {
            var colors = ['#e41e26', '#e92083', '#ababab', '#348ce7', '#92cbcb', '#17AE5A'];
            try {
                var color = conf.clientColor || colors[conf.clientStyle - 1];
                $.addCssRuler('.main-color{background-color:' + color + ' !important}')
            } catch (e) {
                alert(e.message);
            }
        }

        var fullurl = function (s) {
            return (s.indexOf('http') == 0 ? s : ($.chatFile + s));
        }, tobk = function (i) {
            return 'url(' + i + ')';
        };
        var open = function (url) {
            window.open(url);
        };

        for (var v in ad) {
            if (!ad.hasOwnProperty(v))
                continue;
            if (ad[v]) {
                if (v == 'ad2' && ad['ad1'] || v == 'logo' && conf.command == 'forceChat')
                    continue;
                var img = fullurl(conf[v + 'Image']), tar = conf[v + 'Target'], re = /.*\.swf/ig,
                    isflash = re.test(img);
                if (v != 'logo')
                    $.attachE(ad[v], 'click', open.delegate(null, [tar]));
                else {
                    $.attachE(ad[v], 'click', function (e) {
                        e = e || window.event;
                        var srcEle = e.srcElement || e.target;
                        if (srcEle.id == 'header') {
                            open(conf['logoTarget']);
                        }
                    });
                }
                !isflash && $.apply(ad[v].style, {
                    backgroundImage: tobk(img),
                    cursor: 'pointer'
                }) || $.loadSwf(ad[v], img);
            }
        }
        var rc = $('robotCard');
        if (!$.isBlank(conf.robotCard) && rc) {
            rc.style.background = 'url(' + conf.robotCard + ') left top no-repeat';
        }
        try {
            resizeLayout();
        } catch (e) {
        }
        $.attachE(window, 'resize', resizeLayout);
    } else {
        var msg = $('message'), input = $('inputer'), stage = $('stage');
        if ('forceChat' != conf.command) {
            $('back').onclick = function () {
                $.back();
            };
        }
        if (msg && input && stage && $.browser.qq && $.browser.iphone) {
            // stage.style.bottom = '89px';
            // input.style.bottom = '40px';
        }

        if (msg && input && stage && $.browser.uc && $.browser.iphone) {
            //conf.windowHeight = document.body.clientHeight;
        }
    }
    if ('forceChat' != conf.command) {
        $('closer').onclick = function () {
            if ('applyChat' == conf.command || 'inviteChat' == conf.command)
                exit();
            else
                $.closeWindow();
        };
    }
});
$.apply(window, {
    playAudio: (function () {
        var lastNode = null;
        var player = null;
        var getPlayer = function () {
            if (player != null) return player;
            player = document.createElement('audio');
            player.setAttribute('style', 'position:absolute;left:-100000px;top:-100000px');
            player.onended = player.onerror = function () {
                lastNode.className = '';
                lastNode = null;
            };
            document.body.appendChild(player);
            return player;
        };
        return function (link) {
            var url = link.getAttribute('data'), p = link.parentNode;
            if (lastNode != null) {
                lastNode.className = '';

            }
            if (lastNode != p) {
                getPlayer().setAttribute('src', url);
                getPlayer().play();
                $.addClass(p,'playing');
                lastNode = p;
            } else {
                player.pause();
                lastNode = null;
            }
        };
    })(),
    browserImage: (function () {
        var preview = null;
        var previewId = 'imagePreview';
        var previewImg = null;
        window.closeImagePreview = function () {
            if (preview != null) {
                $.hide(previewId);
            }
        };
        var initPreview = function () {
            preview = document.createElement('div');
            preview.id = previewId;
            preview.className = 'image-preview';

            preview.innerHTML = '<a href="javascript:" onclick="closeImagePreview();return false;">-</a><img>';
            document.body.appendChild(preview);
            previewImg = preview.getElementsByTagName('img')[0];
            previewImg.onload = function () {
                this.style.marginTop = (window.innerHeight - this.height) / 2 + 'px';

            }

        };
        return function (url) {
            if (preview == null)
                initPreview();
            $.show(previewId);
            previewImg.src = url;


        };
    })(),
    renderFile: function (att, url) {

        var tpls = {
            img: '<a href="javascript:" target="_blank" class="file-image" onclick="browserImage(\'{0}\');return false;"><img src="{0}" border="0"></a>',
            audio: '<a href="javascript:" data="{0}" class="file-audio" onclick="playAudio(this);return false;"><i>&nbsp;</i></im></a>',
            video: '<video src="{0}" class="file-video"></video><a href="javascript:" class="file-video-control" onclick="playVideo(this);return false;">&nbsp;</a>',
            other: '<a href="{0}" target="_blank" class="file-other">&nbsp;</a>'
        };
        var t = detectFileType(url);
        att.innerHTML = $.tpl(tpls[t], [url, att.id]);
        if (t == 'video') {
            att.style.position = 'relative';
        }

    },
    playVideo: (function () {
        var bound = {};
        var onstop = function (p, video) {
            p.className = '';
        };
        var isPlaying = function (p, video) {
            return (p.className || '').indexOf('playing') != -1;
        };
        return function (node) {
            var parent = node.parentNode, id = parent.id;
            var video = parent.getElementsByTagName('video')[0];

            if (!bound[id]) {
                video.onended = video.onerror = function () {
                    onstop(parent, video);
                };
                bound[id] = 1;
            }
            if (isPlaying(parent, video)) {
                video.pause();
                onstop(parent, video);
            } else {
                video.play();
                $.addClass(parent,'playing');
            }
        }


    })(),
    detectFileType: function (file) {
        return /(\.jpg|\.gif|\.png|\.bmp|\.jpeg|\.webp)$/.test(file) && 'img' ||
            /(\.mp3|\.ogg|\.wav)$/.test(file) && 'audio' ||
            /(\.mp4|\.mov)$/.test(file) && 'video' ||
            'other';
    }
});

