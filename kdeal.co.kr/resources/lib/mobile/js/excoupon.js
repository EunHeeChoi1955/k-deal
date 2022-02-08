/**
 * 쿠폰 연동
 */
var ExCoupon = function() {

    /**
     * 쿠폰 발급 요청
     * @param couponId 쿠폰 ID
     * @param userKey 고객 고유 KEY (= 핸드폰 버호 등)
     * @param callback 성공시 콜백 함수
     * @param fail 실패시 콜백 함수
     */
    var _issue = function(couponId, callback, fail) {
        var ajaxRequest = {
            url : '/m/excoupon/issue',
            data : JSON.stringify({
                couponId : couponId
            }),
            contentType : 'application/json',
            type : 'POST',
            beforeSend : function(xhr){
                xhr.setRequestHeader("authentication-token", KDeal.getToken());
            },
            success : function() {
                if ($.isFunction(callback)) {
                    callback.call();
                }
            },
            error : function() {
                if ($.isFunction(fail)) {
                    fail.call();
                }
            }
        };

        $.ajax(ajaxRequest);
    };


    /**
     * 쿠폰 발급 요청
     * @param couponCode 쿠폰 코드
     * @param userKey 고객 고유 KEY (= 핸드폰 버호 등)
     * @param callback 성공시 콜백 함수
     * @param fail 실패시 콜백 함수
     */
    var _issueCode = function(couponCode, callback, fail) {
        var ajaxRequest = {
            url : '/m/excoupon/issue/code',
            data : 'couponCode=' + couponCode,
            type : 'POST',
            dataType: "text",
            beforeSend : function(xhr){
                xhr.setRequestHeader("authentication-token", KDeal.getToken());
            },
            success : function(data) {
                if ($.isFunction(callback)) {
                    callback(data);
                }
            },
            error : function(xhr, res, error) {
                if ($.isFunction(fail)) {
                    fail(xhr.responseText);
                }
            }
        };

        $.ajax(ajaxRequest);
    };

    return {
        issue: _issue,
        issueCode: _issueCode
    }
}

