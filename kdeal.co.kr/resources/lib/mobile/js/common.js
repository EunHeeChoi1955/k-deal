
// 쿠폰할당..
function assignCoupon( couponIdx ) {
    $.ajax({
             'url'     : '/m/api/coupon/download'
            ,'type'    : 'POST'
            ,'data'    :  {'couponIdx' : couponIdx}
            ,'dataType': 'text'
            ,'success' : function(data, textStatus, jqXHR){
                AlertUtil.open("성공적으로 발급되었습니다.");
            }
            ,'error' : function(jqXHR, textStatus, message){

                if(jqXHR.status == 401) {
                    ConfirmUtil.open("로그인이 필요한 서비스입니다.<br> 로그인 하시겠습니까?",function(){movePage("/m/login")});
                } else {
                    AlertUtil.open('' + jqXHR.responseText );
                }
            }
    });
}

// 삼성 리워즈로 쿠폰 전환
function assignCouponRewards( couponIdx, cost, couponPromotionId, callback) {
    $.ajax({
             'url'     : '/m/api/coupon/changeRewards'
            ,'type'    : 'POST'
            ,'data'    :  {'couponIdx' : couponIdx, 'cost' : cost, 'couponPromotionId' : couponPromotionId}
            ,'dataType': 'text'
            ,'success' : function(data, textStatus, jqXHR){
                AlertUtil.open("성공적으로 발급되었습니다.", function() {
                    if($.isFunction(callback)) {
                        callback.call();
                    }
                });
            }
            ,'error' : function(jqXHR, textStatus, message){

                if(jqXHR.status == 401) {
                    ConfirmUtil.open("로그인이 필요한 서비스입니다.<br> 로그인 하시겠습니까?",function(){movePage("/m/login")});
                } else {
                    AlertUtil.open('' + jqXHR.responseText );
                }
            }
    });
}


function movePage(url) {
    window.location.href = url;
}

// 숫자변환 툴..
var NumberTool = function(){
    var parse = function(val) {
        var _tmp = parseInt(val);
        // if (Number.isNaN(_tmp)) {
        //     return 0;
        // }
        if ( typeof(_tmp) !== 'number' ) { return 0;}
        return _tmp;
    }

    return {
        'parseInt' : parse
    }
}();

// IE11 대응.
var IntegerTool = function(){
    var parse = function(val) {
        var _tmp = parseInt(val);
        // if (Number.isNaN(_tmp)) {
        //     return 0;
        // }
        if ( typeof(_tmp) !== 'number' ) { return 0;}
        return _tmp;
    }

    return {
        'parse' : parse
    }
}();

function NumberFormat(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
} // NumberFormat

function NumberFormatToNumber(numberFormat) {
    return NumberTool.parseInt(numberFormat.replace(/,/gi , ""));
}

function getSalePercent(price, customerprice) {

    if (customerprice == null || customerprice == 0 || price == customerprice) {
        return "";
    }
    var percent = (customerprice - price) * 100.0 / customerprice;

    return Math.round(percent) + "";

} // getSalePercent



function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}


function validateName(userName) {
    var nameRegExp = /^[가-힣a-zA-Z]+$/;
    return nameRegExp.test(userName);
}

function validateLocation(userName) {
    var nameRegExp = /^[가-힣a-zA-Z0-9]+$/;
    return nameRegExp.test(userName);
}

function validateMobilePhone(mobileNumber){
    var telRegExp = /^01([0|1|6|7|9]?)?([0-9]{3,4})?([0-9]{4})$/;
    return telRegExp.test(mobileNumber);
}

function validateTel(tel){
    var telRegExp = /^\d{2,3}\d{3,4}\d{4}$/;
    return telRegExp.test(tel);
}

function chkPwd(pw, pw_chk){

    var pwdRegExp = /(\w)\1\1\1/;
    var num = pw.search(/[0-9]/g);
    var eng = pw.search(/[a-z]/ig);
    var spe = pw.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);

    if(pw != pw_chk){
        return msg = "비밀번호가 서로 다릅니다."
    } else if(pw.length < 6 || pw_chk.length > 15){
        return msg = "비밀번호는 6-15자 이내로 입력하셔야 합니다."
    } else if(pwdRegExp.test(pw) || pwdRegExp.test(pw_chk)){
        return msg = "연속된 4자리 숫자가 포함된 비밀번호는 사용할 수 없습니다."
    } else if( (num < 0 && eng < 0) || (eng < 0 && spe < 0) || (spe < 0 && num < 0) ){
        return msg = "비밀번호는 영문 숫자 특수문자 2가지 이상으로 입력하셔야 합니다."
    } else{
        return true;
    }
}

