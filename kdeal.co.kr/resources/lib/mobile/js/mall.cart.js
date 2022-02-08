var MallCartType = {
    LOCAL_TYPE : 'local',
    SERVER_TYPE : 'server'
};

var MallCartInterface = function() {
    return {
        add: function (products, mall, cartExpiredTime, callback) {}, // 장바구니 등록
        get: function (mall) {}, // 장바구니 상품 목록 조회
        remove: function (mall, products) {}, // 장바구니 상품 삭제
        exists: function (mall, products) {} // 장바구니 상품 존재 여부 확인.
    }
};

/**
 * Local Storage를 활용한 장바구니 관리.
 * @type {function(*, *, *): *}
 */
var MallCartLocal = function(i, max) {
    var _lStorage = storage(StorageType.LOCAL_TYPE),
        _defaultCartExpiredTime = 15552000, // 180일
        cart = i();

    /**
     * 상품 정보를 장바구니에 담기 위한 형태로 생성함.
     * @param id 상품 ID
     * @param optionId 상품 옵션 ID
     * @param quantity 상품 수량
     * @param cartExpiredTime 만료 시간 (초)
     * @returns {{registTime: number, quantity: *, productId: *, productOptionId: *, expiredTime: (*|number)}}
     * @private
     */
    var _buildData = function(id, optionId, quantity, cartExpiredTime) {
        return {
            productId : id,
            productOptionId : optionId,
            quantity : quantity,
            expiredTime : cartExpiredTime || _defaultCartExpiredTime,
            registTime : (new Date()).getTime()
        };
    };

    /**
     * 해당 장바구니를 사용하기 위한 key값 생성
     * @param mallName 장바구니를 사용하는 몰 이름.
     * @returns {string} 생성된 장바구니 key
     * @private
     */
    var _getKey = function(mallName) {
        return mallName + '-rewardmall-cart-list';
    };

    /**
     * 장바구니 목록 저장.
     * @param key 장바구니 key
     * @param list 장바구니 목록.
     * @private
     */
    var _setCartList = function(key, list) {
        _lStorage.setAttr(key, 'cartlist', list);
    };

    /**
     * 장바구니 초기화.
     * @param key 장바구니 key
     * @private
     */
    var _resetCart = function(key) {
        _setCartList(key, []);
    };

    /**
     * 장바구니 목록 조회.
     * @param key 장바구니 key
     * @returns {[]} 장바구니 목록 (list)
     * @private
     */
    var _getCartList = function(key) {
        var list = _lStorage.getAttr(key, 'cartlist') || [],
            cartList = [],
            existsExpired = false;

        list.forEach(function(v) {
            var expired = (new Date()).getTime() > (v.registTime + (v.expiredTime * 60 * 60 * 1000));
            if (!expired) {
                cartList.push(v);
            } else {
                existsExpired = true;
            }
        });

        if (existsExpired) { // 장바구니에 만료된 상품이 존재하면.
            _setCartList(key, cartList);
        }

        return cartList;
    };

    /**
     * 상품 목록을 장바구니에 등록.
     * @param products 상품 목록
     * @param mall 장바구니를 사용하는 몰 이름.
     * @param cartExpiredTime 만료시간.
     * @param quantityAdd 장바구니 추가시 상품 수량을 더할것인지에 대한 여부.
     * @param callback 장바구니 추가 후 실행되는 콜백 함수.
     * @returns {boolean}
     * @private
     */
    var _add = function(products, mall, cartExpiredTime, quantityAdd, callback) {
        if (!products || products.length === 0) {
            AlertUtil.open("선택된 상품이 없습니다.");
            return false;
        }

        var key = _getKey(mall),
            cartList = _getCartList(key) || [],
            productList = [];

        if (cartList.length === max) {
            AlertUtil.open("더이상 등록할 수 없습니다.");
            return false;
        }

        products.forEach(function(p) {
            productList.push(_buildData(p.productId, p.productOptionId, p.quantity, cartExpiredTime));
        });

        var addCartList = function(data) {
            var quantityAdded = false;
            cartList.some(function(v) {
                if (data.productId === v.productId && data.productOptionId === v.productOptionId) {
                    if (quantityAdd) { v.quantity += data.quantity; }
                    quantityAdded = true;
                    return true;
                } else {
                    return false;
                }
            });

            if (!quantityAdded) {
                cartList.push(data);
            }
        };

        if (cartList.length >= max) {
            AlertUtil.open("더이상 등록할 수 없습니다.");
            return false;
        }

        // 상품을 순환하여 기존에 등록된 목록이 존재하면 수량을 증가하고 아니면 리스트를 증가함.
        productList.forEach(function(v) {
            addCartList(v);
        });

        // 장바구니 목록을 다시 저장함.
        _setCartList(key, cartList);

        if (callback && typeof(callback) === 'function') {
            callback.call();
        }
    };

    /**
     * 상품 목록을 장바구니에 등록. (수량 추가 안함, 초기 수량 그대로)
     * @param products 상품 목록
     * @param mall 장바구니를 사용하는 몰 이름.
     * @param cartExpiredTime 만료시간.
     * @param callback 장바구니 추가 후 실행되는 콜백 함수.
     * @returns {boolean}
     * @private
     */
    var _addNoQuantityAdd = function(products, mall, cartExpiredTime, callback) {
        _add(products, mall, cartExpiredTime, false, callback)
    };

    /**
     * 상품 목록을 장바구니에 등록. (수량 추가함.
     * @param products 상품 목록
     * @param mall 장바구니를 사용하는 몰 이름.
     * @param cartExpiredTime 만료시간.
     * @param callback 장바구니 추가 후 실행되는 콜백 함수.
     * @returns {boolean}
     * @private
     */
    var _addQuantityAdd = function(products, mall, cartExpiredTime, callback) {
        _add(products, mall, cartExpiredTime, true, callback)
    };

    /**
     * 장바구니 상품이 상품 목록에 존재하는지 체크
     * @param key 장바구니 key
     * @param cartItem 장바구니 상품 (1건)
     * @param products 상품 목록.
     * @returns {boolean} 상품 목록에 장바구니 상품이 존재하는지에 대한 여부.
     * @private
     */
    var _exists = function(key, cartItem, products) {
        if (!cartItem) { return false; }
        if (!products) { return false; }

        var exists = false;
        products.some(function(v) {
            if (v.productId === cartItem.productId && v.productOptionId === cartItem.productOptionId) {
                exists = true;
                return true;
            } else {
                return false;
            }
        });
        return exists;
    };

    /**
     * 장바구니 상품 삭제
     * @param key 장바구니 key
     * @param products 삭제할 상품 목록 ( Object = { productId : 000, productOptionId : 000 } )
     * @private
     */
    var _remove = function(key, products) {
        // 선택한 상품이 존재하지 않으면 전체 삭제.
        if (!products) { _resetCart(key); }

        var list = _getCartList(key),
            alivedList = [];

        if (list) {
            list.forEach(function(v) {
                if (!_exists(key, v, products)) {
                    alivedList.push(v);
                }
            });
        }

        _setCartList(key, alivedList);
    };

    /**
     * 장바구니에 해당 상품이 존재하는지 체크
     * @param key 장바구니 key
     * @param products 체크할 상품 목록.
     * @returns {boolean} 현재는 상품 목록 중 1개라도 존재하면 ture
     * @private
     */
    var _checkExists = function(key, products) {
        var list = _getCartList(key);
        if (list) {
            var exists = false;
            list.some(function(v) {
                if (!_exists(key, v, products)) {
                    exists = true;
                    return true;
                }
            });
            return exists;
        }
        return false;
    };

    cart.add = _addQuantityAdd;
    cart.get = function (mall) { return _getCartList(_getKey(mall)); };
    cart.remove = function(mall, products) { _remove(_getKey(mall), products); };
    cart.exists = _checkExists;

    return cart;
};

