/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/embed/documentLoader.js":
/*!*************************************!*\
  !*** ./src/embed/documentLoader.js ***!
  \*************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _iframeSizer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./iframeSizer */ "./src/embed/iframeSizer.js");
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/util/url */ "./src/util/url.js");



function injectIframe(url, options, container) {
  const parts = url.split('/').slice(-2);
  if (parts.length != 2) return;
  if (parts[0] != 'documents') return;
  const slugId = parts[1];
  const slugHyphen = slugId.indexOf('-');
  if (slugHyphen == -1) return;
  const id = slugId.substring(0, slugHyphen);
  const slugExtension = slugId.substring(slugHyphen + 1);
  const slugParts = slugExtension.split('.');
  if (slugParts.length < 1) return;
  const slug = slugParts[0];

  // Create the iframe
  const iframe = document.createElement('iframe');

  // Ported from https://github.com/documentcloud/document-viewer/blob/master/public/javascripts/DV/helpers/construction.js
  if (options.responsive) {
    if (!options.height) {
      const windowHeight = window.innerHeight;
      const toSubtract = options.responsiveOffset == null ? 100 : options.responsiveOffset;
      options.height = windowHeight - toSubtract;
    }
  }

  const queryParams = {};
  let urlPostfix = '';
  let style = 'border:solid 1px #aaa;box-sizing:border-box;position:relative;max-width:100%;max-height:100%;';

  // Height option
  if (options.height != null) {
    style += `height:${options.height}px;`;
  } else {
    style += `height:100%;`;
  }
  // Width option
  if (options.width != null) {
    style += `width:${options.width}px;`;
  } else {
    style += `width:100%;`;
  }
  // Sidebar, text, and pdf options
  if (options.sidebar != null) {
    queryParams['sidebar'] = options.sidebar ? 1 : 0;
  }
  if (options.text == false) {
    queryParams['text'] = 0;
  }
  if (options.pdf == false) {
    queryParams['pdf'] = 0;
  }
  // Page option
  if (options.page != null) {
    if (options.note != null) {
      // Note option (must have page defined)
      urlPostfix = `#document/p${options.page}/a${options.note}`;
    } else {
      urlPostfix = `#document/p${options.page}`;
    }
  }

  iframe.style = style;
  iframe.src = Object(_util_url__WEBPACK_IMPORTED_MODULE_1__["queryBuilder"])(`${"http://www.dev.documentcloud.org/"}documents/${id}-${slug}`, queryParams) + urlPostfix;
  Object(_iframeSizer__WEBPACK_IMPORTED_MODULE_0__["setupResizeEvent"])(iframe);

  container.appendChild(iframe);
}

window.DV = {
  load: function (url, options) {
    const containerId = options['container'];
    if (containerId != null) {
      const container = document.querySelector(containerId);
      if (container != null && container.children.length == 0) {
        injectIframe(url, options, container);
      }
    }
  }
}


/***/ }),

/***/ "./src/embed/iframeSizer.js":
/*!**********************************!*\
  !*** ./src/embed/iframeSizer.js ***!
  \**********************************/
/*! exports provided: informSize, setupResizeEvent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "informSize", function() { return informSize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setupResizeEvent", function() { return setupResizeEvent; });
/* harmony import */ var _util_closure__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/util/closure */ "./src/util/closure.js");


function informSize(element, useScrollDimension = true) {
  // Inform a parent window about an embed size
  const update = () => {
    window.parent.postMessage({
      width: Math.max(useScrollDimension ? element.scrollWidth : 0, element.offsetWidth),
      height: Math.max(useScrollDimension ? element.scrollHeight : 0, element.offsetHeight)
    }, "*");
  };

  // Trigger event now and any time the window resizes
  window.addEventListener('resize', Object(_util_closure__WEBPACK_IMPORTED_MODULE_0__["timeoutify"])(update));
  update();
}

function setupResizeEvent(iframe) {
  window.addEventListener('message', (event) => {
    if (event.source == iframe.contentWindow) {
      const { width, height } = event.data;
      if (width != null) {
        iframe.width = width;
      }
      if (height != null) {
        iframe.height = height;
      }
    }
  });
}


/***/ }),

/***/ "./src/util/closure.js":
/*!*****************************!*\
  !*** ./src/util/closure.js ***!
  \*****************************/
/*! exports provided: smoothify, timeoutify, ignoreFirst */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "smoothify", function() { return smoothify; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "timeoutify", function() { return timeoutify; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ignoreFirst", function() { return ignoreFirst; });
function smoothify(fn) {
  let timer = null;

  return ((...args) => {
    if (timer != null) {
      cancelAnimationFrame(timer);
      timer = null;
    }

    timer = requestAnimationFrame(() => {
      timer = null;
      fn(...args);
    });
  });
}

function timeoutify(fn, timeout = 100) {
  let timer = null;

  return ((...args) => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }

    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, timeout);
  });
}