function continuousCharacterCheck(password) {
    var max = 3;
    var i, j, k, x, y;
    var buff = ["0123456789", "abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
    var src, src2, ptn="";

    for(i=0; i<buff.length; i++){
        src = buff[i]; // 0123456789
        src2 = buff[i] + buff[i]; // 01234567890123456789
        for(j=0; j<src.length; j++){
            x = src.substr(j, 1); // 0
            y = src2.substr(j, max); // 0123
            ptn += "["+x+"]{"+max+",}|"; // [0]{4,}|0123|[1]{4,}|1234|...
            ptn += y+"|";
        }
    }
    ptn = new RegExp(ptn.replace(/.$/, "")); // 맨마지막의 글자를 하나 없애고 정규식으로 만든다.

    if(ptn.test(password)) return true;
    return false;
}

function checkPassword(password, password2, phone) {
    var phone1 = phone.slice(3, 7);
    var phone2 = phone.slice(7, 11);
    var num = /[0-9]/g.test(password);
    var eng = /[a-zA-Z]/g.test(password);
    var spe = /[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/g.test(password);
    var allow = /^([a-zA-Z0-9\!\@\#\$\%\^\&\*\?\_\~])*$/g.test(password);

    if(password.length < 6 || password.length > 20) {
        return "비밀번호는 6자 이상, 20자 이하로 구성하세요.";
    }
    else if(allow == false || ((eng == true && num == true) || (eng == true && spe == true)) == false) {
        return "비밀번호는 영문,숫자,특수문자(!@$%^&* 만 허용)를 \n2가지 이상 조합하여 6~20자로 구성하세요.";
    }
    else if(password.indexOf(phone1) != -1 || password.indexOf(phone2) != -1) {
        return "비밀번호에 전화번호를 포함할 수 없습니다.";
    }
    else if(continuousCharacterCheck(password) == true) {
        return "비밀번호에 연속된 숫자 혹은 문자를 포함할 수 없습니다.";
    }
    else if(password != password2) {
        return "비밀번호가 서로 다릅니다.";
    }

    return true;
}

function setCookie2(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie2(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function setCookie(key, value, length, expires, path, domain, secure) {

    domain = domain ? domain : ".picnique.co.kr";
    var date = new Date();
    expires = date.getTime()+(30*24*60*60*1000);
    path = path ? path : "/";
//    secure = secure ? secure : "secure";

    var list = getCookie(key);

    if(list == "") {
        document.cookie = key + "=" + value + ((expires) ? "; expires=" + expires : "") +
                                                 ((path) ? "; path=" + path : "") +
                                               ((domain) ? "; domain=" + domain : "") +
                                               ((secure) ? "; secure=" + secure : "");

    } else {
        var valList = list.split("|");

        for(var i=0; i<valList.length; i++) {
            if(value == valList[i]) {
                removeCookie(key, value);
                document.cookie = key + "=" + value + "|" + getCookie(key) + ((expires) ? "; expires=" + expires : "") +
                                                                             ((path)    ? "; path="    + path : "") +
                                                                             ((domain)  ? "; domain="  + domain : "") +
                                                                             ((secure)  ? "; secure="  + secure : "");

                return true;
            }
        }

        if(valList.length > (length-1)) {
            list = "";
            for(var i=0; i<length-1; i++) {
                list += valList[i] + "|";
            }
            list = list.substring(0, list.length - 1)
        }

        document.cookie = key + "=" + value + "|" + list + ((expires) ? "; expires=" + expires : "") +
                                                           ((path)    ? "; path="    + path : "") +
                                                           ((domain)  ? "; domain="  + domain : "") +
                                                           ((secure)  ? "; secure="  + secure : "");

    }


} // setCookie

function getCookie(key) {

    var cookieList = "";
    var i, x, y, z = document.cookie.split(";");

    for (i = 0; i < z.length; i++) {
        x = z[i].substring(0, z[i].indexOf("="));
        y = z[i].substring(z[i].indexOf("=") + 1);
        x = x.replace(/^s+|s+$/g, "");

        if (x.trim() == key) {
            cookieList = y.trim();
            break;
        }
    }

    return cookieList;

} // getCookie

function removeCookie(key, trgt, expires, path, domain, secure) {

    domain = domain ? domain : ".picnique.co.kr";
    var date = new Date();
    expires = date.getTime()+(30*24*60*60*1000);
    path = path ? path : "/";
//    secure = secure ? secure : "secure";

    var currCookie = getCookie(key);
    var newCookie = "";

    var list = currCookie.split("|");

    if(list.length > 1) {
        for(num in list) {
            if(trgt != list[num]) {
                newCookie += list[num] + "|";
            }
        }

        document.cookie = key + "=" + newCookie.substring(0, newCookie.length - 1) + ((expires) ? "; expires=" + expires : "") +
                                                                                     ((path)    ? "; path="    + path : "") +
                                                                                     ((domain)  ? "; domain="  + domain : "") +
                                                                                     ((secure)  ? "; secure="  + secure : "");
        if(key == 'searchHistory') {
            eventOnSearchInput();
        }

    } else {
        document.cookie = key + "=" + ((expires) ? "; expires=" + expires : "") +
                                      ((path)    ? "; path="    + path : "") +
                                      ((domain)  ? "; domain="  + domain : "") +
                                      ((secure)  ? "; secure="  + secure : "");

        if(key == 'searchHistory') {
            $("#divSearchHistoryWrap").hide();
            $("#inputSearch").focus();
        }
    }

} // removeCookie


function setStorageData(key, value, length) {
    var lStorage = storage(StorageType.LOCAL_TYPE);

    var list = lStorage.getData(key);

    if(list == "" || list == null) {
        lStorage.setData(key, value)
    } else {
        var valList = list.split("|");

        for(var i=0; i<valList.length; i++) {
            if(value == valList[i]) {
                removeStorageData(key, value);
                if (valList.length > 1) {
                    lStorage.setData(key, value + "|" + lStorage.getData(key));
                } else {
                    lStorage.setData(key, value);
                }

                return true;
            }
        }

        if(valList.length > (length-1)) {
            list = "";
            for(var i=0; i<length-1; i++) {
                list += valList[i] + "|";
            }
            list = list.substring(0, list.length - 1)
        }

        lStorage.setData(key, value + "|" + list)
    }
}


function removeStorageData(key, trgt) {
    var lStorage = storage(StorageType.LOCAL_TYPE);

    var currCookie = lStorage.getData(key);
    var newCookie = "";

    var list = currCookie.split("|");

    if(list.length > 1) {
        for(num in list) {
            if(trgt != list[num]) {
                newCookie += list[num] + "|";
            }
        }
        lStorage.setData(key, newCookie.substring(0, newCookie.length - 1));
    } else {
        lStorage.setData(key, "");
    }
}

function removeStorageDataByIndex(key, index) {
    var lStorage = storage(StorageType.LOCAL_TYPE);

    var currCookie = lStorage.getData(key);
    var newCookie = "";

    var list = currCookie.split("|");

    if(list.length > 1) {
        for(num in list) {
            if(index != num) {
                newCookie += list[num] + "|";
            }
        }
        lStorage.setData(key, newCookie.substring(0, newCookie.length - 1));
    } else {
        lStorage.removeData(key);
    }
}


function getStorageData(key) {
    var lStorage = storage(StorageType.LOCAL_TYPE);
    var cookieList = lStorage.getData(key);

    return cookieList;
}

function getStorageDataIndex(key, value) {
    var lStorage = storage(StorageType.LOCAL_TYPE);
    var cookie = lStorage.getData(key);
    var cookieList = cookie.split("|");

    for(var i=0; i<cookieList.length; i++) {
        if(cookieList[i].indexOf(value) > -1 ){
            return i;
        }
    }
}

// 숫자 타입에서 쓸 수 있도록 format() 함수 추가
Number.prototype.format = function(){
    if(this==0) return 0;


    var reg = /(^[+-]?\d+)(\d{3})/;
    var n = (this + '');

    while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');

    return n;
};

// 문자열 타입에서 쓸 수 있도록 format() 함수 추가
String.prototype.format = function(){
    var num = parseFloat(this);
    if( isNaN(num) ) return "0";

    return num.format();
};

// samsungpay delayed login. deeplink 호출 후 응답 없으면 모바일 마이페이지로 이동.
function loginCheckWithTargetPage(targetPage) {

    location.href = 'samsungpay://launch?action=shopping&spaycmd=purchase&merchantid=2004&ret_url=' + encodeURIComponent(targetPage);

    var ref = getQueryParam("referrer") == "" ? "N" : getQueryParam("referrer");
    setTimeout(function(){location.href = '/m/login?referrer='+ref;}, 1000);

}

// getting url parameter.
function getQueryParam(param) {
    location.search.substr(1)
        .split("&")
        .some(function(item) { // returns first occurence and stops
            return item.split("=")[0] == param && (param = item.split("=")[1])
        })

    return param;
}

function eventCloseAlert(today, endDate, _REFERRER_){
    if(endDate <= today){
        AlertUtil.open("해당 이벤트가 종료되었습니다.", function(){
            document.location.href = "/m/hot?referrer=" + _REFERRER_;
        });

        setTimeout("movePage('/m/hot?referrer=' + _REFERRER_)", 5000);
    }
}

function eventCloseAlertForRewardmall(today, endDate){
    if(endDate <= today){
        AlertUtil.open("해당 이벤트가 종료되었습니다.", function(){
            goRewardmallHome();
        });

        setTimeout( goRewardmallHome, 5000);
    }
}

// yyyyMMdd
function formatDate(){

    var date = new Date();
    var year = date.getFullYear();
    var month = (1 + date.getMonth());
    month = month >= 10 ? month : '0' + month;
    var day = date.getDate();
    day = day >= 10 ? day : '0' + day;

    return year + month + day;
}

    /** 달력 포매팅. */
function dateFormat(date, pattern) {
    if (!date || !date.valueOf()) { return ""; }

    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    var zeropadding = function(num) {
        return num >= 10 ? num : "0" + num;
    };

    return pattern.replace(/(yyyy|mmmm|mmm|mm|dddd|ddd|dd|hh|nn|ss|a\/p)/gi, function(value) {
        switch (value) {
            case "yyyy"  : return date.getFullYear() + "";
            case "MMMM"  : return monthNames[date.getMonth()];
            case "MMM"   : return monthNames[date.getMonth()].substr(0,3);
            case "MM"    : return zeropadding(date.getMonth() + 1);
            case "dddd"  : return dayNames[date.getDay()];
            case "ddd"   : return dayNames[date.getDay()].substr(0,3);
            case "dd"    : return zeropadding(date.getDate());
            case "HH"    : return zeropadding(date.getHours());
            case "hh"    : return zeropadding((date.getHours() % 12) ? (date.getHours() % 12) + "" : "12");
            case "mm"    : return zeropadding(date.getMinutes());
            case "ss"    : return zeropadding(date.getSeconds());
            case "a/p"   : return date.getHours() < 12 ? "a" : "p";
            default      : return value;
        }
    });
};

// 2019.04.24 마케팅 수신동의 처리.
function agreeMarketing(ref) {
    var preMsg = dateFormat(new Date(), "yyyy년 MM월 dd일 HH:mm") + "<br />마케팅수신동의 처리 완료 <p>";
    var postMsg = "수신 동의 </p> <p>※ 마이페이지>나의정보수정에서 변경 가능</p>";

    $.get("/m/mypage/existsNotAccept?ref=" + ref, function(data) {
        if (data) {
            var termsMsg = [],
                termsParam = [];

            if (!data.smsTerms) {
                termsMsg.push("SMS");
                termsParam.push("MK_SMS");
            }
            if (!data.emailTerms) {
                termsMsg.push("이메일");
                termsParam.push("MK_EMAIL");
            }
            if (!data.telTerms) {
                termsMsg.push("전화");
                termsParam.push("MK_TEL");
            }
            if (!data.pushTerms) {
                termsMsg.push("PUSH");
                termsParam.push("MK_PUSH");
            }

            if (termsParam.length == 0) {
                return;
            }

            var requestTerms = function(ref, termsParameter, msg, status) {
                $.ajax({
                    type: 'PUT',
                    url: '/m/mypage/modifyMarketingAgree_v3?status='+status+'&ref='+ref+"&terms="+termsParameter,
                    contentType: 'application/json',
                    success: function(data) {
                        if (msg) {
                            AlertUtil.open(msg);
                        }
                    }, fail: function(){
                        AlertUtil.open('잠시 후 다시 시도해주세요.');
                    }
                });
            };

            ConfirmUtil.open("다양한 특가상품과 할인쿠폰 정보를<br> 가장 빠르게 받아 보시겠습니까? <p> ※동의시 마케팅수신동의를 하시게 되며 알림을 받으실 수 있습니다.</p>", function() {
                requestTerms(ref, termsParam.join(","), preMsg + termsMsg.join(", ") + postMsg, 1);
            }, function() {
                requestTerms(ref, termsParam.join(","), "", 0);
            });
        }
    });
}

function autoCouponFormat(str){
    str = str.replace(/[^(0-9a-zA-Z)]/g, '');
    var tmp = '';

    if (str.length < 4) {
        return str;
    } else if (str.length < 8){
        tmp += str.substr(0, 4);
        tmp += '-';
        tmp += str.substr(4,4);
        return tmp;
    } else if (str.length < 12){
        tmp += str.substr(0, 4);
        tmp += '-';
        tmp += str.substr(4, 4);
        tmp += '-';
        tmp += str.substr(8,4);
        return tmp;
    } else {
        tmp += str.substr(0, 4);
        tmp += '-';
        tmp += str.substr(4, 4);
        tmp += '-';
        tmp += str.substr(8,4);
        tmp += '-';
        tmp += str.substr(12);
        return tmp;
    }
}

