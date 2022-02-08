if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}

var authentication = function(timeout) {
    timeout = timeout || 180;

    var _timer = undefined,
        _time = timeout;

    var _createPrivateCode = function(tagId) {
        var privateCode = Math.floor(Math.random() * (Math.pow(10, 10)));
        $('#' + tagId).data('private-code', privateCode);
        return privateCode;
    };


    var _formatTime = function(seconds) {
        var minute = Math.floor(seconds / 60 % 60, 10) + "",
            second = Math.floor(seconds % 60, 10) + "";

        second = second.padStart(2, '0');

        return minute + ':' + second;
    };

    return {
        formatTime : _formatTime,
        request : function(option) {
            var privateCode = _createPrivateCode(option.requestButtonId),
                orderPhone = option.phoneNumber,
                data = {
                    privateCode : privateCode,
                    phoneNumber : orderPhone,
                    typeName : option.typeName || '리워드몰'
                };

            if (!validateMobilePhone(orderPhone)  || orderPhone.length < 10) {
                AlertUtil.open("휴대폰번호를 정확히 입력해주세요.");
                return;
            }

            if (_timer) {
                clearInterval(_timer);
                _time = timeout;
            }

            $.ajax({
                url : '/m/authentication/code/send',
                type : 'POST',
                contentType : 'application/json',
                data : JSON.stringify(data),
                success : function(data) {
                    if (data) {
                        var $requestButton = $('#' + option.requestButtonId),
                            $authCodeInput = $('#' + option.authCodeInputId),
                            $authTime = $('#' + option.authTimeId),
                            message = $requestButton.text() === '재전송' ? '인증번호가 재발송되었습니다.' : '인증번호가 발송되었습니다.';

                        $authTime.show();
                        AlertUtil.open(message, function() {
                            $authCodeInput.focus();
                        });

                        var startSeconds = _time - 1;

                        _timer = setInterval(function() {
                            var timeFormat = _formatTime(startSeconds);
                            startSeconds--;
                            if (startSeconds < 0) {
                                startSeconds = timeout;
                                clearInterval(_timer);
                            }
                            _time = startSeconds;

                            $authTime.text(timeFormat);
                        }, 1000);

                        $requestButton.data('private-code', privateCode).text('재전송');
                    }
                },
                error : function(data) {
                    AlertUtil.open(data.responseJSON.body.message);
                }
            });
        },
        check : function(option) {
            var $request = $('#' + option.requestButtonId),
                privateCode = $request.data('private-code'),
                authCode = $.trim($('#' + option.authCodeInputId).val()),
                phone = btoa(option.phoneNumber),
                authTime = $('#' + option.authTimeId),
                successCallback = function() {
                    if (option && option.success) {
                        return option.success;
                    } else {
                        return function () {};
                    }
                }(),
                errorCallback = function() {
                    if (option && option.error) {
                        return option.error;
                    } else {
                        return function () {};
                    }
                }(),
                data = {
                    privateCode : privateCode,
                    code : authCode,
                    phoneNum : phone
                };

            if (authCode === '') {
                AlertUtil.open('인증번호를 정확히 입력해주세요.');
                return;
            }

            // if (_time <= 0) {
             if (authTime.text() === '0:00') {
                AlertUtil.open('인증번호 입력시간이 초과되었습니다. 다시 본인인증을 시도해주세요.');
                return;
            }

            $.ajax({
                url : '/m/authentication/code/check',
                type : 'POST',
                contentType : 'application/json',
                data : JSON.stringify(data),
                success : function(data) {
                    if (data.body.code === 'SUCCESS') {
                        AlertUtil.open(data.body.message, function() {
                            var $requestButton = $('#' + option.requestButtonId);
                            $requestButton.data('auth-check', 'true');
                            $requestButton.attr('data-auth-check', 'true');

                            successCallback.call(null, data.body.authToken); // 토큰 전달.

                            clearInterval(_timer);
                            _time = 180;
                        });
                    } else {
                        AlertUtil.open(data.body.message, errorCallback);
                    }
                },
                error : function(data) {
                    AlertUtil.open(data.responseJSON.body.message, errorCallback);
                }
            });
        },
        checkToken : function(token, async, success, fail) {
            $.ajax({
                url : '/m/authentication/token/check',
                type : 'POST',
                async : async || true,
                data : 'token=' + token,
                success : function(data) {
                    if ($.isFunction(success)) {
                        success.call(null, data.body.authPhoneNumber);
                    }
                },
                error : function() {
                    if ($.isFunction(fail)) {
                        fail.call(null);
                    }
                }
            });
        },
        reset : function() {
            if (_timer) {
                clearInterval(_timer);
                _time = 180;
            }
            var authTime = $('#' + option.authTimeId);
            authTime.text('3:00');
        }
    }
};