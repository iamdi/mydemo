var Looper = (function () {
    var Socket = window.WebSocket || window.MozWebSocket;
    if (Socket && typeof Socket.prototype.send != 'function') {
        Socket = null;
    }
    var conn = function (env, url, input, opt) {
        this.env = env;
        this.input = input;
        this.chatting = true;
        this.url = url;
        this.opt = opt;

    };
    var lastMessage = null;
    var maxAllowLen = 400;
    var msgLoopTime = 10;
    var alertNoChatTime = 60;
    var retryWaiting = 5;
    var maxReplyWaitTime = 1;
    var lastPump = 0;
    var ackTime = new Date();
    var lastMessageTime = 0;
    var buffer = [];
    var reconnecting = false;
    var reconnectTimer = 0;
    var inputCheckTimer = 0;
    var socketClosed = 0;
    var socketOpened = 0;
    var retryTimes = 0;
    $.apply(conn.prototype, {
        msgChanged: function () {
            var mm = this.input.value;
            if (mm && mm.length > maxAllowLen)
                mm = mm.substring(0, maxAllowLen);
            if (lastMessage != mm) {
                lastMessage = mm;
                return mm;
            }
            return false;
        },
        checkActive: function () {
            var rtn = false;
            var now = new Date();
            if (this.chatting && !this.env.meeting && (now.getTime() - Math.max(lastMessageTime, ackTime.getTime())) / 1000 > alertNoChatTime) {
                ackTime = new Date();
                rtn = true;
            }
            return rtn;
        },
        startInputChecker: function () {
            var me = this;
            inputCheckTimer = setInterval(function () {
                var changed = me.msgChanged();
                var needCheck = me.checkActive();
                if (changed || needCheck) {
                    var msg = me.chatParam();
                    msg.flag = true;
                    if (changed)
                        msg.input = changed;
                    if (needCheck)
                        msg.check = true;
                    me.sendMessage(msg);
                }
            }, msgLoopTime * 1000);
        },
        chatParam: function () {
            var me = this;
            var param = $.apply({
                c: me.env.c,
                n: me.env.n,
                u: me.env.u,
                v: me.env.v,
                cId: me.env.cId
            }, me.env, {check: me.checkActive()});
            var mm = me.msgChanged();
            if (mm !== false) {
                param.input = mm;
                lastMessage = mm;
            }
            return param;
        },
        startLooper: function () {
            var me = this;
            this.msgTimer = window.setInterval(function () {
                if (me.env.cId == null) {
                    me.stop();
                    return;
                }

                lastPump = new Date();
                try {
                    $.get(me.url + 'pump', me.chatParam(), function (resp, st) {
                        me.callback(resp.result);
                    });
                } catch (e) {
                }

            }, msgLoopTime * 1000);
        },
        start: function (onMessage) {
            this.callback = onMessage;
            if (Socket) {
                var link = document.location.href, pos1 = link.indexOf('//') + 2, pos2 = link.indexOf('/chat/p.do?');
                var wsuri = ($.browser.secure && 'wss' || 'ws') + '://' + link.substring(pos1, pos2) + '/room';
                var param = {c: this.env.c, id: this.env.winId};
                this.uri = wsuri + '/' + this.env.c + '/' + this.env.cId + '/' + this.env.winId;
                this.initSocket();
                this.startInputChecker();
            } else {
                this.startLooper();
            }
        },
        initSocket: function () {
            var ws = this.socket = new Socket(this.uri);
            var me = this;

            ws.onmessage = function (evt) {
                var d = JSON.parse(evt.data);
                if (d && d.result)
                    me.callback(d.result);
                else if (d && (d.msg || d.robot)) {
                    me.callback([d]);
                }

            };
            ws.onclose = function (e) {
                socketClosed = 1;
                if (e && e.code !== 1000) {
                    me.reconnect();
                }
            };
            ws.onopen = function (evt) {
                reconnecting = false;
                socketClosed = 0;
                retryTimes = 0;
                clearInterval(reconnectTimer);
                reconnectTimer = 0;
                socketOpened = 1;
                if (me.msgTimer) {
                    window.clearInterval(me.msgTimer);
                    me.msgTimer = 0;
                }
                me.sendMessage({status: 'opened'});
                if (buffer.length && me.socket.readyState == 1) {
                    var msg = null;
                    var len = buffer.length;

                    while (msg = buffer.shift()) {
                        me.sendMessage(msg);
                    }

                }
            };

            ws.onerror = function (evt) {
                me.reconnect();
                socketOpened = 0;
                console.log('===> error')
            };

        },
        reconnect: function () {
            if (!reconnecting) {
                reconnecting = true;
                var me = this;

                reconnectTimer = setInterval(function () {
                    retryTimes++;
                    if (retryTimes === 5 && !me.msgTimer) {
                        me.startLooper();
                    }
                    me.initSocket();
                }, retryWaiting * 1000);

            }

        },
        sendMessage: function (msg, onSuccess, onError) {
            if (msg && msg.status != 'opened')
                lastMessageTime = (+new Date());
            if (this.opt.queue && this.env.cId <= 0) {
                buffer.push(msg);
                return;
            }
            if (this.socket && !this.msgTimer) {
                var me = this;
                if (this.socket.readyState != 1) {
                    buffer.push(msg);
                } else {
                    this.socket.send(JSON.stringify(msg));
                }
            } else {
                $.get(this.url + 'postMessage', msg, onSuccess, 'GET', function () {
                    buffer.push(msg);
                });
            }
        },
        stop: function () {
            if (this.socket) {
                this.socket.close();
            } else {
                clearInterval(this.msgTimer);
                this.msgTimer = 0;
            }
        },
        restart: function () {
            this.stop();
            var me = this;
            setTimeout(function () {
                me.start(me.callback);
            }, 200)
        }
    });

    return conn;
})();
(function (opt) {
    var env = {
            c: opt.compId,
            u: opt.UId,
            v: opt.VId,
            n: opt.userName,
            role: 2,
            meeting: opt.meeting,
            cId: opt.chatId,
            site: opt.siteId
        },
        url = 'msg.dll?cmd=', msgTimer = null, isConnected = false, parts = [],
        robotChatting = false, shtcut = 'Enter', maxAllowLen = 300, emots = {},
        lastMsgTime = new Date(), ackTime = null, inputtingTimer = null,
        inputTimer = null, lastPump = new Date(), lastMsg = '', opinioned = false, doc = document,
        force = opt.command == 'forceChat',
        queueInited = false, notFirst = 0, notConnected = null, focusMsg = false, showTypes = false,
        sqt = 'visitor_question_type';
    var userTriggerFocus = true;
    opt.ipad = opt.mobile && navigator.userAgent.toLowerCase().indexOf('ipad') > -1;
    opt.ios = opt.mobile && navigator.userAgent.toLowerCase().indexOf('iphone') > -1;
    var embed = opt.mobile && force;
    var minimize = opt.mobile && force ? 1 : 0, freshMessage = 0;
    var notify = 1, notify_key = '_close_msg_notify';

    var commonTitle = '';
    opt.groupId && (env.g = opt.groupId);
    opt.winId && (env.winId = opt.winId);


    var showConfirm = function (callback, onCancel) {
        var dialog = $('confirmWin');
        if (!dialog) {
            var div = document.createElement('div');
            div.setAttribute('id', 'confirmWin');
            document.body.appendChild(div);
            div.innerHTML = '<div class="confirm-win-title">' + i18n.exitConfirm
                + '</div><div class="confirm-win-btn">' +
                '<a href="javascript:;" id="confirmOk" class="win-btn">' + i18n.OK + '</a>' +
                '<a href="javascript:;" id="confirmCancel" class="win-btn win-btn-cancel">' + i18n.cancel + '</a>' +
                '</div> ';
            $('confirmCancel').onclick = function () {
                $.hide('confirmWin');
                $.mask(false);
                onCancel && onCancel();
            }
        }
        $('confirmOk').onclick = function () {
            $.hide('confirmWin');
            $.mask(false);
            callback();
        };
        $.show('confirmWin');
        $.mask(true);

    };
    var confirmClose = function () {
        if (!opinioned && opt.autoOpinion) {
            openOpinion({
                auto: true, onClose: function () {
                    disconnect();
                    $.back();
                },
                closable: false
            });
        } else {
            disconnect();
            $.back();
        }
    };

    $.onReady(function () {
        force || initToolTip();
        initEvent();

        if (opt.visitorAuthen && !force) {
            var w = new $.win({
                title: i18n.visitorAuth, content: $('visitorAuth'), width: 400, height: 270,
                handler: function () {
                    var ids = ['visitor_name', 'visitor_email', 'visitor_tel'], param = {};
                    opt.showQType && $(sqt) && ids.push(sqt);
                    for (var v = 0; v < ids.length; v++) {
                        var id = ids[v], el = $(id), vl = $.value(el);
                        if (!$.isBlank(vl)) param[id] = vl;
                        else {
                            alert(i18n.invalid);
                            return false;
                        }
                    }
                    param = $.apply({}, env, param);
                    $.get(url + 'startChat', param, function (data) {
                        recvChatData(data);
                    });
                    return true;
                }
            });
            w.show();
        } else {
            initChat();
        }
        !force && opt.showChatType && showChatType();
        var backBtn = $('back');
        backBtn && !force && (backBtn.onclick = function () {
            if (env.cId && conf.mobile) {
                showConfirm(confirmClose);
            } else {
                $.back();
            }

        });

        if (conf.mobile) {
            var inputer = $('inputer'), msg = $('message');
            msg.oninput = function () {

                inputer.style.height = Math.min(msg.scrollHeight, 120) + 'px';
            }
        }
        if (conf.mobile && !opt.ipad && !force) {
            history.pushState && history.pushState({}, '', doc.location.href);
            setTimeout(function () {
                window.addEventListener && window.addEventListener('popstate', function (e) {
                    if (minimize && embed) {
                        popMessage({type: 'chatClose', data: {}});
                        return;
                    }
                    if (embed) {
                        history.pushState && history.pushState({}, '', doc.location.href);
                    }
                    if (env.cId) {
                        showConfirm(function () {
                            if (embed) {
                                popMessage({type: 'chatMinimize', data: {}});
                            } else {
                                $.back();
                            }
                        }, function () {
                            history.pushState && history.pushState({}, '', doc.location.href);
                        })
                    }
                })
            }, 2000);

        }
        document.onpaste = function(event) {
            var items = event.clipboardData.items;
            for (index in items) {
                var item = items[index];
                if (item.kind === 'file') {
                    var blob = item.getAsFile();
                   ajaxSendFile(blob,blob.name);

                }
            }
        }

    });
    var refreshTitle = function () {
        var mobileTitle = $('mobileTitle');
        if (mobileTitle) {
            freshMessage == 0 && (mobileTitle.innerHTML = commonTitle)
            || (mobileTitle.innerHTML = '<span class="fresh-message">' + freshMessage + '</span>' + commonTitle);
        }
        popMessage({type: 'msgFresh', data: {count: freshMessage}});

    };
    window.addEventListener && window.addEventListener('message', function (evt) {
        if (evt.data == 'restore') {
            minimize = 0;
            freshMessage = 0;
            refreshTitle();
        } else if (evt.data == 'min') {
            minimize = 1;
            $('message').blur();
        } else if (evt.data == 'closeChat') {
            disconnect();
        }
    });

    window.onbeforeunload = function () {
        if (force) return;
        openOpinion({auto: true});
        var b = $.browser;
        if (isConnected && !force && !(b.maxthon || b.se360 || b.theworld || b.sogou))
            return i18n.exitConfirm;
    };
    $.attachE(window, 'unload', function () {
        if (force) return;
        $.ajaxSetup({async: false});
        disconnect();
        clearInterval(msgTimer);
    });
    var initToolTip = function () {
        var tools = $('tool').getElementsByTagName('a');
        for (var v = 0; v < tools.length; v++) {
            var id = tools[v].id;
            id && i18n[id] && (tools[v].title = i18n[id]);
        }
        notify = ($.getCookie(notify_key) != 1);
        if (!notify) {
            var switcher = $('notifySwitcher');
            switcher && (switcher.className = 'btn btn-icon btn-notify-close');
        }
    };
    var initUI = function () {
        var eles = document.getElementsByTagName('span');
        for (var v = 0; v < eles.length; v++) {
            var id = eles[v].id;
            if (id && id.indexOf('vr_') == 0) {
                eles[v].innerHTML = i18n[id.substring(3)];
            }
        }
        initToolTip();


    };
    var composeCard = function () {
        var p = {
            ldept: i18n.dept,
            vdept: opt.deptName,
            lname: i18n.name,
            vname: opt.realName,
            lemail: i18n.email,
            vemail: $.escapeNull(opt.mail) || '&nbsp;',
            lphone: i18n.phone,
            vphone: $.escapeNull(opt.phone)
        };


        var tpl = '<div class="cust-card">'
            + '<span id="vr_dept">{ldept}</span><div>{vdept}</div>'
            + '<span id="vr_name">{lname}</span><div>{vname}</div>'
            + '<span id="vr_email">{lemail}</span><div><a href="mailto:{vemail}" title="{vemail}">{vemail}</a></div>'
            + '<span id="vr_phone">{lphone}</span><div>{vphone}</div>'
            + '</div>';
        $('card').innerHTML = $.tpl(tpl, p);
    };
    var showChatType = function () {
        if (showTypes) return;
        showTypes = true;
        var html = '<div class="chat-type-div">', opts = $(sqt) && $(sqt).options || [];
        html += opt.chatTypeTip;
        html += '<div  id="chatType" class="chat-types">';
        for (var o = 0; o < opts.length; o++) {
            html += '<a href="#" onclick="return false;" value="' + opts[o].value + '">' + opts[o].text + '</a>';
        }
        html += '</div></div>';
        doAppend(html, 'evtMsg');

        var tdiv = $('chatType');
        tdiv.onclick = function (e) {
            e = e || window.event;
            var tar = e.target || e.srcElement;
            if (tar.tagName.toLowerCase() == 'a') {
                $.hide(tdiv.parentNode);
                env.ctype = tar.value;
                env.ctypename = tar.innerHTML;
                env.cId && sendEvent('CHAT_CATEGORY', tar.value, tar.innerHTML);
            }
        }
    };
    var initQueue = function () {
        var qt = opt.queueTip, qto = opt.queueTimeout, qtot = opt.queueTimeoutTip;
        var appM = function (m) {
            m = $.tpl(m, {queue: '<span id="queueInfo">' + opt.queue + '</span>'});
            appendMsg(0, 'evtMsg ', m);
        };
        qt && appM(qt);
        if (qt && qtot) {
            setTimeout(function () {
                if (!env.cId) appM(qtot);
            }, qto * 1000);
        }
        queueInited = true;
    };
    var recvChatData = function (data) {
        if (data.cId) {
            opt.queue = 0;
            env.cId = data.cId;
            data.card && (env.n = data.card.userName) && $.apply(opt, data.card);
        } else {
            opt.queue = data.queue;
        }
        initChat();
    };
    var msgChange = function () {

    };

    var initEvent = function () {
        var t = $('message');
        $.attachE(t, 'focus', function () {
            focusMsg = true;
            if (opt.ios && userTriggerFocus) {
                setTimeout(function () {
                    t.blur();
                    t.focus();
                }, 200);

            }
            userTriggerFocus = !userTriggerFocus;
            popMessage({type: 'chatFocus', data: {}});

        });

        $.attachE(t, 'blur', function () {
            setTimeout(function () {
                focusMsg = false;
                popMessage({type: 'chatBlur', data: {}});
            }, 400)

        });
        $.attachE(t, 'keydown', function (event) {
            var e = event || window.event,
                isHotKey = (shtcut === 'Enter' && !e.ctrlKey && e.keyCode === 13) ||
                    (shtcut === 'CtrlEnter' && e.ctrlKey && e.keyCode === 13);
            if (isHotKey) {
                sendMessage();
                e.stopImmediatePropagation();
                e.preventDefault();
                return false;
            }
            return true;
        });
        $.attachE(t, 'keyup', function () {
            return false;
        });
    };
    var showQueueInfo = function (qu) {
        var dv = $('queueInfo');
        dv && (dv.innerHTML = qu);
        notConnected = $.tpl(i18n.queuing, [qu]);
    };
    var popMessage = function (obj) {
        var pWin = null;
        try {
            pWin = window.parent.window;
            pWin && pWin.window.postMessage && (pWin.window.postMessage(JSON.stringify(obj), '*'));
        } catch (e) {
        }


    };
    var initChat = function () {
        if (env.cId < 0) {
            var errors = [i18n.onlyone, i18n.accountInvalid, i18n.notOnline];
            appendMsg(errors[3 + env.cId]);

            return;
        }
        if (opt.meeting) {
            if (env.cId) {
                $.get(url + 'acceptChat', env, function (data, rst) {
                    if (data.status == 'success') {
                        meetingRoom.init(data.result);
                        startChat();
                    }
                });
            } else if (opt.meetingId) {
                var p = $.apply({}, env, {mId: opt.meetingId});
                $.get(url + 'joinMeeting', p, function (data, rst) {
                    if (data.status == 'success') {
                        meetingRoom.init(data.result);
                        startChat();
                    }
                });
            }
        } else if (opt.queue) {
            if (!queueInited) initQueue();
            showQueueInfo(opt.queue);

            setTimeout(function () {
                $.get(url + 'queue', env, function (data) {
                    if (data.status == 'error') {
                        appendMsg(i18n.onlyone);
                        return;
                    }
                    recvChatData(data);
                });
            }, 2 * 1000);
        } else {

            popMessage({
                type: 'chatBegin',
                data: {userId: opt.userName, userName: opt.realName, title: opt.realName + i18n.servicer,phone:opt.phone}
            });

            isConnected = true;
            env.ctype && sendEvent('CHAT_CATEGORY', env.ctype, env.ctypename);
            var mobileTitle = $('mobileTitle');
            if (conf.command == 'forceChat' && !conf.mobile) {
                commonTitle = opt.title;
                mobileTitle && (mobileTitle.innerHTML = commonTitle);
                var html = '<div class="time-start">' + $.dateString('HH:mm') + '</div>' + opt.realName + i18n.servicer;
                doAppend(html, 'hint-user');
            } else if (conf.mobile) {
                commonTitle = opt.realName + i18n.servicer;
                mobileTitle && (mobileTitle.innerHTML = commonTitle);

                if (mobileTitle && opt.phone) {
                    var phoneBtn = doc.createElement('a');
                    phoneBtn.setAttribute('class', 'user-phone');
                    phoneBtn.setAttribute('href', 'tel://' + opt.phone);
                    phoneBtn.setAttribute('target', '_blank');
                    $('header').insertBefore(phoneBtn, mobileTitle);
                }
            } else {
                appendMsg(2, 'evtMsg ', i18n.connected, opt.realName, i18n.servicer);
            }
            if (!$.isBlank(opt.hello) && opt.hello != '<br/>' && opt.hello != '&nbsp;' && !/^\s*<p>\s*&nbsp;\s*<\/p>/.test(opt.hello)) {
                appendMsg(0, 'helloDiv ', opt.hello);
            }
            if (!opt.cardImage && !force) composeCard();
            startChat();
        }
        //$('message').focus();
    };
    var loadRobotMessage = function () {
        var msgs = [];
        var db = window.localStorage;
        if (!db) return msgs;
        var key = env.c + ':' + env.site;
        var data = db.getItem(key);
        var comp;
        try {
            comp = data && JSON.parse(data) || {};
        } catch (e) {
            comp = {}
        }
        var rb = comp.robot || {};
        var now = +new Date();
        if (!rb || now - rb.last > 3600 * 1000)
            msgs = [];
        else
            msgs = rb.req || [];
        comp.robot = {};
        db.setItem(key, JSON.stringify(comp));
        return msgs;
    };
    var receivedMessage = {};
    var loadedMessage = {};
    var looper = new Looper(env, url, $('message'), opt);
    var startChat = function () {
        try {
            $.get(url + 'loadMessage', {c: env.c, n: env.n, u: env.u, v: env.v, cId: env.cId}, function (resp) {
                var msgs = resp.messages;
                if (msgs && msgs.length) {
                    for (var i = 0; i < msgs.length; i++) {
                        var m = msgs[i];
                        loadedMessage[m.msg] = 1;
                        if (receivedMessage[m.msg])
                            continue;
                        var d = new Date(m.time);

                        if (m.from.length > 30) {
                            appendMsg(4, 'msg-wrapper outMsg', i18n.you + i18n.say, '', $.dateString(null, d), 'msg', m.msg);
                        } else {
                            appendMsg(4, 'msg-wrapper inMsg', opt.realName + i18n.say, '', $.dateString(null, d), 'msg', m.msg);
                        }
                    }
                }
                if (queryParam.robotRedirect == 1) {
                    var history = loadRobotMessage();
                    if (history.length > 0) {
                        var msg = '';
                        for (var i = 0; i < history.length; i++) {
                            msg += (i + 1) + ':' + history[i] + '\r\n'
                        }
                        doSendMessage(msg);
                    }
                }
            });
        } catch (e) {

        }
        looper.start(parseMsg);

    };
    var missing = (function () {
        var mtimer = null;
        return function () {
            mtimer && clearTimeout(mtimer);
            var t = opt.missingTime || 1, m = opt.custMissing;
            mtimer = setTimeout(function () {
                m && appendMsg(m);
            }, t * 60 * 1000);
        }
    })();

    var doNotify = (function () {
        var tpl = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://active.macromedia.com/flash2/cabs/swflash.cab#version=4,0,0,0"  height="40" width="107">' +
            '<param name="movie" value="{sound}">' +
            '<param name="allowScriptAccess" value="allways">' +
            '<param name="quality" value="high"><param name="bgcolor" value="#FFFFFF">' +
            '<embed src="{sound}" quality="high" ' +
            ' bgcolor="#FFFFFF" type="application/x-shockwave-flash" allowScriptAccess="allways"' +
            ' pluginspage="http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash" height="40" width="107"></object>';
        var soundhtml = $.tpl(tpl, {sound: $.chatFile + '/swf/newmsg.swf'});

        return function () {
            if (!notify) return;
            var notifyWrapper = $('notifyWrapper');
            if (!notifyWrapper) {
                notifyWrapper = doc.createElement('div');
                notifyWrapper.id = 'notifyWrapper';
                doc.body.appendChild(notifyWrapper);
            }
            if ($.browser.supportAudio) {
                notifyWrapper.innerHTML = '<audio src="' + $.chatFile + '/images/ding.mp3"   autoplay="true"/>';
            } else {
                notifyWrapper.innerHTML = soundhtml;
            }
        };
    })();
    var receiveTimes = 0;
    var parseMsg = function (msgs) {
        receiveTimes++;
        var hasmsg = false, infomsg = 0, selfMsg = 0;
        if (msgs.length > 0) {
            lastMsgTime = new Date();
            hasmsg = true;
        }
        for (var v = 0; v < msgs.length; v++) {
            var msg = msgs[v];

            if (msg.control) {
                if ($.isBlank(msg.msg)) continue;
                var reg = /<([^>]+)>(.*)/;
                reg.exec(msg.msg);
                var ctrl = RegExp.$1.toUpperCase(), m = RegExp.$2;
                switch (ctrl) {
                    case 'END':
                        if (env.meeting) {
                            meetingRoom.remove(msg.from);
                        }
                        break;
                    case 'CLOSE':
                        disconnect();
                        break;
                    case 'ACCEPT':
                        acceptChat(m);
                        break;
                    case 'CHANGE_NICK':
                        appendMsg($.shortId(msg.from), execTpl(3, [i18n.changeNick, m], 0));
                        meetingRoom.update(msg.from, 'realName', m);
                        break;
                    case 'REMOVE':
                        appendMsg(i18n.removed);
                        env.cId = null;
                        isConnected = false;
                        break;
                    case 'TRANSCHAT':
                        transBegin(m);
                        break;
                    case 'TRANS':
                        transFinn();
                        break;
                    case 'FILE':
                        receiveMsg(msg.from, 'file', m);
                        break;
                    case 'SCREENSHOTS':
                        receiveMsg(msg.from, 'image', m);
                        break;
                    case 'SENDPHOTO':
                        m = m.split('#')[1];
                        receiveMsg(msg.from, 'image', m);
                        break;
                    case 'SENDPAGE':
                        receiveMsg(msg.from, 'url', m);
                        break;
                    case 'SENDMAIL':
                        receiveMsg(msg.from, 'mail', m);
                        break;
                    case 'ACK_REQUEST':
                        sendEvent('ACK_RESPONSE');
                        infomsg++;
                        break;
                    case 'ACK_RESPONSE':
                        infomsg++;
                        break;
                    case 'GETFOCUS':
                        infomsg++;
                        if (msg.from != env.u && msg.from != env.v) {
                            inputting();
                        }
                        break;

                    case 'ROBOTCHAT':
                        robotChat(m);
                        break;
                    case 'OPINION':
                        openOpinion();
                        break;
                    case 'VHISTORY':
                        infomsg++;
                        break;
                    case 'VRECORDER':
                        infomsg++;
                        break;
                    case 'MSG_SEND_ERROR':
                        infomsg++;
                        //appendMsg($.tpl(i18n.msgFail, [m]));
                        break;
                    case 'SCREEN_SEND_ERROR':
                    case 'FILE_SEND_ERROR':
                        appendMsg(i18n.fileFail);
                        break;
                }
            } else if (msg.robot) {
                robotResponse(msg);
            } else {
                if (msg.msg && receiveTimes == 1) {
                    if (loadedMessage[msg.msg])
                        return;
                    receivedMessage[msg.msg] = 1;
                }
                receiveMsg(msg.from, (env.meeting && msg.to != null ? 'private' : null), msg.msg);
                var selfMessage = msg.from == env.u || msg.from == env.v;
                if (selfMessage) selfMsg++;
                if (minimize && !selfMessage) {
                    freshMessage++;
                    refreshTitle();
                    var obj = {type: 'msg', data: {from: msg.from, msg: msg.msg, fromName: opt.realName}};
                    popMessage(obj);

                }
            }
        }
        if (hasmsg && (msgs.length > infomsg + selfMsg)) {
            missing();
            doNotify();
            if (env.cId)
                $.setCookie('newmsg_' + env.cId, 1, 120);
            if (!doc.hasFocus || !doc.hasFocus()) {
                focusMsg || window.focus();
                msgArrived();
            }
        }
    };

    var msgArrived = (function () {
        var titleTimer = 0, titleFlag = 0, titleArray = ['-', '-', '-', '>'];
        return function () {
            titleTimer && clearInterval(titleTimer);
            titleTimer = setInterval(function () {
                document.title = titleFlag++ % 2 ? '...' : i18n.msgArrived;
            }, 500);
            $.attachE($('message'), 'focus', function () {
                clearInterval(titleTimer);
                titleTimer = 0;
                titleFlag = 0;
                document.title = opt.title;
            });
        };
    })();
    var acceptChat = function (m) {
        var pms = m.split('#'), id = pms[0], name = pms[1], compId = pms[2], admin = pms[3];
        if (env.meeting) {
            meetingRoom.addPart(id, name, admin);
        } else {
            if (id == env.n || meetingRoom.initing) return;
            $.get(url + 'participants', env, function (data, rst) {
                meetingRoom.initing = true;
                meetingRoom.init(data.result);
                env.meeting = true;
            });
        }
        appendMsg($.shortId(id), i18n.inMeeting);
    };
    var disconnect = function (msg) {
        popMessage({type: 'chatEnd', data: {}});
        if (opt.queue) {
            $.get(url + 'exitQueue', env, function () {
            });
            opt.queue = 0;
        }
        if (env.cId) {
            looper.stop();
            $.get(url + 'endChat', env, function () {
            });
            appendMsg(msg || i18n.endChat);
            openOpinion({
                auto: true,
                onClose: function () {
                    env.cId = null;
                },
                closable: false
            });
            isConnected = false;
            if(conf.mobile){
                $('inputer').innerHTML=('<a href="#" class="btn-reload main-back-color" onclick="document.location.reload();return false">再次请求对话</a>');
            }
        }
        looper.stop();
    };
    var transBegin = function (m) {
        var ps = m.split(',');
        env.n = ps[1];
        opt.realName = ps[3];
        env.cId = ps[2];
        $.apply(opt, {dept: ps[4], email: ps[5], phone: ps[6]});
        isConnected = false;
        appendMsg(3, 'evtMsg', i18n.transChat, opt.realName);
        if (!opt.cardImage && !force)
            composeCard();
    };
    var transFinn = function () {
        appendMsg(i18n.transChatFinn);
        isConnected = true;
        looper.restart();

    };
    var robotChat = function (m) {
        if (m == 'begin') {
            robotChatting = true;
            appendMsg(i18n.toRobot);
        } else {
            robotChatting = false;
            appendMsg(i18n.leaveRobot);
        }
    };
    var replaceEmotion = (function () {
        var re = /\[:(\d+\.[^\]]+)\]/ig, re2 = /\[!(\d+)\]/ig;
        return function (str) {
            str = str.replace(re, '<img src="http://static.soperson.com/emotion/$1"/>');
            str = str.replace(re2, '<div class="emot2 emot-inline em$1">&nbsp;</div>');
            return str;
        };
    })();
    var receiveMsg = function (who, type, m) {
        if (!m) return;
        var cls = 'msg', name = null, say = i18n.say;
        var tstr = $.dateString();
        if (env.meeting) name = meetingRoom.getName(who);
        else name = (who == env.u || who == env.v ? i18n.you : $.shortId(who, opt.realName));

        if (conf.mobile && (type == 'image' || type == 'file')) {
            var now = +new Date();
            var id = 'attach' + now;
            appendMsg(4, 'msg-wrapper inMsg', name, '', $.dateString(), 'msg', '<div id="' + id + '"></div>');
            renderFile($(id), m);
            return;
        }

        switch (type) {
            case 'file':
                say = i18n.sendFile;
                m = execTpl(5, [m, i18n.download], 0);
                break;
            case 'image':
                cls = 'imgMsg';
                say = i18n.sendImg;
                m = execTpl(6, [m, i18n.fullImg], 0);
                break;
            case 'private':
                say = execTpl(i18n.whisper, [i18n.you], 0);
            default:
                if (conf.mobile) {
                    m = $.parsePhone(m);
                }

                m = $.parseEmail($.parseURL(m));
                m = m.replace('\/', function () {
                    return '/';
                });
                m = replaceEmotion(m);
                break;
        }
        appendMsg(4, 'msg-wrapper inMsg', name, say, tstr, cls, m);
    };
    var templates = ['{0}',
        '<span class="nameTag">{0}</span>{1}',
        '{0}<span class="nameTag">{1}</span>{2}',
        '{0}<span class="nameTag">{1}</span>',
        '<div class="titleTag"><span class="nameTag">{0}</span>{1}<span class="createTime">{2}</span></div><div class="m-photo-head"></div><div class="{3}">{4}</div><div class="msg-cursor"></div><div class="msg-cursor msg-cursor-inner"></div> ',
        '<a href="{0}" target="_blank">{1}</a>',
        '<a href="{0}" target="_blank"><img src="{0}" height="100" width="100"/></a><div><a href="{0}" target="_blank">{1}</a></div>',
        '{0}{1}({2})',
        '<li class="ansItem"><div class="ansTitle"><a href="#" onclick="$.toggle(\'{0}\');return false">{1}</a></div><div class="ansContent" id="{0}" style="display:none">{2}</div></li>'
    ];
    var parseTpl = function () {
        var args = arguments;
        var tId = args[0], cls = args[1], start = 2;
        if (args.length == 1 || args.length == 2) {
            tId = args.length - 1;
            cls = 'evtMsg';
            start = 0;
        }
        return {msg: execTpl(tId, args, start), clz: cls};
    };
    var appendMsg = function () {
        var obj = parseTpl.apply(null, arguments);
        doAppend(obj.msg, obj.clz);
    };
    var doAppend = function (msg, clz) {
        var tar = doc.createElement('div');
        clz = clz + (notFirst++ ? '' : ' firstMsg');
        clz && (tar.className = clz);
        tar.innerHTML = msg;
        if (conf.mobile && notFirst === 1) {
            tar.style.visibility = 'hidden';
        }
        var ca = $('chatDiv');
        ca.appendChild(tar);

        var stage = $('stage');
        if (conf.mobile) {
            var cl = document.createElement('div');
            cl.className = 'clear';
            ca.appendChild(cl);

            var marginTop = window.innerHeight - 130 - ca.offsetHeight;
            var firstEle = $('.firstMsg');
            firstEle.style.marginTop = (marginTop<25?25:marginTop) + 'px';
            firstEle.style.visibility = 'visible';

        }
        setTimeout(function () {
            (conf.mobile ? stage : ca).scrollTop += 50000;
        }, 200)


    };
    var execTpl = function (tId, args, start) {
        var tmp = (typeof tId == 'number' ? templates[tId] : tId);
        return $.tpl(tmp, Array.prototype.slice.call(args, start || 0));
    };

    var inputting = function () {
        var id = 'typing';
        $.show(id);
        if (inputtingTimer != null) {
            clearTimeout(inputtingTimer);
            inputtingTimer = null;
        }
        inputtingTimer = setTimeout(function () {
            inputtingTimer = null;
            $.hide(id);
        }, 2000);
    };
    var doSendMessage = function (msg) {
        if (msg.length === 0) {
            return;
        }

        msg = $.escapeHTML(msg);

        var smsg = $.parseEmail($.parseURL(msg));
        if (conf.mobile) {
            smsg = $.parsePhone(smsg);
        }
        smsg = replaceEmotion(smsg);
        if (msg.length > maxAllowLen) {
            alert(i18n.maxLen + ' ' + msg.length + '/' + maxAllowLen);
            return;
        }
        var say = (env.meeting && meetingRoom.getCurrent() != '') ? execTpl(i18n.whisper, [meetingRoom.getName(meetingRoom.getCurrent())], 0) : i18n.say;
        appendMsg(4, 'msg-wrapper outMsg', i18n.you, say, $.dateString(), 'msg', smsg);

        if (conf.mobile) {
            var inputer = $('inputer');
            inputer && (inputer.style.height = '60px');
        }
        popMessage({type: 'chatFocus', data: {}});
        var p = $.apply({}, env, {flag: false, robot: robotChatting, msg: msg});
        delete p.n;
        if (env.meeting) {
            var curr = meetingRoom.getCurrent();
            if (curr) {
                p.n = curr;
            }
        }
        !p.robot || (p.type = -1);
        looper.sendMessage(p, function (dat) {
            var mg;
            if (dat.status == 'success') {
                if (robotChatting && dat.robot) {
                    robotResponse(dat);
                }
            } else if (dat.status == 'error') {
                mg = i18n.sendFail;
                mg += (dat.error == 'cancel' && i18n.empty || dat.error == 'toomany' && i18n.maxLen || i18n.unknown);
                appendMsg(mg);
            }
        }, function () {
            appendMsg(i18n.sendFail + i18n.breakingConn);
        });

    };

    $.apply(window, {

        appendFile: function (url, isOut, who) {

            appendMsg(4, isOut && 'outMsg' || 'inMsg', who, i18n.sendImg, $.dateString(), 'imgMsg', appendMsg(execTpl(6, [url, i18n.fullImg], 0)));
        },

        doSendFile: function (data, att) {

            var prefix = ($.browser.encrypt ? 'https' : 'http') + '://a.looyu.com/';
            var url = prefix + 'upload/temp/' + env.c;

            $.ajax({
                url: url,
                type: 'POST',
                async: true,
                dataType: 'json',
                contentType: false,
                processData: false,
                data: data,
                complete: function (xhr, status) {
                    if (status !== 'success') {
                        att.innerHTML = i18n.sendFileFail;
                    }
                }, success: function (data) {
                    if (data.err) {
                        att.innerHTML = i18n.sendFileFail + ':' + data.hint;
                        return;
                    } else {
                        var url = prefix + 'temp/' + env.c + '/' + data.id;
                        renderFile(att, url);
                        if (detectFileType(url) == 'img') {
                            sendEvent('SCREENSHOTS', url.replace('https://', 'http://'));
                        } else {
                            sendEvent('FILE', url);
                        }
                    }
                }

            })
        },
        ajaxSendFile:function (fileObj, fileName) {
            var now = +new Date();

            appendMsg(4, 'msg-wrapper outMsg', i18n.you, '', $.dateString(), 'msg',
                '<div id="attach' + now + '">' + i18n.sendFileStart + '</div>');
            var att = $('attach' + now);
            var fileType = detectFileType(fileName);

            if (fileType == 'img' && fileObj.size > 100 * 1000) {
                lrz(fileObj, {
                    width: 1360
                }).then(function (rst) {
                    doSendFile(rst.formData, att);

                });
            } else {
                var data = new FormData();
                data.append('file', fileObj);
                doSendFile(data, att);
            }
        },
        previewFileUpload: function () {
            var fileEle = $('mobileUpload'), fileName = fileEle.value;
            var fileObj = fileEle.files[0];
            ajaxSendFile(fileObj,fileName);

        },
        robotResponse: function (dat) {
            var ans = dat.answers;
            if (!ans || ans.length == 0) {
                appendMsg(4, 'msg-wrapper inMsg', i18n.robot, i18n.say, $.dateString(), 'msg', opt.robotNoAnswer);
            } else {
                var mg = i18n.guess;
                var aid = 'ans' + $.genID();
                mg += '<ul>';
                for (var i = 0; i < ans.length; i++) {
                    mg += execTpl(8, [aid + i, ans[i].question, ans[i].answer], 0);
                }
                mg += '</ul>';
                appendMsg(4, 'msg-wrapper inMsg', i18n.robot, i18n.say, $.dateString(), 'answer', mg);

            }
        },

        sendMessage: function () {
            if (!env.meeting && !isConnected) {
                if (!opt.queue) {
                    alert(notConnected || i18n.disconnected);
                    return;
                }
            }
            var msgEle = $('message');
            var msg = msgEle.value;
            msgEle.value = '';
            doSendMessage(msg);
            if (opt.ios) {
                userTriggerFocus = false;
                msgEle.focus();
            }

        },

        sendEvent: function () {
            var arg = arguments;
            if (arg.length == 0) return;
            var type = arg[0], p1 = arg[1], p2 = arg[2], m = arg[3];

            var p = $.apply({}, env, {flag: true, robot: false, type: type});
            delete p.n;
            if (env.meeting) {
                var curr = meetingRoom.getCurrent();
                if (curr) {
                    p.n = curr;
                }
            }
            if (p1 != null) {
                p.p1 = p1;
                p2 == null || (p.p2 = p2);
            }
            $.get(url + 'postMessage', p, function () {
            }, m);
        },
        appendEmot: function (str, clz) {
            if (!emots[str]) emots[str] = '<div class="emot2 emot-inline ' + clz + '"></div>';
            $('message').value += str;
        },
        showEmot: (function () {
            var emotInited = false;
            return function () {
                if (!emotInited) {
                    $('emotDiv').appendChild($.emotTable());
                    emotInited = true;
                }
                showDiv('emotDiv');
            }
        })(),
        showDiv: function (id, once) {
            setTimeout(function () {
                $.toggle(id);
                var clk = function (e) {
                    if (once || !$.clickIn(id, e)) {
                        $.hide(id);
                        $.detachE(doc, 'click', clk);
                    }
                };
                $.attachE(doc, 'click', clk);

            }, 0);
        },

        sendFile: function () {
            var f = doc.forms['uploadForm'], v = f.file.value;
            if (v && v != '') {
                f.submit();
                $.show('fileSending');
            }
        },
        cancelFile: function () {
            if (confirm(i18n.cancelFile)) {
                $('uf').src = 'blank.html';
                $.hide('fileSending');
                $.hide('fileDiv');
            }
        },
        uploadComplete: function (status, info) {
            $.hide('fileSending');
            $.hide('fileDiv');
            if ($.isBlank(status)) {
                appendMsg(i18n.sendFinn);
                sendEvent('FILE', info);
            } else {
                var p1, p2;
                if (status == 'overMaxSize') {
                    p1 = i18n.fileSize;
                    p2 = info + 'M';
                } else if (status == 'invalidFileType') {
                    p1 = i18n.fileType;
                    p2 = info;
                } else {
                    p1 = i18n.unknown;
                    p2 = info;
                }
                appendMsg(7, 'evtMsg', i18n.fileFail, p1, p2);
            }
        },
        showLang: function () {
            if (!$('langDiv')) {
                $.buildMenu('langDiv', {bottom: '57px', left: '80px'},
                    [
                        {sid: $.genID(), lid: 'lang_sc', text: '简体中文', cb: selectLang.delegate(null, ['sc'])},
                        {sid: $.genID(), lid: 'lang_tc', text: '繁體中文', cb: selectLang.delegate(null, ['tc'])},
                        {sid: $.genID(), lid: 'lang_en', text: 'English', cb: selectLang.delegate(null, ['en'])}
                    ])
            }
            showDiv('langDiv', true);
        },
        selectLang: function (lg) {
            if (opt.lang != lg) {
                $.removeClass(doc.body, 'lg-' + opt.lang);
                $.addClass(doc.body, 'lg-' + lg);
                opt.lang = lg;
                if (!lang[lg]) {
                    var scr = doc.createElement('script');
                    scr.setAttribute('type', 'text/javascript');
                    doc.getElementsByTagName('head')[0].appendChild(scr);
                    if ($.browser.msie) {
                        scr.onreadystatechange = initUI;
                    }
                    else scr.onload = initUI;
                    scr.setAttribute('src', $.chatFile + '/lang/' + lg + '.js');
                    return;
                }
                i18n = lang[lg];
                initUI();
            }
        },
        showHotKey: function () {
            if (!$('hotKeyDiv')) {
                $.buildMenu('hotKeyDiv', {bottom: '14px', right: '145px'},
                    [
                        {sid: 'vr_enterSend', lid: 'keyEnter', text: i18n.enter, cb: hotkey.delegate(null, ['Enter'])},
                        {
                            sid: 'vr_ctrlEnterSend',
                            lid: 'keyCtrlEnter',
                            text: i18n.ctrlEnter,
                            cb: hotkey.delegate(null, ['CtrlEnter'])
                        }
                    ], (shtcut == 'Enter' ? 0 : 1));
            }
            showDiv('hotKeyDiv', true);
        },

        saveRecord: function () {
            try {
                var ws = window.open(), time = new Date(), filename = time.toLocaleDateString() + i18n.save + '.htm',
                    savestyle = '<style type="text/css"> body{font-size:12px;line-height:20px} .evtMsg,.inMsg,.outMsg{ padding-left:10px;} .eventMsg{color:#000000;}.evtMsg .nameTag{ color:red;} .inMsg{color:blue} .outMsg{color:red} .inMsg .msg,.outMsg .msg{text-indent:24px} #inviteWaiter{margin-left:20px} .createTime {font-size: 11px;	font-family: "times new roman", times, serif;	color: #996633;}</style>';
                var d = ws.document || ws.documentElement;
                d.open('text/html', 'utf-8');
                d.write('<html><body><head>' + savestyle + '</head>');
                d.write($('chatDiv').innerHTML);
                d.write('</body></html>');
                d.execCommand('SaveAs', true, filename);
                ws.close();
            } catch (e) {
                alert(e);
            }
        },
        showHotQ: function () {
            var ifm = $('hotQFrame');
            if (!ifm) {
                $('hotMsgDiv').innerHTML = '<iframe frameborder="0" id="hotQFrame" src="hotQuestion.jsp?c=' + env.c + '"></iframe>';
            }
            showDiv('hotMsgDiv');
        },
        showFAQ: function () {
            openWindow(basePath + 'faq.jsp?c=' + env.c, 'FAQ', 800, 600);
        },
        appendHotQ: function (w) {
            var m = $('message');
            m.focus();
            m.value += w;
            $.hide('hotMsgDiv');
        },
        hotkey: function (k) {
            $.removeClass('key' + shtcut, 'active');
            shtcut = k;
            $.addClass('key' + shtcut, 'active');
        },
        exit: function () {
            if (env.cId && conf.mobile) {
                showConfirm(confirmClose);
            } else {

                if (opinioned || !opt.autoOpinion) {
                    if (confirm(i18n.exitConfirm)) {
                        disconnect();
                        $.closeWindow();
                    }
                } else {
                    openOpinion({
                        auto: true, onClose: function () {
                            disconnect();
                            $.closeWindow();
                        },
                        closable: false
                    });
                }
            }
        },
        changeNick: (function () {
            var nickWin, tpl = '<table cellpadding="0" cellspacing="0"><tr><td></td></tr><tr><td>'
                + i18n.nick + '</td><td><input type="text" id="nickname"/><span>'
                + i18n.maxNick + '</span></td></tr></table>';

            return function () {
                if (!nickWin) {
                    p = doc.createElement('DIV');
                    p.id = 'nickDiv';
                    doc.body.appendChild(p);
                    p.innerHTML = tpl;
                    var winCfg = {
                        title: i18n.nick, content: p, handler: function () {
                            var n = $('nickname').value;
                            if (n == '') return false;
                            if (n.length > 7) {
                                alert(i18n.nick + i18n.maxNick);
                                return false;
                            }
                            if (meetingRoom.hasNick(n)) {
                                alert(i18n.exist);
                                return false;
                            }
                            meetingRoom.update(env.u, 'realName', n);
                            sendEvent('CHANGE_NICK', n);
                            return true;
                        }
                    };
                    if (!conf.mobile) {
                        winCfg.width = 300;
                        winCfg.height = 200;
                    }
                    nickWin = new $.win(winCfg);
                }
                nickWin.show();
            }
        })(),
        startScreenShot: function () {
            var setupSCActivex = function () {
                var lscid = $('LOOYU_SC_OBJECT');
                if (lscid != null)
                    lscid.parentNode.removeChild(lscid);

                var chead = doc.getElementsByTagName('head')[0];
                var cobj = doc.createElement('object');
                cobj.setAttribute('id', 'LOOYU_SC_OBJECT');
                cobj.setAttribute('classid', 'clsid:011A91BE-8C61-4375-9479-F5B1F56E5178');
                //cobj.setAttribute("codebase","dylooyu.CAB#version=1,0,0,1");
                chead.appendChild(cobj);
                lscid = $('LOOYU_SC_OBJECT');
            };
            setupSCActivex();
            try {
                var tm = 2;
                var tvcom = null;
                var ret = LOOYU_SC_OBJECT.AddCom(basePath + 'activex/looyusc.dat', 'looyusc.dll', '1.0.0.4', 1);
                if (ret == 0) {
                    tvcom = LOOYU_SC_OBJECT.CreateCom('looyusc.dll', '1.0.0.1');
                    if (tvcom != null) {
                        var tmpfilename = tvcom.Snaper(tm, basePath + 'upsc.jsp', '213232323');
                        if (tmpfilename.indexOf('error:') == 0) {
                            alert(tmpfilename);
                            return;
                        }
                        eval('var resp=' + tmpfilename);
                        if (resp.result == 'success') {
                            var downfile = basePath + '/down.jsp?file=' + resp.value;
                            sendEvent('SCREENSHOTS', downfile);
                            appendMsg(4, 'outMsg', i18n.you, i18n.sendImg, $.dateString(), 'imgMsg', appendMsg(execTpl(6, [downfile, i18n.fullImg], 0)));
                        } else {
                            alert(resp.value);
                        }
                    }
                }
            } catch (e) {
                window.open(basePath + '/activex/plugin.jsp?ver=' + opt.version, 'activex');
            }
        },

        radioClick: function (ra) {
            (ra.value < 2 ? $.show : $.hide)('descRequired');
        },
        openOpinion: (function () {
            var opWin;
            return function (p) {
                p = p || {};
                if ((p.auto && (opinioned || !opt.autoOpinion)) || !env.cId || force) {
                    if (p.onClose) p.onClose();
                    return;
                }
                if (!opWin) {
                    var wcfg = {
                        title: i18n.opinion, content: $('opinionWin'), closable: true,
                        handler: function () {
                            var param = {
                                c: env.c,
                                chatId: env.cId,
                                command: 'opnion'
                            }, form = document.forms['opinionForm'], eles = form.elements;
                            for (var v = 0; v < eles.length; v++) {
                                var name = eles[v].name, value = $.value(eles[v]);
                                if (value) param[name] = value;
                            }
                            if (param['opinion'] < 2 && $.isBlank(param['description'])) {
                                alert(i18n.reason);
                                return false;
                            }
                            $.get('chat.do', param, function (data, rst) {
                                opinioned = true;
                            });
                            return true;
                        }
                    };
                    if (!conf.mobile) {
                        wcfg.width = 400;
                        wcfg.height = 300;
                    }
                    opWin = new $.win(wcfg);
                }
                $.apply(opWin, p);
                opWin.show();
            };
        })(),
        switchNotify: function () {
            notify = ($.getCookie(notify_key) == 1);
            $.setCookie(notify_key, 1, notify ? -3600 : null);
            var switcher = $('notifySwitcher');
            var baseClz = 'btn btn-icon btn-notify-';
            if (switcher) {
                switcher.className = (baseClz + (notify ? 'open' : 'close'));
            }

        }
    });
    var openWindow = function (u, name, w, h) {
        var param = 'location=no,scrollbars=yes,status=yes,toolbar=no,location=no,menu=no,top=100,left=200,resizable=yes';
        param += ',width=' + w + ',height=' + h;
        window.open(u, name, param);
    };

    function MeetingRoom() {
        this.parts = [];
        this.initing = false;
    }

    MeetingRoom.prototype = {
        init: function (o) {
            $('card').innerHTML = '<div class="meetingTitle"><span id="vr_meetingTitle">' + i18n.meetingTitle + '</span></div><div id="participant"></div>';
            $('card').style.background = 'none';
            $('participant').onclick = function (e) {
                if (e) e.stopPropagation();
                else window.event.cancelBubble = true;
            };
            env.meeting = true;
            this.list = $('participant');
            var p = o.parts;
            !p || (env.cId = o.cId);
            p || (p = o);
            this.add('', i18n.all, false);
            for (var v = 0; v < p.length; v++) {
                !$.isVisitor(p[v].name) || (p[v].realName = $.shortId(p[v].name, p[v].realName));
                this.add(p[v].name, p[v].realName, p[v].admin);
            }
            this.parts = this.parts.concat(p || []);
            this.setCurrent('');

            appendMsg(i18n.joinMeeting);
        },
        addPart: function (name, real, adm) {
            var rl = ($.isVisitor(name) || real == null) ? $.shortId(name) : real;
            this.parts.push({name: name, realName: rl, admin: adm});
            this.add(name, rl, adm);
        },
        add: function (name, real, adm) {
            var v = doc.createElement('div');
            var isMe = (name == env.u), isVst = $.isVisitor(name);
            var itid = 'mp_' + name,
                itclass = 'partItem' + (isMe ? ' selfItem' : '' ) + (isVst ? ' vstItem' : ' custItem') + (adm ? ' adminItem' : '');
            v.id = itid;
            v.className = itclass;
            v.innerHTML = '<span>' + real + '</span>';
            v.onmouseover = function () {
                $.addClass(itid, 'partItemOver');
            };
            v.onmouseout = function () {
                $.removeClass(itid, 'partItemOver');
            };
            var me = this;
            if (!isMe) v.onclick = function () {
                me.setCurrent(name)
            };
            else {
                v.innerHTML += '<a  onclick="changeNick();return false;">&nbsp;&nbsp;' + i18n.nick + '</a>'
            }
            this.list.appendChild(v);
        },
        remove: function (id) {
            appendMsg(this.getName(id), i18n.leave);
            if (id == this.current) {
                this.setCurrent('')
            }
            this.list.removeChild($('mp_' + id));
            Array.prototype.splice(this.getSeq(id), 1);
        },
        update: function (id, col, value) {
            var v = this.getPart(id);
            eval('v.' + col + '="' + value + '"');
            if (col == 'realName') $('mp_' + v.name).getElementsByTagName('span')[0].innerHTML = value;
        },
        getPart: function (id) {
            for (var v in this.parts) {
                if (this.parts[v].name == id) return this.parts[v];
            }
            return null;
        },
        getName: function (id) {
            if (id == null || id == '')
                return i18n.all;
            var index = this.getSeq(id);
            return index == -1 ? '' : this.parts[index].realName;
        },
        getSeq: function (id) {
            var p = this.parts;
            for (var v = 0; v < p.length; v++) {
                if (p[v].name == id) return v;
            }
            return -1;
        },
        getCurrent: function () {
            return this.current
        },
        setCurrent: function (id) {
            if (id == null) id = '';
            if (this.current != null) {
                $.removeClass('mp_' + this.current, 'partSelect');
            }
            $.addClass('mp_' + id, 'partSelect');
            this.current = id;
        },
        hasNick: function (n) {
            for (var v in this.parts) {
                if (this.parts[v].realName == n) return true;
            }
            return false;
        }
    };
    var meetingRoom = new MeetingRoom();

})(conf);
