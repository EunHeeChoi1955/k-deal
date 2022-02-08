var KDeal = {};

/**
 * KT 관련 모듈 정의.
 */
(function(kdeal) {
    var _storage = storage(StorageType.LOCAL_TYPE),
        _paramManager = ParamManager(),
        _key = {
            AUTH_KEY : 'kt-auth-key',
            AUTH_USERKEY : 'kt-userkey', // 고객 핸드폰 번호.
            AUTH_TOKEN : 'kt-auth-token', // 고객 핸드폰 번호.
            AUTH_RESULT : 'kt-result',
            KT_CUSTOMER : 'kt-customer',
            PARAM_KEY : 'kt-parameter-key',
            KT_MEMBERS_KEY : 'kt-members-parameter-key',
            KT_VIEW_RECENTLY_KEY : 'KT-view-recently', // 최근 본 상품
            KT_SEARCH_KEY : 'KT-searchHistory' // 검색어
        },
        _defaultExpire = 168; // 일주일

    var skipParams = ['aid', 'sid', 'mid', 'mp', 'auth-token'];

    /**
     * 인증 완료 처리.
     */
    kdeal.authenticateComplete = function(token) {
        _storage.setAttr(_key.AUTH_KEY, _key.AUTH_RESULT, 'Y', false, _defaultExpire);
        _storage.setAttr(_key.AUTH_KEY, _key.AUTH_TOKEN, token, false, _defaultExpire);
    };

    /**
     * 인증 실패 처리.
     */
    kdeal.authenticateFail = function() {
        _storage.setAttr(_key.AUTH_KEY, _key.AUTH_RESULT, 'N', false, _defaultExpire);
        _storage.setAttr(_key.AUTH_KEY, _key.AUTH_TOKEN, '', false, _defaultExpire);
    };

    /**
     * 재인증 처리. (삭제)
     */
    kdeal.deleteAuthenticate = function() {
        _storage.removeData(_key.KT_VIEW_RECENTLY_KEY);
        _storage.removeData(_key.AUTH_KEY);
    };

    /**
     * KT 최근 본 상품 이력 저장
     */
    kdeal.setKTViewRecently = function() {
        setStorageData(_key.KT_VIEW_RECENTLY_KEY, productId+"^"+productImg+"^"+price+"^"+orgPrice+"^"+productNm, 10);
    };

    /**
     * KT 검색어 이력 저장
     */
    kdeal.setKTSearchHistory = function(searchWord) {
        setStorageData(_key.KT_SEARCH_KEY, searchWord, 10);
    };

    /**
     * KT 회원 여부 세팅
     */
    kdeal.setKTCustomer = function() {
        _storage.setAttr(_key.AUTH_KEY, _key.KT_CUSTOMER, 'Y', false, _defaultExpire);
    };

    /**
     * KT 회원 여부 비활성화.
     */
    kdeal.setNoKTCustomer = function() {
        _storage.setAttr(_key.AUTH_KEY, _key.KT_CUSTOMER, 'N', false, _defaultExpire);
    }

    /**
     * KT 회원 여부 확인.
     */
    kdeal.isKTCustomer = function() {
        return _storage.getAttr(_key.AUTH_KEY, _key.KT_CUSTOMER) === 'Y';
    };

    /**
     * 인증된 고객 토큰 조회
     * @returns {string|string|string|*} 고객 고유 키 == 핸드폰 번호.
     */
    // kdeal.authUserKey = function() {
    kdeal.getToken = function() {
        return _storage.getAttr(_key.AUTH_KEY, _key.AUTH_TOKEN, false) || '';
    };

    /**
     * 인증 페이지로 이동
     * @param callback 인증 후 이동할 페이지
     */
    kdeal.authPage = function(options) {
        var defaults = {
            success : '',
            fail : '',
            successMessage : '',
            failMessage : '',
            requiredPhoneAuth : '',
            addAuthToken : 'N'
        };

        for (var key in defaults) {
            try { defaults[key] = options[key] || ''; } catch (e) {}
        }
        try {
            var equalsUrl = options['equalsUrl'];
            if (equalsUrl === true && !defaults['failUrl']) {
                defaults['failUrl'] = defaults['successUrl'];
            }
        } catch (e) {}

        var buildUri = [];
        for (var key in defaults) {
            buildUri.push(key + '=' + (encodeURIComponent(defaults[key])));
        }

        location.href = '/m/authentication/kt' + '?' + buildUri.join('&');
    };

    /**
     * 인증된 고객인지 여부 조회.
     * @returns {""|string|string|*} true or false
     */
    kdeal.isCertified = function(options, callback, isAsync) {
        var result = _storage.getAttr(_key.AUTH_KEY, _key.AUTH_RESULT),
            token = kdeal.getToken();

        if (result !== 'Y') kdeal.authPage(options);
        if (token.length === 0) kdeal.authPage(options);

        var auth = authentication();

        auth.checkToken(token, isAsync || true,function(phone) {
            if ($.isFunction(callback)) {
                callback.call(null, token, phone);
            }
        }, function() {
            kdeal.authPage(options);
        });
    };

    /**
     * 저장된 파라미터 값 조회.
     * @param key
     * @returns {string|string|string|*}
     */
    kdeal.get = function(key) {
        return _storage.getAttr(_key.PARAM_KEY, key, true);
    };

    /**
     * RID 값 조회.
     * @returns {string|*}
     */
    kdeal.getRid = function() {
        return kdeal.get('rid');
    }

    /**
     * 포스트백 처리
     * @type {{cartInfo: KDeal.postback.cartInfo, searchInfo: KDeal.postback.searchInfo, wishInfo: KDeal.postback.wishInfo, productReadInfo: KDeal.postback.productReadInfo, orderInfo: KDeal.postback.orderInfo}}
     */
    kdeal.postback = {

        /**
         * KDeal 분석계에 주문정보 전달.
         * @param orderId 주문 ID
         */
        orderInfo : function(orderId) {
            $.ajax({
                url : '/m/rewardmall/kt/kdeal/order',
                type : 'POST',
                contentType : 'application/json',
                data : JSON.stringify({oId: orderId}),
                success : function(data) {},
                error : function() {}
            });
        },

        /**
         * KDeal 분석계에 주문정보 전달.
         * @param orderShopItemId
         */
        orderItemInfo : function(orderShopItemId) {
            $.ajax({
                url : '/m/rewardmall/kt/kdeal/order/itemid',
                type : 'POST',
                contentType : 'application/json',
                data : JSON.stringify({orderShopItemId: orderShopItemId}),
                success : function(data) {},
                error : function() {}
            });
        },

        /**
         * KDeal 분석계에 취소정보 전달.
         * @param orderId 주문 ID
         */
        cancelInfo : function(orderId) {
            $.ajax({
                url : '/m/rewardmall/kt/kdeal/cancel',
                type : 'POST',
                contentType : 'application/json',
                data : JSON.stringify({oId: orderId}),
                success : function(data) {},
                error : function() {}
            });
        },

        /**
         * KDeal 분석계에 취소정보 전달.
         * @param orderShopItemId
         */
        cancelItemInfo : function(orderShopItemId) {
            $.ajax({
                url : '/m/rewardmall/kt/kdeal/cancel/itemid',
                type : 'POST',
                contentType : 'application/json',
                data : JSON.stringify({orderShopItemId: orderShopItemId}),
                success : function(data) {},
                error : function() {}
            });
        },

        /**
         * KDeal 분석계에 구매확정 정보 전달.
         * @param orderId 주문 ID
         */
        purchaseInfo : function(orderId) {
            $.ajax({
                url : '/m/rewardmall/kt/kdeal/purchase',
                type : 'POST',
                contentType : 'application/json',
                data : JSON.stringify({oId: orderId}),
                success : function(data) {},
                error : function() {}
            });
        },

        /**
         * KDeal 분석계에 장바구니정보 전달.
         * @param rid 고객 고유KEY
         * @param productCode 상품 코드
         * @param productOptionCode 상품 옵션 코드
         * @param quantity 수량
         */
        cartInfo : function(rid, productCode, productOptionCode, quantity) {
            $.ajax({
                url : '/m/rewardmall/kt/kdeal/cart',
                type : 'POST',
                contentType : 'application/json',
                data : JSON.stringify({
                    rId : rid + '',
                    productCode : productCode + '',
                    productOptionCode : productOptionCode + '',
                    Quantity : quantity + ''
                }),
                success : function(data) {},
                error : function() {}
            });
        },

        /**
         * KDeal 분석계에 찜정보 전달.
         * @param rid 고객 고유KEY
         * @param productCode 상품 코드
         */
        wishInfo : function(rid, productCode) {
            $.ajax({
                url : '/m/rewardmall/kt/kdeal/wish',
                type : 'POST',
                contentType : 'application/json',
                data : JSON.stringify({
                    rId : rid + '',
                    productCode : productCode + ''
                }),
                success : function(data) {},
                error : function() {}
            });
        },

        /**
         * KDeal 분석계에 상품열람정보 전달.
         * @param rid 고객 고유KEY
         * @param productCode 상품 코드
         * @param cvt 열람 시간.
         */
        productReadInfo : function(rid, productCode, cvt) {
            $.ajax({
                url : '/m/rewardmall/kt/kdeal/productread',
                type : 'POST',
                contentType : 'application/json',
                data : JSON.stringify({
                    rId : rid + '',
                    productCode : productCode + '',
                    cvt : cvt + ''
                }),
                success : function(data) {},
                error : function() {}
            });
        },

        /**
         * KDeal 분석계에 검색정보 전달.
         * @param rid 고객 고유KEY
         * @param searchWord 검색어
         * @param searchDate 검색당시 시간.
         */
        searchInfo : function(rid, searchWord, searchDate) {
            $.ajax({
                url : '/m/rewardmall/kt/kdeal/search',
                type : 'POST',
                contentType : 'application/json',
                data : JSON.stringify({
                    rId : rid + '',
                    searchWord : searchWord + '',
                    searchDate : searchDate + ''
                }),
                success : function(data) {},
                error : function() {}
            });
        }
    };

    /** 공통 프로토타입 설정. */
    kdeal.setPrototype = function() {

        // 문자열 포맷팅 설정.
        String.prototype.format = function() {
            var data = this,
                param = arguments;

            if (param === undefined || param.length === 0) {
                return data;
            }

            var paramCnt = param.length;
            for (var i = 0; i <= paramCnt; i = i + 2) {
                data = data.replace('{' + param[i] + '}', param[i + 1]);
            }
            return data;
        };

        // 문자열 left padding 처리
        String.prototype.leftPad = function(len, c) {
            var str = this,
            strLen = str.length,
            padChar = c || '0';
            if (!len || strLen > len) {
            return str;
        }
            return new Array((len - strLen) + 1).join(c) + str;
        };

        // date format 함수
        Date.prototype.dateFormat = function(f) {
            if (!this.valueOf()) return " ";

            var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
            var d = this;

            return f.replace(/(yyyy|yy|MM|dd|E|HH|hh|mm|ss|a\/p)/gi, function($1) {
                switch ($1) {
                    case "yyyy": return d.getFullYear();
                    case "yy": return (d.getFullYear() % 1000).zf(2);
                    case "MM": return (d.getMonth() + 1).zf(2);
                    case "dd": return d.getDate().zf(2);
                    case "E": return weekName[d.getDay()];
                    case "HH": return d.getHours().zf(2);
                    case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
                    case "mm": return d.getMinutes().zf(2);
                    case "ss": return d.getSeconds().zf(2);
                    case "a/p": return d.getHours() < 12 ? "오전" : "오후";
                    default: return $1;
                }
            });
        };

        String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};

        String.prototype.zf = function(len){return "0".string(len - this.length) + this;};

        Number.prototype.zf = function(len){return this.toString().zf(len);};
    };

    /**
     * 정기구독 신청 페이지로 이동
     * @param channel 가입 채널
     * @param type 유형
     */
    kdeal.goSubscribe = function(channel, type) {
        location.href = '/m/subscribe?channel=' + channel + '&subscribeType=' + type;
    };

    /**
     * 상품 ID가 멤버십 이벤트 대상 상품인지 확인 요청
     */
    var _loadKtMembershipBadge = function(ids, success) {
        $.ajax({
            url : '/m/rewardmall/kt/membership/product',
            type : 'POST',
            contentType : 'application/json',
            dataType : 'json',
            data : JSON.stringify(ids),
            success : function(data) {
                console.log('멤버십 이벤트 대상 상품 확인 -> ' + data);
                if (data && $.isArray(data)) {
                    success.call(null, data);
                }
            },
            error : function() {
            }
        });
    };

    /**
     * 멤버십 이벤트 대상임을 확인한 상품에 배치 노출 처리
     */
    var _setKtMembershipBadge = function(productInfos) {
        for (var i in productInfos) {
            var info = productInfos[i];
            try {
                if (info.membershipYn === 'Y') {
                    $('.kt-membership-product-badge-' + info.productId).show();
                }
            } catch (e) {
                console.error('상품코드 [{id}] 세팅 실패 -->' + info, info.productId);
                console.error(e);
            }
        }
    }

    /**
     * 상품이 멤버십 포인트 할인 이벤트 대상 상품인 경우 배지 노출. (노출된 모든 상품 대상)
     */
    kdeal.setKtMembershipBadge = function() {
        var $badge = $('.kt-membership-product-badge'),
            productIds = function($b) {
                var ids = [];
                $b.each(function() { ids.push($(this).data('product-id')); });
                return ids;
            }($badge);

        _loadKtMembershipBadge(productIds, _setKtMembershipBadge);
    };

    /**
     * 지정된 상품의 멤버십 포인트 할인 이벤ㅌ트 대상 상품인지 확인.
     * @param ids
     */
    kdeal.setKtMembershipBadgeByItem = function(ids) {
        _loadKtMembershipBadge(ids, _setKtMembershipBadge);
    };

    /**
     * KT 콕 초기화.
     */
    kdeal.init = function() {
        // 전달받은 Uplus 파라미터 정보는 모두 스토리지에 저장함.
        var paramObject = _storage.getObject(_key.PARAM_KEY, true) || {};

        var rid = _paramManager.get('rid'),
            aid = _paramManager.get('aid'),
            sid = _paramManager.get('sid'),
            mid = _paramManager.get('mid'),
            utmCampaign = _paramManager.get('utm_campaign'),
            mp = _paramManager.get('mp'); // UPlus 멤버스앰 연동 파라미터.

        if (rid) {
            paramObject['rid'] = rid;
        } else if (!paramObject['rid']) { // 스토리지에 저장된 RID가 없고 파라미터 RID가 없으면 default로 세팅함.
            paramObject['rid'] = 'default';
        }
        if (aid) paramObject['aid'] = aid;
        if (sid) paramObject['sid'] = sid;
        if (mid) paramObject['mid'] = mid;
        if (mp) paramObject['mp'] = mp;
        if (utmCampaign) paramObject['utmCampaign'] = utmCampaign;

        // 요청된 파라미터 저장.
        _storage.setObject(_key.PARAM_KEY, paramObject, true, _defaultExpire);
        // 숨김처리 해야할 파라미터.
        _paramManager.setUrlSkipParams(skipParams.join(','));
    };

})(KDeal);

// 공통 prototype 세팅.
KDeal.setPrototype();





