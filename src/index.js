// Celery JS Library
;
(function(root, undefined) {
  var Celery = function(options, request) {
    options = options || {};
    this.request = request || (jQuery && jQuery.ajax);

    if (!this.request) {
      return console.error('Celery requires jQuery or another AJAX library');
    }

    this._setUserId = $.proxy(this._setUserId, this);

    var config = this.config = {};

    config.apiHost = options.apiHost || 'https://api.trycelery.com';
    config.apiVersion = options.apiVersion || 'v2';
    config.apiUrl = config.apiHost + '/' + config.apiVersion;
    config.slug = options.slug || '';
    config.userId = options.userId || '';
  }

  // Fetch information about the product
  Celery.prototype.fetchShop = function(slug, callback) {
    slug = slug || this.config.slug;

    if (!slug) {
      throw new Error('Must pass a product/collection ID/slug to #fetchShop');
    }

    callback = callback || function() {};

    var successCb = $.proxy(function(err, data) {
      if (data || data.data) {
        this._setUserId(data.data.user_id);
      }

      return callback.apply(this, arguments);
    }, this);

    return this.request({
        type: 'GET',
        url: this.config.apiUrl + '/shop/' + slug
      })
      .done(this._generateSuccessCb(successCb))
      .fail(this._generateErrorCb(callback));
  };


  // options should be an object with taxes params
  // shipping_country (required), shipping_state, shipping_zip
  Celery.prototype.fetchTaxes = function(options, callback) {
    var userId = this._ensureUserId(options);

    if (!options || !options.shipping_country) {
      return console.warn('Must pass at least shipping_country');
    }

    return this.request({
        type: 'GET',
        url: [this.config.apiUrl, 'users', userId, 'tax_rates'].join('/'),
        data: options,
        context: this
      })
      .done(this._generateSuccessCb(callback))
      .fail(this._generateErrorCb(callback));
  };

  Celery.prototype.fetchShippingWeights = function(options, callback) {
    console.warn('Implement fetchShippingWeights');
  };

  Celery.prototype.fetchShippingRates = function(options, callback) {
    console.warn('Implement fetchShippingRates');
  };

  Celery.prototype.fetchCoupon = function(options, callback) {
    var userId = this._ensureUserId(options);

    options.user_id = userId;

    return this._post('coupons', 'validate', options, callback);
  };

  // Preview an order by sending an order with line item and buyer info
  // The server will calculate subtotal, shipping, taxes, and coupons
  //
  // WARNING: This will soon be deprecated in favor of individual calls
  Celery.prototype.serializeOrder = function(order, callback) {
    return this._post('orders', 'serialize', order, callback);
  };

  Celery.prototype.createOrder = function(order, callback) {
    return this._post('orders', 'checkout', order, callback);
  };

  Celery.prototype._setUserId = function(id) {
    this.config.userId = id;

    return this;
  };

  Celery.prototype._ensureUserId = function(options) {
    if (!this.config.userId && (!options || !options.userId)) {
      throw new Error('userId is required');
    }

    var userId = this.config.userId || options.userId || options.user_id;

    if (typeof options === 'object') {
      options.user_id = userId;
    }

    return userId;
  };

  Celery.prototype._post = function(resource, endpoint, data, callback) {
    callback = callback || function() {};

    var url = this.config.apiUrl + '/' + resource;

    if (endpoint) {
      url += '/' + endpoint;
    }

    return this.request({
        type: 'POST',
        url: url,
        data: data ? JSON.stringify(data) : null,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        context: this
      })
      .done(this._generateSuccessCb(callback))
      .fail(this._generateErrorCb(callback));
  }

  Celery.prototype._createError = function(res) {
    var msg = '';

    if (res && res.responseText) {
      msg = res.responseText;
    }

    if (res && res.responseJSON) {
      msg = res.responseJSON.meta.error.message;
    }

    return new Error(msg);
  };

  Celery.prototype._generateSuccessCb = function(callback) {
    return function(data, textStatus, jqXHR) {
      if (typeof callback !== 'function') return;
      callback(null, data);
    }
  };

  Celery.prototype._generateErrorCb = function(callback) {
    var self = this;
    return function(jqXHR, textStatus, errorThrown) {
      if (typeof callback !== 'function') return;
      var err = self._createError(jqXHR);
      callback(err);
    }
  }

  // UMD
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], function() {
      return Celery;
    });
  } else if (typeof exports === 'object') {
    exports = Celery;
  } else {
    root.Celery = Celery;
  }
})(this);
