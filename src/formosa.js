/**
 * [formosa]{@link https://github.com/emn178/formosa}
 *
 * @version 0.2.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2016
 * @license MIT
 */
(function ($) {
  'use strict';

  var typeSettings = {};
  var vendorSettings = {};
  var vendorHandlers = {};

  var defaultMethods = {
    value: function (args) {
      console.log(args);
      return $.fn.val.apply(this, args);
    },
    disabled: function (args) {
      args.unshift('disabled');
      return $.fn.prop.apply(this, args);
    },
    readonly: function (args) {
      args.unshift('readonly');
      return $.fn.prop.apply(this, args);
    }
  };

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function register(vendor, type, handler) {
    if (!typeSettings[type]) {
      typeSettings[type] = {vendor: vendor};
    }
    if (!vendorHandlers[vendor]) {
      vendorHandlers[vendor] = {};
      vendorSettings[vendor] = {};
    }
    vendorHandlers[vendor][type] = handler;
    vendorSettings[vendor][type] = {};
  }

  function renderAll() {
    $('input:not([data-norender])').each(render);
  }

  function render() {
    var element = $(this);
    var type = element.attr('type');
    var vendor = element.data('vendor') || typeSettings[type] && typeSettings[type].vendor;
    var handlers = vendorHandlers[vendor];
    var handler = handlers && handlers[type];
    if (!handler || !handler.render) {
      return;
    }
    if (handler.available && handler.available !== true && !handler.available()) {
      return;
    }
    handler.available = true;
    element.data('norender', true).data('type', type);
    var options = element.data('options') || vendorSettings[vendor][type].options || typeSettings[type].options || {};
    handler.render.call(this, options);
  }

  function callMethod(args) {
    var method = args.shift();
    if (!defaultMethods[method]) {
      return this;
    }
    var action = args.length ? 'set' : 'get';
    var handlerMethod = action + capitalizeFirstLetter(method);
    var element = this.eq(0);
    var type = element.data('type');
    var result;
    if (type) {
      var vendor = element.data('vendor') || typeSettings[type] && typeSettings[type].vendor;
      var handler = vendorHandlers[vendor][type];
      if (handler[handlerMethod]) {
         result = handler[handlerMethod].apply(element[0], args);
      } else {
        result = defaultMethods[method].call(element, args);
      }
    } else {
      result = defaultMethods[method].call(element, args);
    }
    if (action == 'get') {
      return result;
    } else {
      return this;
    }
  }

  $.fn.input = function () {
    this.each(render);
    return callMethod.call(this, Array.prototype.slice.call(arguments, 0));
  };

  $(document).on('ready page:load', function () {
    $('<style>' + formosa.css + '</style>').appendTo('head');
    setTimeout(renderAll);
  });

  function readonly(e) {
    if ($(this).prop('readonly')) {
      e.stopPropagation();
      return false;
    }
  }

  window.formosa = $.formosa = {
    _readonly: readonly,
    render: renderAll,
    register: register,
    types: typeSettings,
    vendors: vendorSettings
  };
})(jQuery);