function ignoreFirst(closure) {
  // Ignore first invocation of a function
  let first = true;
  return (...args) => {
    if (first) {
      first = false;
    } else {
      closure(...args);
    }
  }
}


/***/ }),

/***/ "./src/util/url.js":
/*!*************************!*\
  !*** ./src/util/url.js ***!
  \*************************/
/*! exports provided: urlParts, urlJoin, getQueryStringParams, urlsEqual, currentUrl, queryBuilder, truthyParamValue, falsyParamValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "urlParts", function() { return urlParts; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "urlJoin", function() { return urlJoin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getQueryStringParams", function() { return getQueryStringParams; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "urlsEqual", function() { return urlsEqual; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "currentUrl", function() { return currentUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "queryBuilder", function() { return queryBuilder; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "truthyParamValue", function() { return truthyParamValue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "falsyParamValue", function() { return falsyParamValue; });
/**
 * Splits a URL into its base and query component.
 * @param {string} url The URL from which to extract parts.
 */
function urlParts(url) {
  const qIndex = url.indexOf("?");
  if (qIndex == -1) return [url, null];
  return [url.substr(0, qIndex), url.substr(qIndex + 1)];
}

/**
 * Join a URL, normalizing for slashes in between
 * @param  {...string} parts URL fragments to join
 */
function urlJoin(...parts) {
  return parts.reduce((a, b) => {
    if (a.endsWith('/')) {
      a = a.substr(0, a.length - 1);
    }
    if (b.startsWith('/')) {
      b = b.substr(1);
    }
    if (a == '') return b;
    if (b == '') return a;
    return [a, b].join('/');
  }, '');
}

// Adapted from: https://stackoverflow.com/a/3855394
function getQueryStringParamsFromQuery(query) {
  if (query == null) return {};
  return query.split("&").reduce((params, param) => {
    let [key, value] = param.split("=");
    params[key] = value ? decodeURIComponent(value.replace(/\+/g, " ")) : "";
    return params;
  }, {});
}

/**
 * Returns a map of query keys/values from a URL.
 * @param {string} url The URL from which to collect query params.
 */
function getQueryStringParams(url) {
  const [_, query] = urlParts(url);
  return getQueryStringParamsFromQuery(query);
}

function urlsEqual(url1, url2) {
  const [base1, query1] = urlParts(url1);
  const [base2, query2] = urlParts(url2);

  // Base URLs must match
  if (base1 != base2) return false;

  const qp1 = getQueryStringParamsFromQuery(query1);
  const qp2 = getQueryStringParamsFromQuery(query2);

  const keys1 = Object.keys(qp1);
  const keys2 = Object.keys(qp2);

  if (keys1.length != keys2.length) return false;

  keys1.sort();
  keys2.sort();

  for (let i = 0; i < keys1.length; i++) {
    const k1 = keys1[i];
    const k2 = keys2[i];
    if (k1 != k2) return false;
    if (qp1[k1] != qp2[k2]) return false;
  }
  return true;
}

function currentUrl() {
  return window.location.pathname + window.location.search;
}

/**
 * Constructs a URL with specified query parameters
 * @param {string} baseUrl The base URL on which to add query parameters
 * @param {Object} params A dictionary of key-value pairs for each query parameter
 * @param {boolean} cleanSlate If true, wipes existing query parameters
 */
function queryBuilder(baseUrl, params, cleanSlate = false) {
  if (baseUrl == null) baseUrl = currentUrl();
  const [url, query] = urlParts(baseUrl);
  const oldParams = cleanSlate ? {} : getQueryStringParamsFromQuery(query);

  // Overwrite old params with new params
  for (const prop in params) {
    if (params.hasOwnProperty(prop)) {
      oldParams[prop] = params[prop];
    }
  }

  let result = "";
  let prefix = "?";

  for (const prop in oldParams) {
    if (oldParams.hasOwnProperty(prop)) {
      const key = prop;
      const value = oldParams[key];

      // Skip undefined query params
      if (value == null) continue;

      result += `${prefix}${key}=${encodeURIComponent(value)}`;
      // Only the first prefix will be "?"
      prefix = "&";
    }
  }

  return `${url}${result}`;
}

// Return if a query parameter value is truthy
function truthyParamValue(value) {
  if (value == null) return false;
  const normalized = value.trim().toLowerCase();
  return normalized == "1" || normalized == "true" || normalized == "yes";
}

// Return if a query parameter value is explicitly falsy (and not just null)
function falsyParamValue(value) {
  if (value == null) return false;
  const normalized = value.trim().toLowerCase();
  return normalized == "0" || normalized == "false" || normalized == "no";
}


/***/ }),

/***/ 0:
/*!*******************************************!*\
  !*** multi ./src/embed/documentLoader.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./src/embed/documentLoader.js */"./src/embed/documentLoader.js");


/***/ })

/******/ });
//# sourceMappingURL=loader.js.map