/**
 * 장바구니 처리를 서버에서 관리.
 * @param i
 * @param mall
 * @param token
 * @returns {*}
 * @constructor
 */
var MallCartServer = function(i, mall, token) {
    var _defaultCartExpiredTime = 15552000, // 180일
        cart = i();

    cart.add = function(products, cartExpiredTime, callback, fail) {
        if (!products || products.length === 0) {
            AlertUtil.open("선택된 상품이 없습니다.");
            return false;
        }

        var param = {
            serviceType : mall,
            cartRedisProductParamList : function(list, expireTime) {
                for (var i in list) {
                    list[i].expiredTime = expireTime;
                }
                return list;
            }(products, cartExpiredTime || _defaultCartExpiredTime)
        };

        $.ajax({
            url : '/m/cart/redis/add',
            type : 'POST',
            contentType : 'application/json',
            data : JSON.stringify(param),
            beforeSend : function(xhr){
                xhr.setRequestHeader("authentication-token", token);
            },
            success : function(data) {
                if ($.isFunction(callback)) {
                    callback.call(null, data);
                }
            },
            error : function(data) {
                console.error(data);
                if ($.isFunction(fail)) {
                    fail.call(null, data.status, data);
                }
            }
        });
    };

    cart.get = function(callback, fail) {
        $.ajax({
            url : '/m/cart/redis/list?serviceType='+mall,
            type : 'GET',
            contentType : 'application/json',
            beforeSend : function(xhr){
                xhr.setRequestHeader("authentication-token", token);
            },
            success : function(data) {
                if ($.isFunction(callback)) {
                    callback.call(null, data.body);
                }
            },
            error : function(data) {
                console.error(data);
                if ($.isFunction(fail)) {
                    fail.call(null, data.status, data);
                }
            }
        });
    };

    cart.remove = function(products, callback, fail) {
        var param = {
            serviceType : mall,
            cartRedisProductParamList : products
        };

        $.ajax({
            url : '/m/cart/redis/remove',
            type : 'POST',
            contentType : 'application/json',
            data : JSON.stringify(param),
            beforeSend : function(xhr){
                xhr.setRequestHeader("authentication-token", token);
            },
            success : function(data) {
                if ($.isFunction(callback)) {
                    callback.call(null, data);
                }
            },
            error : function(data) {
                console.error(data);
                if ($.isFunction(fail)) {
                    fail.call(null, data.status, data);
                }
            }
        });
    };

    cart.exists = function(products, callback, fail) {
        $.ajax({
            url : '/m/cart/redis/exists?serviceType=' + mall,
            type : 'GET',
            contentType : 'application/json',
            beforeSend : function(xhr){
                xhr.setRequestHeader("authentication-token", token);
            },
            success : function(data) {
                if ($.isFunction(callback)) {
                    callback.call(null, data);
                }
            },
            error : function(data) {
                console.error(data);
                if ($.isFunction(fail)) {
                    fail.call(null, data.status, data);
                }
            }
        });
    };

    return cart;
};


var MallCart = function(type, mall, userKey, max) {
    type = type || MallCartType.LOCAL_TYPE;
    max = max || 9999999999;

    return (type === MallCartType.SERVER_TYPE) ?
        MallCartServer(MallCartInterface, mall, userKey) :
        MallCartLocal(MallCartInterface, max);
};



