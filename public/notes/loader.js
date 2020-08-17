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

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'params', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy'];
  var defaultToConfig2Keys = [
    'baseURL', 'url', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress',
    'maxContentLength', 'validateStatus', 'maxRedirects', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath'
  ];

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, function mergeDeepProperties(prop) {
    if (utils.isObject(config2[prop])) {
      config[prop] = utils.deepMerge(config1[prop], config2[prop]);
    } else if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    } else if (utils.isObject(config1[prop])) {
      config[prop] = utils.deepMerge(config1[prop]);
    } else if (typeof config1[prop] !== 'undefined') {
      config[prop] = config1[prop];
    }
  });

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    } else if (typeof config1[prop] !== 'undefined') {
      config[prop] = config1[prop];
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys);

  var otherKeys = Object
    .keys(config2)
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, function otherKeysDefaultToConfig2(prop) {
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    } else if (typeof config1[prop] !== 'undefined') {
      config[prop] = config1[prop];
    }
  });

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Function equal to merge with the difference being that no reference
 * to original objects is kept.
 *
 * @see merge
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function deepMerge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = deepMerge(result[key], val);
    } else if (typeof val === 'object') {
      result[key] = deepMerge({}, val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  deepMerge: deepMerge,
  extend: extend,
  trim: trim
};


/***/ }),

/***/ "./node_modules/dompurify/dist/purify.js":
/*!***********************************************!*\
  !*** ./node_modules/dompurify/dist/purify.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*! @license DOMPurify | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/2.0.8/LICENSE */

(function (global, factory) {
   true ? module.exports = factory() :
  undefined;
}(this, function () { 'use strict';

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  var hasOwnProperty = Object.hasOwnProperty,
      setPrototypeOf = Object.setPrototypeOf,
      isFrozen = Object.isFrozen,
      objectKeys = Object.keys;
  var freeze = Object.freeze,
      seal = Object.seal; // eslint-disable-line import/no-mutable-exports

  var _ref = typeof Reflect !== 'undefined' && Reflect,
      apply = _ref.apply,
      construct = _ref.construct;

  if (!apply) {
    apply = function apply(fun, thisValue, args) {
      return fun.apply(thisValue, args);
    };
  }

  if (!freeze) {
    freeze = function freeze(x) {
      return x;
    };
  }

  if (!seal) {
    seal = function seal(x) {
      return x;
    };
  }

  if (!construct) {
    construct = function construct(Func, args) {
      return new (Function.prototype.bind.apply(Func, [null].concat(_toConsumableArray(args))))();
    };
  }

  var arrayForEach = unapply(Array.prototype.forEach);
  var arrayIndexOf = unapply(Array.prototype.indexOf);
  var arrayJoin = unapply(Array.prototype.join);
  var arrayPop = unapply(Array.prototype.pop);
  var arrayPush = unapply(Array.prototype.push);
  var arraySlice = unapply(Array.prototype.slice);

  var stringToLowerCase = unapply(String.prototype.toLowerCase);
  var stringMatch = unapply(String.prototype.match);
  var stringReplace = unapply(String.prototype.replace);
  var stringIndexOf = unapply(String.prototype.indexOf);
  var stringTrim = unapply(String.prototype.trim);

  var regExpTest = unapply(RegExp.prototype.test);
  var regExpCreate = unconstruct(RegExp);

  var typeErrorCreate = unconstruct(TypeError);

  function unapply(func) {
    return function (thisArg) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return apply(func, thisArg, args);
    };
  }

  function unconstruct(func) {
    return function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return construct(func, args);
    };
  }

  /* Add properties to a lookup table */
  function addToSet(set, array) {
    if (setPrototypeOf) {
      // Make 'in' and truthy checks like Boolean(set.constructor)
      // independent of any properties defined on Object.prototype.
      // Prevent prototype setters from intercepting set as a this value.
      setPrototypeOf(set, null);
    }

    var l = array.length;
    while (l--) {
      var element = array[l];
      if (typeof element === 'string') {
        var lcElement = stringToLowerCase(element);
        if (lcElement !== element) {
          // Config presets (e.g. tags.js, attrs.js) are immutable.
          if (!isFrozen(array)) {
            array[l] = lcElement;
          }

          element = lcElement;
        }
      }

      set[element] = true;
    }

    return set;
  }

  /* Shallow clone an object */
  function clone(object) {
    var newObject = {};

    var property = void 0;
    for (property in object) {
      if (apply(hasOwnProperty, object, [property])) {
        newObject[property] = object[property];
      }
    }

    return newObject;
  }

  var html = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);

  // SVG
  var svg = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'audio', 'canvas', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'video', 'view', 'vkern']);

  var svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);

  var mathMl = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover']);

  var text = freeze(['#text']);

  var html$1 = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns']);

  var svg$1 = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'tabindex', 'targetx', 'targety', 'transform', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);

  var mathMl$1 = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);

  var xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

  // eslint-disable-next-line unicorn/better-regex
  var MUSTACHE_EXPR = seal(/\{\{[\s\S]*|[\s\S]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode
  var ERB_EXPR = seal(/<%[\s\S]*|[\s\S]*%>/gm);
  var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape
  var ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
  var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
  );
  var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
  var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g // eslint-disable-line no-control-regex
  );

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  var getGlobal = function getGlobal() {
    return typeof window === 'undefined' ? null : window;
  };

  /**
   * Creates a no-op policy for internal use only.
   * Don't export this function outside this module!
   * @param {?TrustedTypePolicyFactory} trustedTypes The policy factory.
   * @param {Document} document The document object (to determine policy name suffix)
   * @return {?TrustedTypePolicy} The policy created (or null, if Trusted Types
   * are not supported).
   */
  var _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, document) {
    if ((typeof trustedTypes === 'undefined' ? 'undefined' : _typeof(trustedTypes)) !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
      return null;
    }

    // Allow the callers to control the unique policy name
    // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
    // Policy creation with duplicate names throws in Trusted Types.
    var suffix = null;
    var ATTR_NAME = 'data-tt-policy-suffix';
    if (document.currentScript && document.currentScript.hasAttribute(ATTR_NAME)) {
      suffix = document.currentScript.getAttribute(ATTR_NAME);
    }

    var policyName = 'dompurify' + (suffix ? '#' + suffix : '');

    try {
      return trustedTypes.createPolicy(policyName, {
        createHTML: function createHTML(html$$1) {
          return html$$1;
        }
      });
    } catch (_) {
      // Policy creation failed (most likely another DOMPurify script has
      // already run). Skip creating the policy, as this will only cause errors
      // if TT are enforced.
      console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
      return null;
    }
  };

  function createDOMPurify() {
    var window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();

    var DOMPurify = function DOMPurify(root) {
      return createDOMPurify(root);
    };

    /**
     * Version label, exposed for easier checks
     * if DOMPurify is up to date or not
     */
    DOMPurify.version = '2.0.11';

    /**
     * Array of elements that DOMPurify removed during sanitation.
     * Empty if nothing was removed.
     */
    DOMPurify.removed = [];

    if (!window || !window.document || window.document.nodeType !== 9) {
      // Not running in a browser, provide a factory function
      // so that you can pass your own Window
      DOMPurify.isSupported = false;

      return DOMPurify;
    }

    var originalDocument = window.document;
    var removeTitle = false;

    var document = window.document;
    var DocumentFragment = window.DocumentFragment,
        HTMLTemplateElement = window.HTMLTemplateElement,
        Node = window.Node,
        NodeFilter = window.NodeFilter,
        _window$NamedNodeMap = window.NamedNodeMap,
        NamedNodeMap = _window$NamedNodeMap === undefined ? window.NamedNodeMap || window.MozNamedAttrMap : _window$NamedNodeMap,
        Text = window.Text,
        Comment = window.Comment,
        DOMParser = window.DOMParser,
        trustedTypes = window.trustedTypes;

    // As per issue #47, the web-components registry is inherited by a
    // new document created via createHTMLDocument. As per the spec
    // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
    // a new empty registry is used when creating a template contents owner
    // document, so we use that as our parent document to ensure nothing
    // is inherited.

    if (typeof HTMLTemplateElement === 'function') {
      var template = document.createElement('template');
      if (template.content && template.content.ownerDocument) {
        document = template.content.ownerDocument;
      }
    }

    var trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, originalDocument);
    var emptyHTML = trustedTypesPolicy ? trustedTypesPolicy.createHTML('') : '';

    var _document = document,
        implementation = _document.implementation,
        createNodeIterator = _document.createNodeIterator,
        getElementsByTagName = _document.getElementsByTagName,
        createDocumentFragment = _document.createDocumentFragment;
    var importNode = originalDocument.importNode;


    var hooks = {};

    /**
     * Expose whether this browser supports running the full DOMPurify.
     */
    DOMPurify.isSupported = implementation && typeof implementation.createHTMLDocument !== 'undefined' && document.documentMode !== 9;

    var MUSTACHE_EXPR$$1 = MUSTACHE_EXPR,
        ERB_EXPR$$1 = ERB_EXPR,
        DATA_ATTR$$1 = DATA_ATTR,
        ARIA_ATTR$$1 = ARIA_ATTR,
        IS_SCRIPT_OR_DATA$$1 = IS_SCRIPT_OR_DATA,
        ATTR_WHITESPACE$$1 = ATTR_WHITESPACE;
    var IS_ALLOWED_URI$$1 = IS_ALLOWED_URI;

    /**
     * We consider the elements and attributes below to be safe. Ideally
     * don't add any new ones but feel free to remove unwanted ones.
     */

    /* allowed element names */

    var ALLOWED_TAGS = null;
    var DEFAULT_ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray$1(html), _toConsumableArray$1(svg), _toConsumableArray$1(svgFilters), _toConsumableArray$1(mathMl), _toConsumableArray$1(text)));

    /* Allowed attribute names */
    var ALLOWED_ATTR = null;
    var DEFAULT_ALLOWED_ATTR = addToSet({}, [].concat(_toConsumableArray$1(html$1), _toConsumableArray$1(svg$1), _toConsumableArray$1(mathMl$1), _toConsumableArray$1(xml)));

    /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
    var FORBID_TAGS = null;

    /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
    var FORBID_ATTR = null;

    /* Decide if ARIA attributes are okay */
    var ALLOW_ARIA_ATTR = true;

    /* Decide if custom data attributes are okay */
    var ALLOW_DATA_ATTR = true;

    /* Decide if unknown protocols are okay */
    var ALLOW_UNKNOWN_PROTOCOLS = false;

    /* Output should be safe for jQuery's $() factory? */
    var SAFE_FOR_JQUERY = false;

    /* Output should be safe for common template engines.
     * This means, DOMPurify removes data attributes, mustaches and ERB
     */
    var SAFE_FOR_TEMPLATES = false;

    /* Decide if document with <html>... should be returned */
    var WHOLE_DOCUMENT = false;

    /* Track whether config is already set on this instance of DOMPurify. */
    var SET_CONFIG = false;

    /* Decide if all elements (e.g. style, script) must be children of
     * document.body. By default, browsers might move them to document.head */
    var FORCE_BODY = false;

    /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
     * string (or a TrustedHTML object if Trusted Types are supported).
     * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
     */
    var RETURN_DOM = false;

    /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
     * string  (or a TrustedHTML object if Trusted Types are supported) */
    var RETURN_DOM_FRAGMENT = false;

    /* If `RETURN_DOM` or `RETURN_DOM_FRAGMENT` is enabled, decide if the returned DOM
     * `Node` is imported into the current `Document`. If this flag is not enabled the
     * `Node` will belong (its ownerDocument) to a fresh `HTMLDocument`, created by
     * DOMPurify. */
    var RETURN_DOM_IMPORT = false;

    /* Try to return a Trusted Type object instead of a string, retrun a string in
     * case Trusted Types are not supported  */
    var RETURN_TRUSTED_TYPE = false;

    /* Output should be free from DOM clobbering attacks? */
    var SANITIZE_DOM = true;

    /* Keep element content when removing element? */
    var KEEP_CONTENT = true;

    /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
     * of importing it into a new Document and returning a sanitized copy */
    var IN_PLACE = false;

    /* Allow usage of profiles like html, svg and mathMl */
    var USE_PROFILES = {};

    /* Tags to ignore content of when KEEP_CONTENT is true */
    var FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);

    /* Tags that are safe for data: URIs */
    var DATA_URI_TAGS = null;
    var DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);

    /* Attributes safe for values like "javascript:" */
    var URI_SAFE_ATTRIBUTES = null;
    var DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'summary', 'title', 'value', 'style', 'xmlns']);

    /* Keep a reference to config to pass to hooks */
    var CONFIG = null;

    /* Ideally, do not touch anything below this line */
    /* ______________________________________________ */

    var formElement = document.createElement('form');

    /**
     * _parseConfig
     *
     * @param  {Object} cfg optional config literal
     */
    // eslint-disable-next-line complexity
    var _parseConfig = function _parseConfig(cfg) {
      if (CONFIG && CONFIG === cfg) {
        return;
      }

      /* Shield configuration object from tampering */
      if (!cfg || (typeof cfg === 'undefined' ? 'undefined' : _typeof(cfg)) !== 'object') {
        cfg = {};
      }

      /* Set configuration parameters */
      ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS) : DEFAULT_ALLOWED_TAGS;
      ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR) : DEFAULT_ALLOWED_ATTR;
      URI_SAFE_ATTRIBUTES = 'ADD_URI_SAFE_ATTR' in cfg ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR) : DEFAULT_URI_SAFE_ATTRIBUTES;
      DATA_URI_TAGS = 'ADD_DATA_URI_TAGS' in cfg ? addToSet(clone(DEFAULT_DATA_URI_TAGS), cfg.ADD_DATA_URI_TAGS) : DEFAULT_DATA_URI_TAGS;
      FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS) : {};
      FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR) : {};
      USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
      ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
      ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
      ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
      SAFE_FOR_JQUERY = cfg.SAFE_FOR_JQUERY || false; // Default false
      SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
      WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
      RETURN_DOM = cfg.RETURN_DOM || false; // Default false
      RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
      RETURN_DOM_IMPORT = cfg.RETURN_DOM_IMPORT || false; // Default false
      RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
      FORCE_BODY = cfg.FORCE_BODY || false; // Default false
      SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
      KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
      IN_PLACE = cfg.IN_PLACE || false; // Default false
      IS_ALLOWED_URI$$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI$$1;
      if (SAFE_FOR_TEMPLATES) {
        ALLOW_DATA_ATTR = false;
      }

      if (RETURN_DOM_FRAGMENT) {
        RETURN_DOM = true;
      }

      /* Parse profile info */
      if (USE_PROFILES) {
        ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray$1(text)));
        ALLOWED_ATTR = [];
        if (USE_PROFILES.html === true) {
          addToSet(ALLOWED_TAGS, html);
          addToSet(ALLOWED_ATTR, html$1);
        }

        if (USE_PROFILES.svg === true) {
          addToSet(ALLOWED_TAGS, svg);
          addToSet(ALLOWED_ATTR, svg$1);
          addToSet(ALLOWED_ATTR, xml);
        }

        if (USE_PROFILES.svgFilters === true) {
          addToSet(ALLOWED_TAGS, svgFilters);
          addToSet(ALLOWED_ATTR, svg$1);
          addToSet(ALLOWED_ATTR, xml);
        }

        if (USE_PROFILES.mathMl === true) {
          addToSet(ALLOWED_TAGS, mathMl);
          addToSet(ALLOWED_ATTR, mathMl$1);
          addToSet(ALLOWED_ATTR, xml);
        }
      }

      /* Merge configuration parameters */
      if (cfg.ADD_TAGS) {
        if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
          ALLOWED_TAGS = clone(ALLOWED_TAGS);
        }

        addToSet(ALLOWED_TAGS, cfg.ADD_TAGS);
      }

      if (cfg.ADD_ATTR) {
        if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
          ALLOWED_ATTR = clone(ALLOWED_ATTR);
        }

        addToSet(ALLOWED_ATTR, cfg.ADD_ATTR);
      }

      if (cfg.ADD_URI_SAFE_ATTR) {
        addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR);
      }

      /* Add #text in case KEEP_CONTENT is set to true */
      if (KEEP_CONTENT) {
        ALLOWED_TAGS['#text'] = true;
      }

      /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
      if (WHOLE_DOCUMENT) {
        addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
      }

      /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
      if (ALLOWED_TAGS.table) {
        addToSet(ALLOWED_TAGS, ['tbody']);
        delete FORBID_TAGS.tbody;
      }

      // Prevent further manipulation of configuration.
      // Not available in IE8, Safari 5, etc.
      if (freeze) {
        freeze(cfg);
      }

      CONFIG = cfg;
    };

    /**
     * _forceRemove
     *
     * @param  {Node} node a DOM node
     */
    var _forceRemove = function _forceRemove(node) {
      arrayPush(DOMPurify.removed, { element: node });
      try {
        // eslint-disable-next-line unicorn/prefer-node-remove
        node.parentNode.removeChild(node);
      } catch (_) {
        node.outerHTML = emptyHTML;
      }
    };

    /**
     * _removeAttribute
     *
     * @param  {String} name an Attribute name
     * @param  {Node} node a DOM node
     */
    var _removeAttribute = function _removeAttribute(name, node) {
      try {
        arrayPush(DOMPurify.removed, {
          attribute: node.getAttributeNode(name),
          from: node
        });
      } catch (_) {
        arrayPush(DOMPurify.removed, {
          attribute: null,
          from: node
        });
      }

      node.removeAttribute(name);
    };

    /**
     * _initDocument
     *
     * @param  {String} dirty a string of dirty markup
     * @return {Document} a DOM, filled with the dirty markup
     */
    var _initDocument = function _initDocument(dirty) {
      /* Create a HTML document */
      var doc = void 0;
      var leadingWhitespace = void 0;

      if (FORCE_BODY) {
        dirty = '<remove></remove>' + dirty;
      } else {
        /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
        var matches = stringMatch(dirty, /^[\r\n\t ]+/);
        leadingWhitespace = matches && matches[0];
      }

      var dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
      /* Use the DOMParser API by default, fallback later if needs be */
      try {
        doc = new DOMParser().parseFromString(dirtyPayload, 'text/html');
      } catch (_) {}

      /* Remove title to fix a mXSS bug in older MS Edge */
      if (removeTitle) {
        addToSet(FORBID_TAGS, ['title']);
      }

      /* Use createHTMLDocument in case DOMParser is not available */
      if (!doc || !doc.documentElement) {
        doc = implementation.createHTMLDocument('');
        var _doc = doc,
            body = _doc.body;

        body.parentNode.removeChild(body.parentNode.firstElementChild);
        body.outerHTML = dirtyPayload;
      }

      if (dirty && leadingWhitespace) {
        doc.body.insertBefore(document.createTextNode(leadingWhitespace), doc.body.childNodes[0] || null);
      }

      /* Work on whole document or just its body */
      return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
    };

    /* Here we test for a broken feature in Edge that might cause mXSS */
    if (DOMPurify.isSupported) {
      (function () {
        try {
          var doc = _initDocument('<x/><title>&lt;/title&gt;&lt;img&gt;');
          if (regExpTest(/<\/title/, doc.querySelector('title').innerHTML)) {
            removeTitle = true;
          }
        } catch (_) {}
      })();
    }

    /**
     * _createIterator
     *
     * @param  {Document} root document/fragment to create iterator for
     * @return {Iterator} iterator instance
     */
    var _createIterator = function _createIterator(root) {
      return createNodeIterator.call(root.ownerDocument || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, function () {
        return NodeFilter.FILTER_ACCEPT;
      }, false);
    };

    /**
     * _isClobbered
     *
     * @param  {Node} elm element to check for clobbering attacks
     * @return {Boolean} true if clobbered, false if safe
     */
    var _isClobbered = function _isClobbered(elm) {
      if (elm instanceof Text || elm instanceof Comment) {
        return false;
      }

      if (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string') {
        return true;
      }

      return false;
    };

    /**
     * _isNode
     *
     * @param  {Node} obj object to check whether it's a DOM node
     * @return {Boolean} true is object is a DOM node
     */
    var _isNode = function _isNode(object) {
      return (typeof Node === 'undefined' ? 'undefined' : _typeof(Node)) === 'object' ? object instanceof Node : object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string';
    };

    /**
     * _executeHook
     * Execute user configurable hooks
     *
     * @param  {String} entryPoint  Name of the hook's entry point
     * @param  {Node} currentNode node to work on with the hook
     * @param  {Object} data additional hook parameters
     */
    var _executeHook = function _executeHook(entryPoint, currentNode, data) {
      if (!hooks[entryPoint]) {
        return;
      }

      arrayForEach(hooks[entryPoint], function (hook) {
        hook.call(DOMPurify, currentNode, data, CONFIG);
      });
    };

    /**
     * _sanitizeElements
     *
     * @protect nodeName
     * @protect textContent
     * @protect removeChild
     *
     * @param   {Node} currentNode to check for permission to exist
     * @return  {Boolean} true if node was killed, false if left alive
     */
    // eslint-disable-next-line complexity
    var _sanitizeElements = function _sanitizeElements(currentNode) {
      var content = void 0;

      /* Execute a hook if present */
      _executeHook('beforeSanitizeElements', currentNode, null);

      /* Check if element is clobbered or can clobber */
      if (_isClobbered(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Now let's check the element's type and name */
      var tagName = stringToLowerCase(currentNode.nodeName);

      /* Execute a hook if present */
      _executeHook('uponSanitizeElement', currentNode, {
        tagName: tagName,
        allowedTags: ALLOWED_TAGS
      });

      /* Take care of an mXSS pattern using p, br inside svg, math */
      if ((tagName === 'svg' || tagName === 'math') && currentNode.querySelectorAll('p, br').length !== 0) {
        _forceRemove(currentNode);
        return true;
      }

      /* Remove element if anything forbids its presence */
      if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
        /* Keep content except for black-listed elements */
        if (KEEP_CONTENT && !FORBID_CONTENTS[tagName] && typeof currentNode.insertAdjacentHTML === 'function') {
          try {
            var htmlToInsert = currentNode.innerHTML;
            currentNode.insertAdjacentHTML('AfterEnd', trustedTypesPolicy ? trustedTypesPolicy.createHTML(htmlToInsert) : htmlToInsert);
          } catch (_) {}
        }

        _forceRemove(currentNode);
        return true;
      }

      /* Remove in case a noscript/noembed XSS is suspected */
      if (tagName === 'noscript' && regExpTest(/<\/noscript/i, currentNode.innerHTML)) {
        _forceRemove(currentNode);
        return true;
      }

      if (tagName === 'noembed' && regExpTest(/<\/noembed/i, currentNode.innerHTML)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Convert markup to cover jQuery behavior */
      if (SAFE_FOR_JQUERY && !currentNode.firstElementChild && (!currentNode.content || !currentNode.content.firstElementChild) && regExpTest(/</g, currentNode.textContent)) {
        arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
        if (currentNode.innerHTML) {
          currentNode.innerHTML = stringReplace(currentNode.innerHTML, /</g, '&lt;');
        } else {
          currentNode.innerHTML = stringReplace(currentNode.textContent, /</g, '&lt;');
        }
      }

      /* Sanitize element content to be template-safe */
      if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
        /* Get the element's text content */
        content = currentNode.textContent;
        content = stringReplace(content, MUSTACHE_EXPR$$1, ' ');
        content = stringReplace(content, ERB_EXPR$$1, ' ');
        if (currentNode.textContent !== content) {
          arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
          currentNode.textContent = content;
        }
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeElements', currentNode, null);

      return false;
    };

    /**
     * _isValidAttribute
     *
     * @param  {string} lcTag Lowercase tag name of containing element.
     * @param  {string} lcName Lowercase attribute name.
     * @param  {string} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid, otherwise false.
     */
    // eslint-disable-next-line complexity
    var _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
      /* Make sure attribute cannot clobber */
      if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
        return false;
      }

      /* Allow valid data-* attributes: At least one character after "-"
          (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
          XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
          We don't need to check the value; it's always URI safe. */
      if (ALLOW_DATA_ATTR && regExpTest(DATA_ATTR$$1, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$$1, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
        return false;

        /* Check value is safe. First, is attr inert? If so, is safe */
      } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$$1, stringReplace(value, ATTR_WHITESPACE$$1, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$$1, stringReplace(value, ATTR_WHITESPACE$$1, ''))) ; else if (!value) ; else {
        return false;
      }

      return true;
    };

    /**
     * _sanitizeAttributes
     *
     * @protect attributes
     * @protect nodeName
     * @protect removeAttribute
     * @protect setAttribute
     *
     * @param  {Node} currentNode to sanitize
     */
    // eslint-disable-next-line complexity
    var _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
      var attr = void 0;
      var value = void 0;
      var lcName = void 0;
      var idAttr = void 0;
      var l = void 0;
      /* Execute a hook if present */
      _executeHook('beforeSanitizeAttributes', currentNode, null);

      var attributes = currentNode.attributes;

      /* Check if we have attributes; if not we might have a text node */

      if (!attributes) {
        return;
      }

      var hookEvent = {
        attrName: '',
        attrValue: '',
        keepAttr: true,
        allowedAttributes: ALLOWED_ATTR
      };
      l = attributes.length;

      /* Go backwards over all attributes; safely remove bad ones */
      while (l--) {
        attr = attributes[l];
        var _attr = attr,
            name = _attr.name,
            namespaceURI = _attr.namespaceURI;

        value = stringTrim(attr.value);
        lcName = stringToLowerCase(name);

        /* Execute a hook if present */
        hookEvent.attrName = lcName;
        hookEvent.attrValue = value;
        hookEvent.keepAttr = true;
        hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
        _executeHook('uponSanitizeAttribute', currentNode, hookEvent);
        value = hookEvent.attrValue;
        /* Did the hooks approve of the attribute? */
        if (hookEvent.forceKeepAttr) {
          continue;
        }

        /* Remove attribute */
        // Safari (iOS + Mac), last tested v8.0.5, crashes if you try to
        // remove a "name" attribute from an <img> tag that has an "id"
        // attribute at the time.
        if (lcName === 'name' && currentNode.nodeName === 'IMG' && attributes.id) {
          idAttr = attributes.id;
          attributes = arraySlice(attributes, []);
          _removeAttribute('id', currentNode);
          _removeAttribute(name, currentNode);
          if (arrayIndexOf(attributes, idAttr) > l) {
            currentNode.setAttribute('id', idAttr.value);
          }
        } else if (
        // This works around a bug in Safari, where input[type=file]
        // cannot be dynamically set after type has been removed
        currentNode.nodeName === 'INPUT' && lcName === 'type' && value === 'file' && hookEvent.keepAttr && (ALLOWED_ATTR[lcName] || !FORBID_ATTR[lcName])) {
          continue;
        } else {
          // This avoids a crash in Safari v9.0 with double-ids.
          // The trick is to first set the id to be empty and then to
          // remove the attribute
          if (name === 'id') {
            currentNode.setAttribute(name, '');
          }

          _removeAttribute(name, currentNode);
        }

        /* Did the hooks approve of the attribute? */
        if (!hookEvent.keepAttr) {
          continue;
        }

        /* Work around a security issue in jQuery 3.0 */
        if (SAFE_FOR_JQUERY && regExpTest(/\/>/i, value)) {
          _removeAttribute(name, currentNode);
          continue;
        }

        /* Take care of an mXSS pattern using namespace switches */
        if (regExpTest(/svg|math/i, currentNode.namespaceURI) && regExpTest(regExpCreate('</(' + arrayJoin(objectKeys(FORBID_CONTENTS), '|') + ')', 'i'), value)) {
          _removeAttribute(name, currentNode);
          continue;
        }

        /* Sanitize attribute content to be template-safe */
        if (SAFE_FOR_TEMPLATES) {
          value = stringReplace(value, MUSTACHE_EXPR$$1, ' ');
          value = stringReplace(value, ERB_EXPR$$1, ' ');
        }

        /* Is `value` valid for this attribute? */
        var lcTag = currentNode.nodeName.toLowerCase();
        if (!_isValidAttribute(lcTag, lcName, value)) {
          continue;
        }

        /* Handle invalid data-* attribute set by try-catching it */
        try {
          if (namespaceURI) {
            currentNode.setAttributeNS(namespaceURI, name, value);
          } else {
            /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
            currentNode.setAttribute(name, value);
          }

          arrayPop(DOMPurify.removed);
        } catch (_) {}
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeAttributes', currentNode, null);
    };

    /**
     * _sanitizeShadowDOM
     *
     * @param  {DocumentFragment} fragment to iterate over recursively
     */
    var _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
      var shadowNode = void 0;
      var shadowIterator = _createIterator(fragment);

      /* Execute a hook if present */
      _executeHook('beforeSanitizeShadowDOM', fragment, null);

      while (shadowNode = shadowIterator.nextNode()) {
        /* Execute a hook if present */
        _executeHook('uponSanitizeShadowNode', shadowNode, null);

        /* Sanitize tags and elements */
        if (_sanitizeElements(shadowNode)) {
          continue;
        }

        /* Deep shadow DOM detected */
        if (shadowNode.content instanceof DocumentFragment) {
          _sanitizeShadowDOM(shadowNode.content);
        }

        /* Check attributes, sanitize if necessary */
        _sanitizeAttributes(shadowNode);
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeShadowDOM', fragment, null);
    };

    /**
     * Sanitize
     * Public method providing core sanitation functionality
     *
     * @param {String|Node} dirty string or DOM node
     * @param {Object} configuration object
     */
    // eslint-disable-next-line complexity
    DOMPurify.sanitize = function (dirty, cfg) {
      var body = void 0;
      var importedNode = void 0;
      var currentNode = void 0;
      var oldNode = void 0;
      var returnNode = void 0;
      /* Make sure we have a string to sanitize.
        DO NOT return early, as this will return the wrong type if
        the user has requested a DOM object rather than a string */
      if (!dirty) {
        dirty = '<!-->';
      }

      /* Stringify, in case dirty is an object */
      if (typeof dirty !== 'string' && !_isNode(dirty)) {
        // eslint-disable-next-line no-negated-condition
        if (typeof dirty.toString !== 'function') {
          throw typeErrorCreate('toString is not a function');
        } else {
          dirty = dirty.toString();
          if (typeof dirty !== 'string') {
            throw typeErrorCreate('dirty is not a string, aborting');
          }
        }
      }

      /* Check we can run. Otherwise fall back or ignore */
      if (!DOMPurify.isSupported) {
        if (_typeof(window.toStaticHTML) === 'object' || typeof window.toStaticHTML === 'function') {
          if (typeof dirty === 'string') {
            return window.toStaticHTML(dirty);
          }

          if (_isNode(dirty)) {
            return window.toStaticHTML(dirty.outerHTML);
          }
        }

        return dirty;
      }

      /* Assign config vars */
      if (!SET_CONFIG) {
        _parseConfig(cfg);
      }

      /* Clean up removed elements */
      DOMPurify.removed = [];

      /* Check if dirty is correctly typed for IN_PLACE */
      if (typeof dirty === 'string') {
        IN_PLACE = false;
      }

      if (IN_PLACE) ; else if (dirty instanceof Node) {
        /* If dirty is a DOM element, append to an empty document to avoid
           elements being stripped by the parser */
        body = _initDocument('<!-->');
        importedNode = body.ownerDocument.importNode(dirty, true);
        if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
          /* Node is already a body, use as is */
          body = importedNode;
        } else if (importedNode.nodeName === 'HTML') {
          body = importedNode;
        } else {
          // eslint-disable-next-line unicorn/prefer-node-append
          body.appendChild(importedNode);
        }
      } else {
        /* Exit directly if we have nothing to do */
        if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT && RETURN_TRUSTED_TYPE &&
        // eslint-disable-next-line unicorn/prefer-includes
        dirty.indexOf('<') === -1) {
          return trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
        }

        /* Initialize the document to work on */
        body = _initDocument(dirty);

        /* Check we have a DOM node from the data */
        if (!body) {
          return RETURN_DOM ? null : emptyHTML;
        }
      }

      /* Remove first element node (ours) if FORCE_BODY is set */
      if (body && FORCE_BODY) {
        _forceRemove(body.firstChild);
      }

      /* Get node iterator */
      var nodeIterator = _createIterator(IN_PLACE ? dirty : body);

      /* Now start iterating over the created document */
      while (currentNode = nodeIterator.nextNode()) {
        /* Fix IE's strange behavior with manipulated textNodes #89 */
        if (currentNode.nodeType === 3 && currentNode === oldNode) {
          continue;
        }

        /* Sanitize tags and elements */
        if (_sanitizeElements(currentNode)) {
          continue;
        }

        /* Shadow DOM detected, sanitize it */
        if (currentNode.content instanceof DocumentFragment) {
          _sanitizeShadowDOM(currentNode.content);
        }

        /* Check attributes, sanitize if necessary */
        _sanitizeAttributes(currentNode);

        oldNode = currentNode;
      }

      oldNode = null;

      /* If we sanitized `dirty` in-place, return it. */
      if (IN_PLACE) {
        return dirty;
      }

      /* Return sanitized string or DOM */
      if (RETURN_DOM) {
        if (RETURN_DOM_FRAGMENT) {
          returnNode = createDocumentFragment.call(body.ownerDocument);

          while (body.firstChild) {
            // eslint-disable-next-line unicorn/prefer-node-append
            returnNode.appendChild(body.firstChild);
          }
        } else {
          returnNode = body;
        }

        if (RETURN_DOM_IMPORT) {
          /*
            AdoptNode() is not used because internal state is not reset
            (e.g. the past names map of a HTMLFormElement), this is safe
            in theory but we would rather not risk another attack vector.
            The state that is cloned by importNode() is explicitly defined
            by the specs.
          */
          returnNode = importNode.call(originalDocument, returnNode, true);
        }

        return returnNode;
      }

      var serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;

      /* Sanitize final string template-safe */
      if (SAFE_FOR_TEMPLATES) {
        serializedHTML = stringReplace(serializedHTML, MUSTACHE_EXPR$$1, ' ');
        serializedHTML = stringReplace(serializedHTML, ERB_EXPR$$1, ' ');
      }

      return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
    };

    /**
     * Public method to set the configuration once
     * setConfig
     *
     * @param {Object} cfg configuration object
     */
    DOMPurify.setConfig = function (cfg) {
      _parseConfig(cfg);
      SET_CONFIG = true;
    };

    /**
     * Public method to remove the configuration
     * clearConfig
     *
     */
    DOMPurify.clearConfig = function () {
      CONFIG = null;
      SET_CONFIG = false;
    };

    /**
     * Public method to check if an attribute value is valid.
     * Uses last set config, if any. Otherwise, uses config defaults.
     * isValidAttribute
     *
     * @param  {string} tag Tag name of containing element.
     * @param  {string} attr Attribute name.
     * @param  {string} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
     */
    DOMPurify.isValidAttribute = function (tag, attr, value) {
      /* Initialize shared config vars if necessary. */
      if (!CONFIG) {
        _parseConfig({});
      }

      var lcTag = stringToLowerCase(tag);
      var lcName = stringToLowerCase(attr);
      return _isValidAttribute(lcTag, lcName, value);
    };

    /**
     * AddHook
     * Public method to add DOMPurify hooks
     *
     * @param {String} entryPoint entry point for the hook to add
     * @param {Function} hookFunction function to execute
     */
    DOMPurify.addHook = function (entryPoint, hookFunction) {
      if (typeof hookFunction !== 'function') {
        return;
      }

      hooks[entryPoint] = hooks[entryPoint] || [];
      arrayPush(hooks[entryPoint], hookFunction);
    };

    /**
     * RemoveHook
     * Public method to remove a DOMPurify hook at a given entryPoint
     * (pops it from the stack of hooks if more are present)
     *
     * @param {String} entryPoint entry point for the hook to remove
     */
    DOMPurify.removeHook = function (entryPoint) {
      if (hooks[entryPoint]) {
        arrayPop(hooks[entryPoint]);
      }
    };

    /**
     * RemoveHooks
     * Public method to remove all DOMPurify hooks at a given entryPoint
     *
     * @param  {String} entryPoint entry point for the hooks to remove
     */
    DOMPurify.removeHooks = function (entryPoint) {
      if (hooks[entryPoint]) {
        hooks[entryPoint] = [];
      }
    };

    /**
     * RemoveAllHooks
     * Public method to remove all DOMPurify hooks
     *
     */
    DOMPurify.removeAllHooks = function () {
      hooks = {};
    };

    return DOMPurify;
  }

  var purify = createDOMPurify();

  return purify;

}));
//# sourceMappingURL=purify.js.map


/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/svelte/index.mjs":
/*!***************************************!*\
  !*** ./node_modules/svelte/index.mjs ***!
  \***************************************/
/*! exports provided: SvelteComponent, afterUpdate, beforeUpdate, createEventDispatcher, getContext, onDestroy, onMount, setContext, tick */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SvelteComponent", function() { return _internal__WEBPACK_IMPORTED_MODULE_0__["SvelteComponentDev"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "afterUpdate", function() { return _internal__WEBPACK_IMPORTED_MODULE_0__["afterUpdate"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "beforeUpdate", function() { return _internal__WEBPACK_IMPORTED_MODULE_0__["beforeUpdate"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createEventDispatcher", function() { return _internal__WEBPACK_IMPORTED_MODULE_0__["createEventDispatcher"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getContext", function() { return _internal__WEBPACK_IMPORTED_MODULE_0__["getContext"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "onDestroy", function() { return _internal__WEBPACK_IMPORTED_MODULE_0__["onDestroy"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "onMount", function() { return _internal__WEBPACK_IMPORTED_MODULE_0__["onMount"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setContext", function() { return _internal__WEBPACK_IMPORTED_MODULE_0__["setContext"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "tick", function() { return _internal__WEBPACK_IMPORTED_MODULE_0__["tick"]; });




/***/ }),

/***/ "./node_modules/svelte/internal/index.mjs":
/*!************************************************!*\
  !*** ./node_modules/svelte/internal/index.mjs ***!
  \************************************************/
/*! exports provided: HtmlTag, SvelteComponent, SvelteComponentDev, SvelteElement, action_destroyer, add_attribute, add_classes, add_flush_callback, add_location, add_render_callback, add_resize_listener, add_transform, afterUpdate, append, append_dev, assign, attr, attr_dev, beforeUpdate, bind, binding_callbacks, blank_object, bubble, check_outros, children, claim_component, claim_element, claim_space, claim_text, clear_loops, component_subscribe, createEventDispatcher, create_animation, create_bidirectional_transition, create_component, create_in_transition, create_out_transition, create_slot, create_ssr_component, current_component, custom_event, dataset_dev, debug, destroy_block, destroy_component, destroy_each, detach, detach_after_dev, detach_before_dev, detach_between_dev, detach_dev, dirty_components, dispatch_dev, each, element, element_is, empty, escape, escaped, exclude_internal_props, fix_and_destroy_block, fix_and_outro_and_destroy_block, fix_position, flush, getContext, get_binding_group_value, get_current_component, get_slot_changes, get_slot_context, get_spread_object, get_spread_update, get_store_value, globals, group_outros, handle_promise, has_prop, identity, init, insert, insert_dev, intros, invalid_attribute_name_character, is_client, is_function, is_promise, listen, listen_dev, loop, loop_guard, measure, missing_component, mount_component, noop, not_equal, now, null_to_empty, object_without_properties, onDestroy, onMount, once, outro_and_destroy_block, prevent_default, prop_dev, raf, run, run_all, safe_not_equal, schedule_update, select_multiple_value, select_option, select_options, select_value, self, setContext, set_attributes, set_current_component, set_custom_element_data, set_data, set_data_dev, set_input_type, set_input_value, set_now, set_raf, set_store_value, set_style, set_svg_attributes, space, spread, stop_propagation, subscribe, svg_element, text, tick, time_ranges_to_array, to_number, toggle_class, transition_in, transition_out, update_keyed_each, validate_component, validate_store, xlink_attr */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HtmlTag", function() { return HtmlTag; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SvelteComponent", function() { return SvelteComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SvelteComponentDev", function() { return SvelteComponentDev; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SvelteElement", function() { return SvelteElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "action_destroyer", function() { return action_destroyer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add_attribute", function() { return add_attribute; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add_classes", function() { return add_classes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add_flush_callback", function() { return add_flush_callback; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add_location", function() { return add_location; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add_render_callback", function() { return add_render_callback; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add_resize_listener", function() { return add_resize_listener; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add_transform", function() { return add_transform; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "afterUpdate", function() { return afterUpdate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "append", function() { return append; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "append_dev", function() { return append_dev; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "assign", function() { return assign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "attr", function() { return attr; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "attr_dev", function() { return attr_dev; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "beforeUpdate", function() { return beforeUpdate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bind", function() { return bind; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "binding_callbacks", function() { return binding_callbacks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blank_object", function() { return blank_object; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "bubble", function() { return bubble; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "check_outros", function() { return check_outros; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "children", function() { return children; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "claim_component", function() { return claim_component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "claim_element", function() { return claim_element; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "claim_space", function() { return claim_space; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "claim_text", function() { return claim_text; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clear_loops", function() { return clear_loops; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "component_subscribe", function() { return component_subscribe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createEventDispatcher", function() { return createEventDispatcher; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create_animation", function() { return create_animation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create_bidirectional_transition", function() { return create_bidirectional_transition; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create_component", function() { return create_component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create_in_transition", function() { return create_in_transition; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create_out_transition", function() { return create_out_transition; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create_slot", function() { return create_slot; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "create_ssr_component", function() { return create_ssr_component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "current_component", function() { return current_component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "custom_event", function() { return custom_event; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dataset_dev", function() { return dataset_dev; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "debug", function() { return debug; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "destroy_block", function() { return destroy_block; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "destroy_component", function() { return destroy_component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "destroy_each", function() { return destroy_each; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "detach", function() { return detach; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "detach_after_dev", function() { return detach_after_dev; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "detach_before_dev", function() { return detach_before_dev; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "detach_between_dev", function() { return detach_between_dev; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "detach_dev", function() { return detach_dev; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dirty_components", function() { return dirty_components; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dispatch_dev", function() { return dispatch_dev; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "each", function() { return each; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "element", function() { return element; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "element_is", function() { return element_is; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "empty", function() { return empty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "escape", function() { return escape; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "escaped", function() { return escaped; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "exclude_internal_props", function() { return exclude_internal_props; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fix_and_destroy_block", function() { return fix_and_destroy_block; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fix_and_outro_and_destroy_block", function() { return fix_and_outro_and_destroy_block; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fix_position", function() { return fix_position; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "flush", function() { return flush; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getContext", function() { return getContext; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get_binding_group_value", function() { return get_binding_group_value; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get_current_component", function() { return get_current_component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get_slot_changes", function() { return get_slot_changes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get_slot_context", function() { return get_slot_context; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get_spread_object", function() { return get_spread_object; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get_spread_update", function() { return get_spread_update; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get_store_value", function() { return get_store_value; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "globals", function() { return globals; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "group_outros", function() { return group_outros; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "handle_promise", function() { return handle_promise; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "has_prop", function() { return has_prop; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "identity", function() { return identity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "init", function() { return init; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "insert", function() { return insert; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "insert_dev", function() { return insert_dev; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "intros", function() { return intros; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invalid_attribute_name_character", function() { return invalid_attribute_name_character; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "is_client", function() { return is_client; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "is_function", function() { return is_function; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "is_promise", function() { return is_promise; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "listen", function() { return listen; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "listen_dev", function() { return listen_dev; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loop", function() { return loop; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loop_guard", function() { return loop_guard; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "measure", function() { return measure; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "missing_component", function() { return missing_component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mount_component", function() { return mount_component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noop", function() { return noop; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "not_equal", function() { return not_equal; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "now", function() { return now; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "null_to_empty", function() { return null_to_empty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "object_without_properties", function() { return object_without_properties; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onDestroy", function() { return onDestroy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onMount", function() { return onMount; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "once", function() { return once; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "outro_and_destroy_block", function() { return outro_and_destroy_block; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "prevent_default", function() { return prevent_default; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "prop_dev", function() { return prop_dev; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "raf", function() { return raf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "run", function() { return run; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "run_all", function() { return run_all; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "safe_not_equal", function() { return safe_not_equal; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "schedule_update", function() { return schedule_update; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "select_multiple_value", function() { return select_multiple_value; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "select_option", function() { return select_option; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "select_options", function() { return select_options; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "select_value", function() { return select_value; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "self", function() { return self; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setContext", function() { return setContext; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set_attributes", function() { return set_attributes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set_current_component", function() { return set_current_component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set_custom_element_data", function() { return set_custom_element_data; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set_data", function() { return set_data; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set_data_dev", function() { return set_data_dev; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set_input_type", function() { return set_input_type; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set_input_value", function() { return set_input_value; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set_now", function() { return set_now; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set_raf", function() { return set_raf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set_store_value", function() { return set_store_value; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set_style", function() { return set_style; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set_svg_attributes", function() { return set_svg_attributes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "space", function() { return space; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "spread", function() { return spread; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stop_propagation", function() { return stop_propagation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subscribe", function() { return subscribe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "svg_element", function() { return svg_element; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "text", function() { return text; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tick", function() { return tick; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "time_ranges_to_array", function() { return time_ranges_to_array; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "to_number", function() { return to_number; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toggle_class", function() { return toggle_class; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transition_in", function() { return transition_in; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transition_out", function() { return transition_out; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "update_keyed_each", function() { return update_keyed_each; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validate_component", function() { return validate_component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "validate_store", function() { return validate_store; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "xlink_attr", function() { return xlink_attr; });
function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function is_promise(value) {
    return value && typeof value === 'object' && typeof value.then === 'function';
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function not_equal(a, b) {
    return a != a ? b == b : a !== b;
}
function validate_store(store, name) {
    if (!store || typeof store.subscribe !== 'function') {
        throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
}
function subscribe(store, callback) {
    const unsub = store.subscribe(callback);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if (typeof $$scope.dirty === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}
function once(fn) {
    let ran = false;
    return function (...args) {
        if (ran)
            return;
        ran = true;
        fn.call(this, ...args);
    };
}
function null_to_empty(value) {
    return value == null ? '' : value;
}
function set_store_value(store, ret, value = ret) {
    store.set(value);
    return ret;
}
const has_prop = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;
// used internally for testing
function set_now(fn) {
    now = fn;
}
function set_raf(fn) {
    raf = fn;
}

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * For testing purposes only!
 */
function clear_loops() {
    tasks.clear();
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function element_is(name, is) {
    return document.createElement(name, { is });
}
function object_without_properties(obj, exclude) {
    const target = {};
    for (const k in obj) {
        if (has_prop(obj, k)
            // @ts-ignore
            && exclude.indexOf(k) === -1) {
            // @ts-ignore
            target[k] = obj[k];
        }
    }
    return target;
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
    return function (event) {
        event.preventDefault();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function stop_propagation(fn) {
    return function (event) {
        event.stopPropagation();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function self(fn) {
    return function (event) {
        // @ts-ignore
        if (event.target === this)
            fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_attributes(node, attributes) {
    // @ts-ignore
    const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
    for (const key in attributes) {
        if (attributes[key] == null) {
            node.removeAttribute(key);
        }
        else if (key === 'style') {
            node.style.cssText = attributes[key];
        }
        else if (descriptors[key] && descriptors[key].set) {
            node[key] = attributes[key];
        }
        else {
            attr(node, key, attributes[key]);
        }
    }
}
function set_svg_attributes(node, attributes) {
    for (const key in attributes) {
        attr(node, key, attributes[key]);
    }
}
function set_custom_element_data(node, prop, value) {
    if (prop in node) {
        node[prop] = value;
    }
    else {
        attr(node, prop, value);
    }
}
function xlink_attr(node, attribute, value) {
    node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
}
function get_binding_group_value(group) {
    const value = [];
    for (let i = 0; i < group.length; i += 1) {
        if (group[i].checked)
            value.push(group[i].__value);
    }
    return value;
}
function to_number(value) {
    return value === '' ? undefined : +value;
}
function time_ranges_to_array(ranges) {
    const array = [];
    for (let i = 0; i < ranges.length; i += 1) {
        array.push({ start: ranges.start(i), end: ranges.end(i) });
    }
    return array;
}
function children(element) {
    return Array.from(element.childNodes);
}
function claim_element(nodes, name, attributes, svg) {
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (node.nodeName === name) {
            for (let j = 0; j < node.attributes.length; j += 1) {
                const attribute = node.attributes[j];
                if (!attributes[attribute.name])
                    node.removeAttribute(attribute.name);
            }
            return nodes.splice(i, 1)[0]; // TODO strip unwanted attributes
        }
    }
    return svg ? svg_element(name) : element(name);
}
function claim_text(nodes, data) {
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (node.nodeType === 3) {
            node.data = '' + data;
            return nodes.splice(i, 1)[0];
        }
    }
    return text(data);
}
function claim_space(nodes) {
    return claim_text(nodes, ' ');
}
function set_data(text, data) {
    data = '' + data;
    if (text.data !== data)
        text.data = data;
}
function set_input_value(input, value) {
    if (value != null || input.value) {
        input.value = value;
    }
}
function set_input_type(input, type) {
    try {
        input.type = type;
    }
    catch (e) {
        // do nothing
    }
}
function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? 'important' : '');
}
function select_option(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
        const option = select.options[i];
        if (option.__value === value) {
            option.selected = true;
            return;
        }
    }
}
function select_options(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
        const option = select.options[i];
        option.selected = ~value.indexOf(option.__value);
    }
}
function select_value(select) {
    const selected_option = select.querySelector(':checked') || select.options[0];
    return selected_option && selected_option.__value;
}
function select_multiple_value(select) {
    return [].map.call(select.querySelectorAll(':checked'), option => option.__value);
}
function add_resize_listener(element, fn) {
    if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
    }
    const object = document.createElement('object');
    object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
    object.setAttribute('aria-hidden', 'true');
    object.type = 'text/html';
    object.tabIndex = -1;
    let win;
    object.onload = () => {
        win = object.contentDocument.defaultView;
        win.addEventListener('resize', fn);
    };
    if (/Trident/.test(navigator.userAgent)) {
        element.appendChild(object);
        object.data = 'about:blank';
    }
    else {
        object.data = 'about:blank';
        element.appendChild(object);
    }
    return {
        cancel: () => {
            win && win.removeEventListener && win.removeEventListener('resize', fn);
            element.removeChild(object);
        }
    };
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}
class HtmlTag {
    constructor(html, anchor = null) {
        this.e = element('div');
        this.a = anchor;
        this.u(html);
    }
    m(target, anchor = null) {
        for (let i = 0; i < this.n.length; i += 1) {
            insert(target, this.n[i], anchor);
        }
        this.t = target;
    }
    u(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
    }
    p(html) {
        this.d();
        this.u(html);
        this.m(this.t, this.a);
    }
    d() {
        this.n.forEach(detach);
    }
}

let stylesheet;
let active = 0;
let current_rules = {};
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    if (!current_rules[name]) {
        if (!stylesheet) {
            const style = element('style');
            document.head.appendChild(style);
            stylesheet = style.sheet;
        }
        current_rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    node.style.animation = (node.style.animation || '')
        .split(', ')
        .filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    )
        .join(', ');
    if (name && !--active)
        clear_rules();
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        let i = stylesheet.cssRules.length;
        while (i--)
            stylesheet.deleteRule(i);
        current_rules = {};
    });
}

function create_animation(node, from, fn, params) {
    if (!from)
        return noop;
    const to = node.getBoundingClientRect();
    if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
        return noop;
    const { delay = 0, duration = 300, easing = identity, 
    // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
    start: start_time = now() + delay, 
    // @ts-ignore todo:
    end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
    let running = true;
    let started = false;
    let name;
    function start() {
        if (css) {
            name = create_rule(node, 0, 1, duration, delay, easing, css);
        }
        if (!delay) {
            started = true;
        }
    }
    function stop() {
        if (css)
            delete_rule(node, name);
        running = false;
    }
    loop(now => {
        if (!started && now >= start_time) {
            started = true;
        }
        if (started && now >= end) {
            tick(1, 0);
            stop();
        }
        if (!running) {
            return false;
        }
        if (started) {
            const p = now - start_time;
            const t = 0 + 1 * easing(p / duration);
            tick(t, 1 - t);
        }
        return true;
    });
    start();
    tick(0, 1);
    return stop;
}
function fix_position(node) {
    const style = getComputedStyle(node);
    if (style.position !== 'absolute' && style.position !== 'fixed') {
        const { width, height } = style;
        const a = node.getBoundingClientRect();
        node.style.position = 'absolute';
        node.style.width = width;
        node.style.height = height;
        add_transform(node, a);
    }
}
function add_transform(node, a) {
    const b = node.getBoundingClientRect();
    if (a.left !== b.left || a.top !== b.top) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
    }
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function beforeUpdate(fn) {
    get_current_component().$$.before_update.push(fn);
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}
// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
        callbacks.slice().forEach(fn => fn(event));
    }
}

const dirty_components = [];
const intros = { enabled: false };
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function tick() {
    schedule_update();
    return resolved_promise;
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function add_flush_callback(fn) {
    flush_callbacks.push(fn);
}
function flush() {
    const seen_callbacks = new Set();
    do {
        // first, call beforeUpdate functions
        // and update components
        while (dirty_components.length) {
            const component = dirty_components.shift();
            set_current_component(component);
            update(component.$$);
        }
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                callback();
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
    let config = fn(node, params);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
        tick(0, 1);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        if (task)
            task.abort();
        running = true;
        add_render_callback(() => dispatch(node, true, 'start'));
        task = loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(1, 0);
                    dispatch(node, true, 'end');
                    cleanup();
                    return running = false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(t, 1 - t);
                }
            }
            return running;
        });
    }
    let started = false;
    return {
        start() {
            if (started)
                return;
            delete_rule(node);
            if (is_function(config)) {
                config = config();
                wait().then(go);
            }
            else {
                go();
            }
        },
        invalidate() {
            started = false;
        },
        end() {
            if (running) {
                cleanup();
                running = false;
            }
        }
    };
}
function create_out_transition(node, fn, params) {
    let config = fn(node, params);
    let running = true;
    let animation_name;
    const group = outros;
    group.r += 1;
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        add_render_callback(() => dispatch(node, false, 'start'));
        loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(0, 1);
                    dispatch(node, false, 'end');
                    if (!--group.r) {
                        // this will result in `end()` being called,
                        // so we don't need to clean up here
                        run_all(group.c);
                    }
                    return false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(1 - t, t);
                }
            }
            return running;
        });
    }
    if (is_function(config)) {
        wait().then(() => {
            // @ts-ignore
            config = config();
            go();
        });
    }
    else {
        go();
    }
    return {
        end(reset) {
            if (reset && config.tick) {
                config.tick(1, 0);
            }
            if (running) {
                if (animation_name)
                    delete_rule(node, animation_name);
                running = false;
            }
        }
    };
}
function create_bidirectional_transition(node, fn, params, intro) {
    let config = fn(node, params);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = program.b - t;
        duration *= Math.abs(d);
        return {
            a: t,
            b: program.b,
            d,
            duration,
            start: program.start,
            end: program.start + duration,
            group: program.group
        };
    }
    function go(b) {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        const program = {
            start: now() + delay,
            b
        };
        if (!b) {
            // @ts-ignore todo: improve typings
            program.group = outros;
            outros.r += 1;
        }
        if (running_program) {
            pending_program = program;
        }
        else {
            // if this is an intro, and there's a delay, we need to do
            // an initial tick and/or apply CSS animation immediately
            if (css) {
                clear_animation();
                animation_name = create_rule(node, t, b, duration, delay, easing, css);
            }
            if (b)
                tick(0, 1);
            running_program = init(program, duration);
            add_render_callback(() => dispatch(node, b, 'start'));
            loop(now => {
                if (pending_program && now > pending_program.start) {
                    running_program = init(pending_program, duration);
                    pending_program = null;
                    dispatch(node, running_program.b, 'start');
                    if (css) {
                        clear_animation();
                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                    }
                }
                if (running_program) {
                    if (now >= running_program.end) {
                        tick(t = running_program.b, 1 - t);
                        dispatch(node, running_program.b, 'end');
                        if (!pending_program) {
                            // we're done
                            if (running_program.b) {
                                // intro — we can tidy up immediately
                                clear_animation();
                            }
                            else {
                                // outro — needs to be coordinated
                                if (!--running_program.group.r)
                                    run_all(running_program.group.c);
                            }
                        }
                        running_program = null;
                    }
                    else if (now >= running_program.start) {
                        const p = now - running_program.start;
                        t = running_program.a + running_program.d * easing(p / running_program.duration);
                        tick(t, 1 - t);
                    }
                }
                return !!(running_program || pending_program);
            });
        }
    }
    return {
        run(b) {
            if (is_function(config)) {
                wait().then(() => {
                    // @ts-ignore
                    config = config();
                    go(b);
                });
            }
            else {
                go(b);
            }
        },
        end() {
            clear_animation();
            running_program = pending_program = null;
        }
    };
}

function handle_promise(promise, info) {
    const token = info.token = {};
    function update(type, index, key, value) {
        if (info.token !== token)
            return;
        info.resolved = value;
        let child_ctx = info.ctx;
        if (key !== undefined) {
            child_ctx = child_ctx.slice();
            child_ctx[key] = value;
        }
        const block = type && (info.current = type)(child_ctx);
        let needs_flush = false;
        if (info.block) {
            if (info.blocks) {
                info.blocks.forEach((block, i) => {
                    if (i !== index && block) {
                        group_outros();
                        transition_out(block, 1, 1, () => {
                            info.blocks[i] = null;
                        });
                        check_outros();
                    }
                });
            }
            else {
                info.block.d(1);
            }
            block.c();
            transition_in(block, 1);
            block.m(info.mount(), info.anchor);
            needs_flush = true;
        }
        info.block = block;
        if (info.blocks)
            info.blocks[index] = block;
        if (needs_flush) {
            flush();
        }
    }
    if (is_promise(promise)) {
        const current_component = get_current_component();
        promise.then(value => {
            set_current_component(current_component);
            update(info.then, 1, info.value, value);
            set_current_component(null);
        }, error => {
            set_current_component(current_component);
            update(info.catch, 2, info.error, error);
            set_current_component(null);
        });
        // if we previously had a then/catch block, destroy it
        if (info.current !== info.pending) {
            update(info.pending, 0);
            return true;
        }
    }
    else {
        if (info.current !== info.then) {
            update(info.then, 1, info.value, promise);
            return true;
        }
        info.resolved = promise;
    }
}

const globals = (typeof window !== 'undefined' ? window : global);

function destroy_block(block, lookup) {
    block.d(1);
    lookup.delete(block.key);
}
function outro_and_destroy_block(block, lookup) {
    transition_out(block, 1, 1, () => {
        lookup.delete(block.key);
    });
}
function fix_and_destroy_block(block, lookup) {
    block.f();
    destroy_block(block, lookup);
}
function fix_and_outro_and_destroy_block(block, lookup) {
    block.f();
    outro_and_destroy_block(block, lookup);
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
        old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = new Map();
    const deltas = new Map();
    i = n;
    while (i--) {
        const child_ctx = get_context(ctx, list, i);
        const key = get_key(child_ctx);
        let block = lookup.get(key);
        if (!block) {
            block = create_each_block(key, child_ctx);
            block.c();
        }
        else if (dynamic) {
            block.p(child_ctx, dirty);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
            deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = new Set();
    const did_move = new Set();
    function insert(block) {
        transition_in(block, 1);
        block.m(node, next);
        lookup.set(block.key, block);
        next = block.first;
        n--;
    }
    while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        const new_key = new_block.key;
        const old_key = old_block.key;
        if (new_block === old_block) {
            // do nothing
            next = new_block.first;
            o--;
            n--;
        }
        else if (!new_lookup.has(old_key)) {
            // remove old block
            destroy(old_block, lookup);
            o--;
        }
        else if (!lookup.has(new_key) || will_move.has(new_key)) {
            insert(new_block);
        }
        else if (did_move.has(old_key)) {
            o--;
        }
        else if (deltas.get(new_key) > deltas.get(old_key)) {
            did_move.add(new_key);
            insert(new_block);
        }
        else {
            will_move.add(old_key);
            o--;
        }
    }
    while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block.key))
            destroy(old_block, lookup);
    }
    while (n)
        insert(new_blocks[n - 1]);
    return new_blocks;
}
function measure(blocks) {
    const rects = {};
    let i = blocks.length;
    while (i--)
        rects[blocks[i].key] = blocks[i].node.getBoundingClientRect();
    return rects;
}

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}

// source: https://html.spec.whatwg.org/multipage/indices.html
const boolean_attributes = new Set([
    'allowfullscreen',
    'allowpaymentrequest',
    'async',
    'autofocus',
    'autoplay',
    'checked',
    'controls',
    'default',
    'defer',
    'disabled',
    'formnovalidate',
    'hidden',
    'ismap',
    'loop',
    'multiple',
    'muted',
    'nomodule',
    'novalidate',
    'open',
    'playsinline',
    'readonly',
    'required',
    'reversed',
    'selected'
]);

const invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
// https://infra.spec.whatwg.org/#noncharacter
function spread(args, classes_to_add) {
    const attributes = Object.assign({}, ...args);
    if (classes_to_add) {
        if (attributes.class == null) {
            attributes.class = classes_to_add;
        }
        else {
            attributes.class += ' ' + classes_to_add;
        }
    }
    let str = '';
    Object.keys(attributes).forEach(name => {
        if (invalid_attribute_name_character.test(name))
            return;
        const value = attributes[name];
        if (value === true)
            str += " " + name;
        else if (boolean_attributes.has(name.toLowerCase())) {
            if (value)
                str += " " + name;
        }
        else if (value != null) {
            str += " " + name + "=" + JSON.stringify(String(value)
                .replace(/"/g, '&#34;')
                .replace(/'/g, '&#39;'));
        }
    });
    return str;
}
const escaped = {
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
function escape(html) {
    return String(html).replace(/["'&<>]/g, match => escaped[match]);
}
function each(items, fn) {
    let str = '';
    for (let i = 0; i < items.length; i += 1) {
        str += fn(items[i], i);
    }
    return str;
}
const missing_component = {
    $$render: () => ''
};
function validate_component(component, name) {
    if (!component || !component.$$render) {
        if (name === 'svelte:component')
            name += ' this={...}';
        throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
    }
    return component;
}
function debug(file, line, column, values) {
    console.log(`{@debug} ${file ? file + ' ' : ''}(${line}:${column})`); // eslint-disable-line no-console
    console.log(values); // eslint-disable-line no-console
    return '';
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(parent_component ? parent_component.$$.context : []),
            // these will be immediately discarded
            on_mount: [],
            before_update: [],
            after_update: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, options = {}) => {
            on_destroy = [];
            const result = { head: '', css: new Set() };
            const html = $$render(result, props, {}, options);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.head
            };
        },
        $$render
    };
}
function add_attribute(name, value, boolean) {
    if (value == null || (boolean && !value))
        return '';
    return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function add_classes(classes) {
    return classes ? ` class="${classes}"` : ``;
}

function bind(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== undefined) {
        component.$$.bound[index] = callback;
        callback(component.$$.ctx[index]);
    }
}
function create_component(block) {
    block && block.c();
}
function claim_component(block, parent_nodes) {
    block && block.l(parent_nodes);
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, value = ret) => {
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(children(options.target));
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
let SvelteElement;
if (typeof HTMLElement === 'function') {
    SvelteElement = class extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }
        connectedCallback() {
            // @ts-ignore todo: improve typings
            for (const key in this.$$.slotted) {
                // @ts-ignore todo: improve typings
                this.appendChild(this.$$.slotted[key]);
            }
        }
        attributeChangedCallback(attr, _oldValue, newValue) {
            this[attr] = newValue;
        }
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            // TODO should this delegate to addEventListener?
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    };
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set() {
        // overridden by instance, if it has props
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, detail));
}
function append_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node });
    detach(node);
}
function detach_between_dev(before, after) {
    while (before.nextSibling && before.nextSibling !== after) {
        detach_dev(before.nextSibling);
    }
}
function detach_before_dev(after) {
    while (after.previousSibling) {
        detach_dev(after.previousSibling);
    }
}
function detach_after_dev(before) {
    while (before.nextSibling) {
        detach_dev(before.nextSibling);
    }
}
function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
    const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
        modifiers.push('preventDefault');
    if (has_stop_propagation)
        modifiers.push('stopPropagation');
    dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
        dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
        dispose();
    };
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
    else
        dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
}
function prop_dev(node, property, value) {
    node[property] = value;
    dispatch_dev("SvelteDOMSetProperty", { node, property, value });
}
function dataset_dev(node, property, value) {
    node.dataset[property] = value;
    dispatch_dev("SvelteDOMSetDataset", { node, property, value });
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.data === data)
        return;
    dispatch_dev("SvelteDOMSetData", { node: text, data });
    text.data = data;
}
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error(`'target' is a required option`);
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn(`Component was already destroyed`); // eslint-disable-line no-console
        };
    }
}
function loop_guard(timeout) {
    const start = Date.now();
    return () => {
        if (Date.now() - start > timeout) {
            throw new Error(`Infinite loop detected`);
        }
    };
}




/***/ }),

/***/ "./node_modules/svelte/store/index.mjs":
/*!*********************************************!*\
  !*** ./node_modules/svelte/store/index.mjs ***!
  \*********************************************/
/*! exports provided: get, derived, readable, writable */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "derived", function() { return derived; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "readable", function() { return readable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "writable", function() { return writable; });
/* harmony import */ var _internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "get", function() { return _internal__WEBPACK_IMPORTED_MODULE_0__["get_store_value"]; });




const subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
    return {
        subscribe: writable(value, start).subscribe,
    };
}
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = _internal__WEBPACK_IMPORTED_MODULE_0__["noop"]) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (Object(_internal__WEBPACK_IMPORTED_MODULE_0__["safe_not_equal"])(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = _internal__WEBPACK_IMPORTED_MODULE_0__["noop"]) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || _internal__WEBPACK_IMPORTED_MODULE_0__["noop"];
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}
function derived(stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single
        ? [stores]
        : stores;
    const auto = fn.length < 2;
    return readable(initial_value, (set) => {
        let inited = false;
        const values = [];
        let pending = 0;
        let cleanup = _internal__WEBPACK_IMPORTED_MODULE_0__["noop"];
        const sync = () => {
            if (pending) {
                return;
            }
            cleanup();
            const result = fn(single ? values[0] : values, set);
            if (auto) {
                set(result);
            }
            else {
                cleanup = Object(_internal__WEBPACK_IMPORTED_MODULE_0__["is_function"])(result) ? result : _internal__WEBPACK_IMPORTED_MODULE_0__["noop"];
            }
        };
        const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) {
                sync();
            }
        }, () => {
            pending |= (1 << i);
        }));
        inited = true;
        sync();
        return function stop() {
            Object(_internal__WEBPACK_IMPORTED_MODULE_0__["run_all"])(unsubscribers);
            cleanup();
        };
    });
}




/***/ }),

/***/ "./node_modules/svue/src/svue.js":
/*!***************************************!*\
  !*** ./node_modules/svue/src/svue.js ***!
  \***************************************/
/*! exports provided: getParamNames, Svue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getParamNames", function() { return getParamNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Svue", function() { return Svue; });
/* harmony import */ var svelte_store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/store */ "./node_modules/svelte/store/index.mjs");


// From https://stackoverflow.com/a/9924463
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
const QUICK_ARROW = /^\s*([a-zA-Z0-9$_]+)\s*=>/;
function getParamNames(func) {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  const quickMatch = fnStr.match(QUICK_ARROW);
  if (quickMatch != null) return [quickMatch[1]];

  const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result === null) return [];

  // Personal additions to handle arrow functions
  const arrowIdx = result.indexOf('=>');
  if (arrowIdx != -1) return result.slice(0, arrowIdx);

  return result;
}

class Svue {
  constructor(structure) {
    this.data = {};
    this.writables = {};
    this.subscribeId = 0;
    this.subscribers = {};
    if (structure.data != null) this.initData(structure.data);
    if (structure.computed != null) this.initComputed(structure.computed);
    if (structure.watch != null) this.initWatch(structure.watch);
  }

  subscribe(fn) {
    fn(this);
    const subscribeId = this.subscribeId++;
    this.subscribers[subscribeId] = fn;
    return () => { // unsubscribe function
      delete this.subscribers[subscribeId];
    };
  }

  pingSubscriptions() {
    Object.keys(this.subscribers).forEach(subscriber => {
      this.subscribers[subscriber](this);
    });
  }

  initData(data) {
    const destructured = data();
    Object.keys(destructured).forEach(key => {
      let w = destructured[key];
      if (w == null || !w.set || !w.subscribe) {
        w = Object(svelte_store__WEBPACK_IMPORTED_MODULE_0__["writable"])(w);
      }
      this.writables[key] = w;
      Object.defineProperty(this, key, {
        get() {
          return Object(svelte_store__WEBPACK_IMPORTED_MODULE_0__["get"])(w);
        },
        set(newValue) {
          w.set(newValue);
        },
      });
      w.subscribe(() => this.pingSubscriptions());
    });
  }

  initComputed(computed) {
    const keys = Object.keys(computed);
    while (true) {
      if (keys.length == 0) break;

      let matched = false;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const args = getParamNames(computed[key]);
        if (!args.every(arg => this.writables[arg] != null)) continue;
        matched = true;
        const d = Object(svelte_store__WEBPACK_IMPORTED_MODULE_0__["derived"])(args.map(a => this.writables[a]), (args, setFn) => {
          const result = computed[key].bind(this)(...args);
          if (result && (typeof result.then) == 'function') {
            // Operate asynchronously if the function is a promise
            result.then((x) => setFn(x));
          } else {
            setFn(result);
          }
        });
        this.writables[key] = d;
        Object.defineProperty(this, key, {
          get() {
            return Object(svelte_store__WEBPACK_IMPORTED_MODULE_0__["get"])(d);
          },
        });
        d.subscribe(() => this.pingSubscriptions());
        keys.splice(i, 1);
        i--;
      }
      if (!matched) throw new Error("INVALID COMPUTED");
    }
  }

  initWatch(watch) {
    Object.keys(watch).forEach(key => {
      const chain = key.split('.');
      chain.reduce((x, k) => x.writables[k], this).subscribe(watch[key].bind(this));
    });
  }

  set(key, value) {
    if (key instanceof Svue) {
      return; // Already set (may be a bug in Svelte)
    }
    if (this.writables[key] == null) {
      throw new Error(`Invalid key: ${key}`);
    }
    this.writables[key].set(value);
  }

  update(fn) {
    let key = getParamNames(fn);
    if (key.length > 1) throw new Error("Only specify one arg for update");
    key = key[0];
    if (this.writables[key] == null) {
      throw new Error(`Invalid key: ${key}`);
    }
    this.writables[key].update(fn);
  }

  get(key) {
    return Object(svelte_store__WEBPACK_IMPORTED_MODULE_0__["get"])(this.writables[key]);
  }
}


/***/ }),

/***/ "./src/api/annotation.js":
/*!*******************************!*\
  !*** ./src/api/annotation.js ***!
  \*******************************/
/*! exports provided: createAnnotation, updateAnnotation, getAnnotations, getAnnotationsPage, getAnnotation, deleteAnnotation */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createAnnotation", function() { return createAnnotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateAnnotation", function() { return updateAnnotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAnnotations", function() { return getAnnotations; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAnnotationsPage", function() { return getAnnotationsPage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAnnotation", function() { return getAnnotation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deleteAnnotation", function() { return deleteAnnotation; });
/* harmony import */ var _session__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./session */ "./src/api/session.js");
/* harmony import */ var _structure_note__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/structure/note */ "./src/structure/note.js");
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./base */ "./src/api/base.js");
/* harmony import */ var _util_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/util/data */ "./src/util/data.js");
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/util/url */ "./src/util/url.js");
/* harmony import */ var _util_paginate__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/util/paginate */ "./src/util/paginate.js");
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./common */ "./src/api/common.js");
/**
 * Methods related to the DocumentCloud note API
 */









async function createAnnotation(
  id,
  page_number,
  title,
  content,
  access,
  x1,
  x2,
  y1,
  y2,
  me
) {
  // Create an annotation
  const { data } = await _session__WEBPACK_IMPORTED_MODULE_0__["default"].post(Object(_base__WEBPACK_IMPORTED_MODULE_2__["apiUrl"])(`documents/${id}/notes/`), {
    page_number,
    title,
    content,
    x1,
    x2,
    y1,
    y2,
    access
  });
  return new _structure_note__WEBPACK_IMPORTED_MODULE_1__["Note"](Object(_util_data__WEBPACK_IMPORTED_MODULE_3__["injectMe"])(data, me));
}

async function updateAnnotation(
  noteId,
  docId,
  page_number,
  title,
  content,
  access,
  x1,
  x2,
  y1,
  y2,
  me
) {
  // Update an annotation
  const { data } = await _session__WEBPACK_IMPORTED_MODULE_0__["default"].put(
    Object(_base__WEBPACK_IMPORTED_MODULE_2__["apiUrl"])(`documents/${docId}/notes/${noteId}/`),
    {
      page_number,
      title,
      content,
      x1,
      x2,
      y1,
      y2,
      access
    }
  );
  return new _structure_note__WEBPACK_IMPORTED_MODULE_1__["Note"](Object(_util_data__WEBPACK_IMPORTED_MODULE_3__["injectMe"])(data, me));
}

async function getAnnotations(id, expand = _common__WEBPACK_IMPORTED_MODULE_6__["DEFAULT_EXPAND"]) {
  // Returns annotations for the specified document
  const results = await Object(_util_paginate__WEBPACK_IMPORTED_MODULE_5__["grabAllPages"])(
    Object(_base__WEBPACK_IMPORTED_MODULE_2__["apiUrl"])(Object(_util_url__WEBPACK_IMPORTED_MODULE_4__["queryBuilder"])(`documents/${id}/notes/`, { expand }))
  );
  return results.map(result => new _structure_note__WEBPACK_IMPORTED_MODULE_1__["Note"](result));
}

async function getAnnotationsPage(id, expand = _common__WEBPACK_IMPORTED_MODULE_6__["DEFAULT_EXPAND"], page) {
  // Returns annotations for the specified document at the specified page
  const results = await Object(_util_paginate__WEBPACK_IMPORTED_MODULE_5__["grabAllPages"])(
    Object(_base__WEBPACK_IMPORTED_MODULE_2__["apiUrl"])(Object(_util_url__WEBPACK_IMPORTED_MODULE_4__["queryBuilder"])(`documents/${id}/notes/`, { expand, page_number: page }))
  );
  return results.map(result => new _structure_note__WEBPACK_IMPORTED_MODULE_1__["Note"](result));
}

async function getAnnotation(docId, noteId) {
  // Get the note with the specified id
  const { data } = await _session__WEBPACK_IMPORTED_MODULE_0__["default"].get(Object(_base__WEBPACK_IMPORTED_MODULE_2__["apiUrl"])(`documents/${docId}/notes/${noteId}/`));
  return new _structure_note__WEBPACK_IMPORTED_MODULE_1__["Note"](data);
}

async function deleteAnnotation(docId, noteId) {
  // Delete the note with the specified id
  await _session__WEBPACK_IMPORTED_MODULE_0__["default"].delete(Object(_base__WEBPACK_IMPORTED_MODULE_2__["apiUrl"])(`documents/${docId}/notes/${noteId}/`));
}


/***/ }),

/***/ "./src/api/base.js":
/*!*************************!*\
  !*** ./src/api/base.js ***!
  \*************************/
/*! exports provided: baseApiUrl, apiUrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "baseApiUrl", function() { return baseApiUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "apiUrl", function() { return apiUrl; });
const baseApiUrl = "http://api.dev.documentcloud.org" + "/api/";

function apiUrl(url) {
  return `${baseApiUrl}${url}`;
}


/***/ }),

/***/ "./src/api/common.js":
/*!***************************!*\
  !*** ./src/api/common.js ***!
  \***************************/
/*! exports provided: DEFAULT_ORDERING, USER_EXPAND, ORG_EXPAND, DEFAULT_EXPAND */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DEFAULT_ORDERING", function() { return DEFAULT_ORDERING; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "USER_EXPAND", function() { return USER_EXPAND; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ORG_EXPAND", function() { return ORG_EXPAND; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DEFAULT_EXPAND", function() { return DEFAULT_EXPAND; });
const DEFAULT_ORDERING = "-created_at";

const USER_EXPAND = "user";
const ORG_EXPAND = "organization";
const DEFAULT_EXPAND = [USER_EXPAND, ORG_EXPAND].join(",");


/***/ }),

/***/ "./src/api/document.js":
/*!*****************************!*\
  !*** ./src/api/document.js ***!
  \*****************************/
/*! exports provided: PENDING, getMe, getDocuments, searchDocuments, searchDocument, getDocument, getDocumentsWithIds, deleteDocument, renameDocument, changeAccess, reprocessDocument, cancelProcessing, redactDocument, addData, removeData, getEmbed, pollDocument, uploadDocuments */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(process) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PENDING", function() { return PENDING; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMe", function() { return getMe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDocuments", function() { return getDocuments; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "searchDocuments", function() { return searchDocuments; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "searchDocument", function() { return searchDocument; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDocument", function() { return getDocument; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDocumentsWithIds", function() { return getDocumentsWithIds; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deleteDocument", function() { return deleteDocument; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "renameDocument", function() { return renameDocument; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "changeAccess", function() { return changeAccess; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reprocessDocument", function() { return reprocessDocument; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cancelProcessing", function() { return cancelProcessing; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "redactDocument", function() { return redactDocument; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addData", function() { return addData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeData", function() { return removeData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getEmbed", function() { return getEmbed; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pollDocument", function() { return pollDocument; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "uploadDocuments", function() { return uploadDocuments; });
/* harmony import */ var _session__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./session */ "./src/api/session.js");
/* harmony import */ var _base__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./base */ "./src/api/base.js");
/* harmony import */ var _util_timeout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/util/timeout */ "./src/util/timeout.js");
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/util/url */ "./src/util/url.js");
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./common */ "./src/api/common.js");
/* harmony import */ var _util_paginate__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/util/paginate */ "./src/util/paginate.js");
/* harmony import */ var _structure_results__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/structure/results */ "./src/structure/results.js");
/* harmony import */ var _util_batchDelay__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/util/batchDelay */ "./src/util/batchDelay.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _structure_document__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @/structure/document */ "./src/structure/document.js");
/**
 * Methods related to the DocumentCloud document API
 */













const POLL_TIMEOUT = process.env.POLL_TIMEOUT;

const UPLOAD_BATCH = parseInt("25");
const UPLOAD_BATCH_DELAY = parseInt("1000");

const HIGHLIGHT_START = "<em>";
const HIGHLIGHT_END = "</em>";

// Statuses
const PENDING = "pending";

async function getMe(expand = _common__WEBPACK_IMPORTED_MODULE_4__["DEFAULT_EXPAND"]) {
  // Returns the currently logged in user
  const { data } = await _session__WEBPACK_IMPORTED_MODULE_0__["default"].get(
    Object(_util_url__WEBPACK_IMPORTED_MODULE_3__["queryBuilder"])(Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])("users/me/"), { expand })
  );
  return data;
}

async function getDocuments(
  extraParams = {},
  ordering = _common__WEBPACK_IMPORTED_MODULE_4__["DEFAULT_ORDERING"],
  page = 0,
  expand = _common__WEBPACK_IMPORTED_MODULE_4__["DEFAULT_EXPAND"]
) {
  // Return documents with the specified parameters
  const params = { ...extraParams, ordering, expand, page: page + 1 };
  // Inject remaining if grabbing pending docs
  if (status == PENDING) params["remaining"] = true;
  const url = Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(Object(_util_url__WEBPACK_IMPORTED_MODULE_3__["queryBuilder"])("documents/", params));
  const { data } = await _session__WEBPACK_IMPORTED_MODULE_0__["default"].get(url);
  data.results = data.results.map((document) => new _structure_document__WEBPACK_IMPORTED_MODULE_9__["Document"](document));
  return new _structure_results__WEBPACK_IMPORTED_MODULE_6__["Results"](url, data);
}

async function searchDocuments(
  query,
  page = 0,
  expand = _common__WEBPACK_IMPORTED_MODULE_4__["DEFAULT_EXPAND"]
) {
  // Return documents with the specified parameters
  const url = Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(
    Object(_util_url__WEBPACK_IMPORTED_MODULE_3__["queryBuilder"])("documents/search/", { q: query, expand, page: page + 1 })
  );
  const { data } = await _session__WEBPACK_IMPORTED_MODULE_0__["default"].get(url);

  // Fill in document data with a subsequent API call
  const docIds = data.results.map((document) => document.id);
  const newDocuments = await getDocumentsWithIds(docIds);
  for (let i = 0; i < newDocuments.length; i++) {
    newDocuments[i].doc = {
      ...newDocuments[i].doc,
      highlights: data.results[i].highlights,
    };
    data.results[i] = newDocuments[i];
  }

  return new _structure_results__WEBPACK_IMPORTED_MODULE_6__["Results"](url, data);
}

async function searchDocument(query, docId) {
  // Return documents with the specified parameters
  const url = Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(Object(_util_url__WEBPACK_IMPORTED_MODULE_3__["queryBuilder"])(`documents/${docId}/search/`, { q: query }));
  const { data } = await _session__WEBPACK_IMPORTED_MODULE_0__["default"].get(url);

  // Return search highlights in dictionary form
  return Object(_structure_document__WEBPACK_IMPORTED_MODULE_9__["transformHighlights"])(data, HIGHLIGHT_START, HIGHLIGHT_END, true);
}

async function getDocument(id, expand = _common__WEBPACK_IMPORTED_MODULE_4__["DEFAULT_EXPAND"]) {
  // Get a single document with the specified id
  const { data } = await _session__WEBPACK_IMPORTED_MODULE_0__["default"].get(
    Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(Object(_util_url__WEBPACK_IMPORTED_MODULE_3__["queryBuilder"])(`documents/${id}/`, { expand }))
  );
  return new _structure_document__WEBPACK_IMPORTED_MODULE_9__["Document"](data);
}

async function getDocumentsWithIds(
  ids,
  remaining = false,
  expand = _common__WEBPACK_IMPORTED_MODULE_4__["DEFAULT_EXPAND"]
) {
  if (ids.length == 0) return [];
  // Return documents with the specified ids
  const params = { expand, id__in: ids };
  if (remaining) params["remaining"] = true;
  const documents = await Object(_util_paginate__WEBPACK_IMPORTED_MODULE_5__["grabAllPages"])(
    Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(Object(_util_url__WEBPACK_IMPORTED_MODULE_3__["queryBuilder"])("documents/", params))
  );
  const docs = documents.map((document) => new _structure_document__WEBPACK_IMPORTED_MODULE_9__["Document"](document));
  const orderedDocs = [];
  for (let i = 0; i < ids.length; i++) {
    const matching = docs.filter((doc) => doc.id == ids[i]);
    if (matching.length == 0) continue;
    orderedDocs.push(matching[0]);
  }
  return orderedDocs;
}

async function deleteDocument(ids) {
  // Delete the documents with the specified ids
  await _session__WEBPACK_IMPORTED_MODULE_0__["default"].delete(
    Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(
      Object(_util_url__WEBPACK_IMPORTED_MODULE_3__["queryBuilder"])(`documents/`, {
        id__in: ids,
      })
    )
  );
}

async function renameDocument(ids, title) {
  // Rename the documents with the specified ids
  await _session__WEBPACK_IMPORTED_MODULE_0__["default"].patch(
    Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(`documents/`),
    ids.map((id) => ({ id, title }))
  );
}

async function changeAccess(ids, access) {
  // Change access for the documents with the specified ids
  await _session__WEBPACK_IMPORTED_MODULE_0__["default"].patch(
    Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(`documents/`),
    ids.map((id) => ({ id, access }))
  );
}

async function reprocessDocument(ids) {
  // Reprocess the documents with the specified ids
  await _session__WEBPACK_IMPORTED_MODULE_0__["default"].post(
    Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(`documents/process/`),
    ids.map((id) => ({ id }))
  );
}

async function cancelProcessing(id) {
  // Cancel processing the document with the specified id
  const { data } = await _session__WEBPACK_IMPORTED_MODULE_0__["default"].delete(Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(`documents/${id}/process`));
  return data;
}

async function redactDocument(id, redactions) {
  // Redact the document with the specified id and redactions
  await _session__WEBPACK_IMPORTED_MODULE_0__["default"].post(
    Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(`documents/${id}/redactions/`),
    redactions.map((redaction) => redaction.note)
  );
}

async function addData(id, key, value) {
  // TODO: Url encode data key?
  await _session__WEBPACK_IMPORTED_MODULE_0__["default"].patch(Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(`documents/${id}/data/${key}/`), {
    values: [value],
  });
}

async function removeData(id, key, value) {
  // TODO: Url encode data key?
  await _session__WEBPACK_IMPORTED_MODULE_0__["default"].patch(Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(`documents/${id}/data/${key}/`), {
    remove: [value],
  });
}

async function getEmbed(url) {
  const { data } = await _session__WEBPACK_IMPORTED_MODULE_0__["default"].get(
    Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(`oembed?url=${encodeURIComponent(url)}`)
  );
  return data;
}

/**
 * Polls the specified document, repeatedly requesting it until the specified condition is met.
 * @param {string} id The document id to poll
 * @param {Function} docFn A function to run each time the document is retrieved
 * @param {Function} doneFn A function to run when polling stops
 * @param {Function} conditionFn A function to test each doc and stop polling if it returns true.
 *     Defaults to check if the doc is not pending.
 */
async function pollDocument(
  id,
  docFn,
  doneFn,
  conditionFn = (doc) => doc.nonPending
) {
  let doc;
  try {
    // Attempt to fetch the document
    doc = await getDocument(id);
  } catch (e) {
    // Doc was potentially deleted
    // TODO: Investigate whether should call done or add a deleteFn (or handle fn)
    return;
  }
  // Trigger the new document function
  if (docFn != null) docFn(doc);

  // Test for the document being finished
  if (conditionFn(doc)) {
    if (doneFn != null) doneFn(doc);
    return;
  }

  // Retrigger after timeout
  await Object(_util_timeout__WEBPACK_IMPORTED_MODULE_2__["timeout"])(POLL_TIMEOUT);
  pollDocument(id, docFn, doneFn, conditionFn);
}

/**
 * Uploads the specified documents, providing callbacks for progress updates
 * @param {Array<Document>} docs The documents to upload
 * @param {string} access The access level of the uploaded docs ("private", "organization", or "public")
 * @param {Function} progressFn A function to call with upload progress
 * @param {Function} allCompleteFn A function to call when all docs upload
 * @param {Function} errorFn A function to call when an error occurs
 */
async function uploadDocuments(
  docs,
  access,
  progressFn,
  allCompleteFn,
  errorFn
) {
  // Set initial progresses
  const progresses = [];
  const toComplete = [];
  for (let i = 0; i < docs.length; i++) {
    progresses.push({
      progress: 0,
    });
    toComplete.push(i);
  }

  // Allocate documents with the appropriate titles.
  let newDocuments;
  try {
    const data = await Object(_util_batchDelay__WEBPACK_IMPORTED_MODULE_7__["batchDelay"])(
      docs,
      UPLOAD_BATCH,
      UPLOAD_BATCH_DELAY,
      async (subDocs) => {
        const { data } = await _session__WEBPACK_IMPORTED_MODULE_0__["default"].post(
          Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])("documents/"),
          subDocs.map((doc) => ({ title: doc.name, access }))
        );
        return data;
      }
    );
    newDocuments = data;
  } catch (e) {
    console.error(e);
    return errorFn("failed to create the document", e);
  }

  // Upload all the files
  try {
    await Promise.all(
      docs.map((doc, i) => {
        const url = newDocuments[i].presigned_url;
        const file = doc.file;

        return axios__WEBPACK_IMPORTED_MODULE_8___default.a.put(url, file, {
          headers: {
            "Content-Type": "application/pdf",
          },
          onUploadProgress: (progressEvent) => {
            // Handle upload progress
            const progress = progressEvent.loaded / progressEvent.total;
            progresses[i].progress = progress;
            progressFn(i, progress);
          },
        });
      })
    );
  } catch (e) {
    console.error(e);
    return errorFn("failed to upload the document", e);
  }

  // Once all the files have uploaded, begin processing.
  const ids = newDocuments.map((doc) => doc.id);
  try {
    await Object(_util_batchDelay__WEBPACK_IMPORTED_MODULE_7__["batchDelay"])(
      ids,
      UPLOAD_BATCH,
      UPLOAD_BATCH_DELAY,
      async (subIds) =>
        await _session__WEBPACK_IMPORTED_MODULE_0__["default"].post(
          Object(_base__WEBPACK_IMPORTED_MODULE_1__["apiUrl"])(`documents/process/`),
          subIds.map((id) => ({ id }))
        )
    );
  } catch (e) {
    console.error(e);
    return errorFn("failed to start processing the document", e);
  }

  // Handle document completion
  allCompleteFn(ids);
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./src/api/pageSize.js":
/*!*****************************!*\
  !*** ./src/api/pageSize.js ***!
  \*****************************/
/*! exports provided: pageSizesFromSpec */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pageSizesFromSpec", function() { return pageSizesFromSpec; });
/**
 * Parses the page spec format (as "crunched" by the Python
 * [listcrunch](https://github.com/MuckRock/listcrunch) modules) and returns an
 * array of page aspect ratios.
 * @param {string} pageSpec A string encoding page dimensions in a compact format
 * @returns {Array<number>} An array of aspect ratios for each page
 */
function pageSizesFromSpec(pageSpec) {
  // Handle empty page spec
  if (pageSpec.trim().length == 0) return [];

  const parts = pageSpec.split(";");
  const sizes = [];
  for (let i = 0; i < parts.length; i++) {
    // Go through each part, e.g. 100x200:0-5
    const part = parts[i];
    const [size, range] = part.split(":");

    const [width, height] = size.split("x").map(parseFloat);
    const aspect = height / width;

    const rangeParts = range.split(",");
    for (let j = 0; j < rangeParts.length; j++) {
      const rangePart = rangeParts[j];
      if (rangePart.indexOf("-") != -1) {
        // Parse a range
        const [start, end] = rangePart.split("-").map(x => parseInt(x, 10));
        for (let page = start; page <= end; page++) {
          sizes[page] = aspect;
        }
      } else {
        // Parse a single page
        const page = parseInt(rangePart, 10);
        sizes[page] = aspect;
      }
    }
  }

  return sizes;
}


/***/ }),

/***/ "./src/api/session.js":
/*!****************************!*\
  !*** ./src/api/session.js ***!
  \****************************/
/*! exports provided: SessionCache, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SessionCache", function() { return SessionCache; });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);


const CSRF_COOKIE_NAME = "csrftoken";
const CSRF_HEADER_NAME = "X-CSRFToken";

const session = axios__WEBPACK_IMPORTED_MODULE_0___default.a.create({
  xsrfCookieName: CSRF_COOKIE_NAME,
  xsrfHeaderName: CSRF_HEADER_NAME,
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest"
  }
});

session.interceptors.response.use(
  response => {
    // Keep response unchanged
    return response;
  },
  error => {
    // Do something with response error
    if (error.response && error.response.data) {
      return Promise.reject({ errorData: error.response.data });
    }
    return Promise.reject(error);
  }
);

const CACHE_LIMIT = 50;

class SessionCache {
  constructor() {
    this.cached = [];
    this.cachedByUrl = {};
  }

  trimCache() {
    while (this.cached.length > CACHE_LIMIT) {
      const { url } = this.cached.shift();
      delete this.cachedByUrl[url];
    }
  }

  cache(url, contents) {
    this.cached.push({ url, contents });
    this.cachedByUrl[url] = contents;
    this.trimCache();
  }

  has(url) {
    return this.cachedByUrl.hasOwnProperty(url);
  }

  lookup(url) {
    if (this.has(url)) return this.cachedByUrl[url];
    return null;
  }
}

const sessionCache = new SessionCache();

session.getStatic = async function getStatic(url) {
  if (sessionCache.has(url)) return sessionCache.lookup(url);

  if (url.startsWith("http://api.dev.documentcloud.org")) {
    const redirectUrl = (await session.get(url)).data.location;
    const result = (await axios__WEBPACK_IMPORTED_MODULE_0___default.a.get(redirectUrl)).data;
    sessionCache.cache(url, result);
    return result;
  } else {
    const result = (await axios__WEBPACK_IMPORTED_MODULE_0___default.a.get(url)).data;
    sessionCache.cache(url, result);
    return result;
  }
};

/* harmony default export */ __webpack_exports__["default"] = (session);


/***/ }),

/***/ "./src/api/viewer.js":
/*!***************************!*\
  !*** ./src/api/viewer.js ***!
  \***************************/
/*! exports provided: imageWidths, documentDimensionUrl, pageImageUrl, textUrl, jsonUrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "imageWidths", function() { return imageWidths; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "documentDimensionUrl", function() { return documentDimensionUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pageImageUrl", function() { return pageImageUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "textUrl", function() { return textUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "jsonUrl", function() { return jsonUrl; });
function processImageWidths(widthSpec) {
  let result = widthSpec.split(",").map(width => {
    const parts = width.split(":");
    return [parseFloat(parts[1]), parts[0]];
  });
  result = result.sort((a, b) => a[0] - b[0]);
  return result;
}

const imageWidths = processImageWidths("xlarge:2000,large:1000,normal:700,small:180,thumbnail:60");

function documentDimensionUrl(document) {
  return `${document.assetUrl}documents/${document.id}/${document.slug}.pagesize`;
}

/**
 * Returns the desired page image size (e.g. "large", "normal", "small") given
 * a desired width to render at.
 * @param {number} desiredWidth The desired width of the page image.
 */
function getDesiredSize(desiredWidth) {
  for (let i = 0; i < imageWidths.length; i++) {
    const [width, name] = imageWidths[i];
    if (desiredWidth <= width) return name;
  }
  return imageWidths[imageWidths.length - 1][1];
}

function pageImageUrl(
  document,
  pageNumber,
  desiredWidth,
) {
  // Incorporate device's DPI into scaling to avoid blurring.
  const size = getDesiredSize(desiredWidth);

  return `${document.assetUrl}documents/${document.id}/pages/${
    document.slug
    }-p${pageNumber + 1}-${size}.gif?ts=${document.updatedAtTimestamp}`;
}

function textUrl(document, pageNumber) {
  return `${document.assetUrl}documents/${document.id}/pages/${
    document.slug
    }-p${pageNumber + 1}.txt?ts=${document.updatedAtTimestamp}`;
}

function jsonUrl(document) {
  return `${document.assetUrl}documents/${document.id}/${
    document.slug
    }.txt.json`;
}


/***/ }),

/***/ "./src/common/ProgressiveImage.svelte":
/*!********************************************!*\
  !*** ./src/common/ProgressiveImage.svelte ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony import */ var svelte__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! svelte */ "./node_modules/svelte/index.mjs");
/* harmony import */ var _api_viewer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/api/viewer */ "./src/api/viewer.js");
/* src/common/ProgressiveImage.svelte generated by Svelte v3.16.7 */





function add_css() {
	var style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("style");
	style.id = "svelte-1jksr6q-style";
	style.textContent = "div.svelte-1jksr6q{position:relative;width:100%;background:white;border:solid 1px gainsboro;box-sizing:border-box}div.svelte-1jksr6q img{position:absolute;width:100%;height:100%;top:0;left:0;user-drag:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;transition:opacity 0.2s linear;opacity:0}div.svelte-1jksr6q img.loaded{opacity:1}div.grayed.svelte-1jksr6q{-webkit-filter:brightness(0.8);filter:brightness(0.8)}div.crosshair.svelte-1jksr6q{cursor:crosshair}";
	Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(document.head, style);
}

function create_fragment(ctx) {
	let div;

	return {
		c() {
			div = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("div");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(div, "padding-top", /*aspect*/ ctx[0] * 100 + "%");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(div, "class", "svelte-1jksr6q");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["toggle_class"])(div, "grayed", /*grayed*/ ctx[1]);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["toggle_class"])(div, "crosshair", /*crosshair*/ ctx[2]);
		},
		m(target, anchor) {
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["insert"])(target, div, anchor);
			/*div_binding*/ ctx[18](div);
		},
		p(ctx, [dirty]) {
			if (dirty & /*aspect*/ 1) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(div, "padding-top", /*aspect*/ ctx[0] * 100 + "%");
			}

			if (dirty & /*grayed*/ 2) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["toggle_class"])(div, "grayed", /*grayed*/ ctx[1]);
			}

			if (dirty & /*crosshair*/ 4) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["toggle_class"])(div, "crosshair", /*crosshair*/ ctx[2]);
			}
		},
		i: svelte_internal__WEBPACK_IMPORTED_MODULE_0__["noop"],
		o: svelte_internal__WEBPACK_IMPORTED_MODULE_0__["noop"],
		d(detaching) {
			if (detaching) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["detach"])(div);
			/*div_binding*/ ctx[18](null);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { alt } = $$props;
	let { page } = $$props;
	let { width } = $$props;
	let { aspect } = $$props;
	let { grayed = false } = $$props;
	let { crosshair = false } = $$props;
	let elem;
	let destroyed = false;
	let imgs = [];
	let loading = {};
	let largestLoaded = -1;
	const IMAGE_WIDTHS = "xlarge:2000,large:1000,normal:700,small:180,thumbnail:60".split(",").map(x => x.split(":")).map(x => [parseFloat(x[1]), x[0]]).sort((a, b) => a[0] - b[0]);
	const NORMAL_WIDTH = IMAGE_WIDTHS.map((x, i) => [x, i]).filter(x => x[0][1] == "normal")[0];
	let srcs = [];
	let mounted = false;

	Object(svelte__WEBPACK_IMPORTED_MODULE_1__["onMount"])(() => {
		loadImg(0);
		$$invalidate(10, mounted = true);
	});

	function nixOlder(keepIndex) {
		imgs.filter(x => x[1] < keepIndex).forEach(x => {
			x[0].src = "";
			x[0].remove();
		});
	}

	function handleLoad(img, i) {
		if (i < largestLoaded) return;
		elem.appendChild(img);
		imgs.push([img, i]);

		if (largestLoaded == -1) {
			img.style.opacity = 1;
		} else {
			img.addEventListener("transitionend", () => {
				nixOlder(i);
			});

			setTimeout(() => img.className = "loaded", 100);
		}

		largestLoaded = i;
	}

	function loadImg(i) {
		if (i < largestLoaded) return;
		if (loading[i]) return;
		loading[i] = true;
		const src = Object(_api_viewer__WEBPACK_IMPORTED_MODULE_2__["pageImageUrl"])(page.document, page.pageNumber, IMAGE_WIDTHS[i][0]);
		const img = new Image();
		img.ondragstart = () => false;

		img.onload = () => {
			if (!destroyed) {
				handleLoad(img, i);
			}
		};

		img.onerror = () => {
			if (i > 0) loadImg(i - 1);
		};

		img.alt = alt;
		img.src = src;
		return img;
	}

	Object(svelte__WEBPACK_IMPORTED_MODULE_1__["onDestroy"])(() => {
		destroyed = true;
		imgs.forEach(img => img[0].src = "");
	});

	function div_binding($$value) {
		svelte_internal__WEBPACK_IMPORTED_MODULE_0__["binding_callbacks"][$$value ? "unshift" : "push"](() => {
			$$invalidate(3, elem = $$value);
		});
	}

	$$self.$set = $$props => {
		if ("alt" in $$props) $$invalidate(4, alt = $$props.alt);
		if ("page" in $$props) $$invalidate(5, page = $$props.page);
		if ("width" in $$props) $$invalidate(6, width = $$props.width);
		if ("aspect" in $$props) $$invalidate(0, aspect = $$props.aspect);
		if ("grayed" in $$props) $$invalidate(1, grayed = $$props.grayed);
		if ("crosshair" in $$props) $$invalidate(2, crosshair = $$props.crosshair);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*mounted, width*/ 1088) {
			$: {
				if (mounted) {
					const effectiveWidth = width * (window.devicePixelRatio || 1);

					if (effectiveWidth > NORMAL_WIDTH[0][0]) {
						loadImg(NORMAL_WIDTH[1]);
					}

					let loaded = false;

					for (let i = 0; i < IMAGE_WIDTHS.length; i++) {
						if (effectiveWidth < IMAGE_WIDTHS[i][0]) {
							loadImg(i);
							loaded = true;
							break;
						}
					}

					if (!loaded) loadImg(IMAGE_WIDTHS.length - 1);
				}
			}
		}
	};

	return [
		aspect,
		grayed,
		crosshair,
		elem,
		alt,
		page,
		width,
		destroyed,
		loading,
		largestLoaded,
		mounted,
		imgs,
		IMAGE_WIDTHS,
		NORMAL_WIDTH,
		srcs,
		nixOlder,
		handleLoad,
		loadImg,
		div_binding
	];
}

class ProgressiveImage extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__["SvelteComponent"] {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1jksr6q-style")) add_css();

		Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["init"])(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__["safe_not_equal"], {
			alt: 4,
			page: 5,
			width: 6,
			aspect: 0,
			grayed: 1,
			crosshair: 2
		});
	}
}


if (false) {}

/* harmony default export */ __webpack_exports__["default"] = (ProgressiveImage);


/***/ }),

/***/ "./src/noteLoader.js":
/*!***************************!*\
  !*** ./src/noteLoader.js ***!
  \***************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _pages_embed_Note__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/pages/embed/Note */ "./src/pages/embed/Note.svelte");


const enhanced = 'DC-embed-enhanced';

function loadNote(src) {
  const parts = src.split('/').slice(-3);
  if (parts.length != 3) return;
  const slugId = parts[0];
  const slugIdParts = slugId.split('-');
  const id = slugIdParts[0];
  const noteId = parts[2].replace(/[^0-9]/g, '');

  document.querySelectorAll(`#DC-note-${noteId}`).forEach(noteElem => {
    if (noteElem.className.indexOf(enhanced) != -1) return;
    noteElem.className += ' ' + enhanced;
    new _pages_embed_Note__WEBPACK_IMPORTED_MODULE_0__["default"]({
      target: noteElem,
      props: {
        id, noteId
      }
    });
  });
}

if (window['dc'] == null) window['dc'] = {};
if (window['dc']['embed'] == null) window['dc']['embed'] = {};
if (window['dc']['embed']['loadNote'] == null) window['dc']['embed']['loadNote'] = loadNote;


/***/ }),

/***/ "./src/pages/embed/Note.svelte":
/*!*************************************!*\
  !*** ./src/pages/embed/Note.svelte ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var svelte_internal__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svelte/internal */ "./node_modules/svelte/internal/index.mjs");
/* harmony import */ var _common_ProgressiveImage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/common/ProgressiveImage */ "./src/common/ProgressiveImage.svelte");
/* harmony import */ var dompurify__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! dompurify */ "./node_modules/dompurify/dist/purify.js");
/* harmony import */ var dompurify__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(dompurify__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _api_annotation__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/api/annotation */ "./src/api/annotation.js");
/* harmony import */ var _api_document__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/api/document */ "./src/api/document.js");
/* harmony import */ var _api_viewer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/api/viewer */ "./src/api/viewer.js");
/* harmony import */ var svelte__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! svelte */ "./node_modules/svelte/index.mjs");
/* src/pages/embed/Note.svelte generated by Svelte v3.16.7 */









function add_css() {
	var style = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("style");
	style.id = "svelte-s76zzw-style";
	style.textContent = ".DC-note.svelte-s76zzw.svelte-s76zzw{position:relative;padding:0 0.5em;margin:2em 0;border:1px solid #ebebeb;box-shadow:inset 0 0 40px #505050;font:400 10pt/14pt -apple-system, system-ui, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;color:black;background-color:white;background-size:100% auto;background-repeat:no-repeat;background-position:center center}.DC-note.svelte-s76zzw a.svelte-s76zzw{color:#5a76a0;text-decoration:underline}.DC-note.svelte-s76zzw>.svelte-s76zzw{position:relative;z-index:1}.DC-note.svelte-s76zzw .DC-note-header.svelte-s76zzw,.DC-note.svelte-s76zzw .DC-note-body.svelte-s76zzw,.DC-note.svelte-s76zzw .DC-note-credit.svelte-s76zzw{margin:10px auto;padding:0 5px;max-width:600px}.DC-note.svelte-s76zzw .DC-note-title.svelte-s76zzw{font-weight:bold}.DC-note.svelte-s76zzw .DC-note-image-max-bounds.svelte-s76zzw{box-sizing:border-box;border-radius:3px;box-shadow:0 0 7px rgba(0, 0, 0, 0.25);position:relative;font-size:0;overflow:hidden;margin:10px auto}.DC-note.svelte-s76zzw .DC-note-image-max-bounds.public.svelte-s76zzw{border:3px solid #ffe325}.DC-note.svelte-s76zzw .DC-note-image-max-bounds.organization.svelte-s76zzw{border:3px solid #93e48f}.DC-note.svelte-s76zzw .DC-note-image-max-bounds.private.svelte-s76zzw{border:3px solid #6bc2f8}.DC-note.svelte-s76zzw .DC-note-image-max-bounds .DC-note-image-aspect-ratio.svelte-s76zzw{position:relative;overflow:hidden;height:0;max-width:100%}.DC-note.svelte-s76zzw .DC-note-image-max-bounds .DC-note-image-aspect-ratio .DC-note-image-link.svelte-s76zzw{position:absolute;width:100%;height:100%;top:0;left:0;right:0;bottom:0;overflow:hidden;display:block}.DC-note.svelte-s76zzw .DC-note-image-max-bounds .DC-note-image-aspect-ratio .DC-note-image-link.svelte-s76zzw img{margin:0 !important;border:0 !important;outline:0 !important;max-width:none !important;max-height:none !important;display:block !important;position:absolute;height:auto}.DC-note.svelte-s76zzw .DC-note-credit.svelte-s76zzw{font-size:0.9em}.DC-note.svelte-s76zzw .DC-note-logotype-link.svelte-s76zzw{font-weight:700;font-family:-apple-system, system-ui, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif}.DC-note.svelte-s76zzw .DC-note-background-fader.svelte-s76zzw{position:absolute;width:100%;height:100%;top:0;left:0;right:0;bottom:0;z-index:0;background-color:rgba(255, 255, 255, 0.93)}";
	Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(document.head, style);
}

// (125:0) {#if note != null && doc != null}
function create_if_block(ctx) {
	let div6;
	let div0;
	let a0;
	let span0;
	let t0_value = /*note*/ ctx[1].title + "";
	let t0;
	let t1;
	let span1;
	let t2;
	let t3_value = /*note*/ ctx[1].page + 1 + "";
	let t3;
	let t4;
	let a0_href_value;
	let a0_title_value;
	let t5;
	let div2;
	let div1;
	let a1;
	let a1_href_value;
	let t6;
	let div3;
	let raw_value = dompurify__WEBPACK_IMPORTED_MODULE_2___default.a.sanitize(/*note*/ ctx[1].content) + "";
	let t7;
	let div4;
	let a2;
	let t8;
	let span2;
	let a2_href_value;
	let a2_title_value;
	let t10;
	let div5;
	let current;

	const progressiveimage = new _common_ProgressiveImage__WEBPACK_IMPORTED_MODULE_1__["default"]({
			props: {
				alt: "Page " + (/*note*/ ctx[1].page + 1) + " of " + /*doc*/ ctx[0].title,
				width: docWidth,
				aspect: /*aspect*/ ctx[2],
				page: {
					document: /*doc*/ ctx[0],
					pageNumber: /*note*/ ctx[1].page
				}
			}
		});

	return {
		c() {
			div6 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("div");
			div0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("div");
			a0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("a");
			span0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("span");
			t0 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["text"])(t0_value);
			t1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["space"])();
			span1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("span");
			t2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["text"])("(p. ");
			t3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["text"])(t3_value);
			t4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["text"])(")");
			t5 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["space"])();
			div2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("div");
			div1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("div");
			a1 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("a");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["create_component"])(progressiveimage.$$.fragment);
			t6 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["space"])();
			div3 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("div");
			t7 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["space"])();
			div4 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("div");
			a2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("a");
			t8 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["text"])("View the entire document with\n        ");
			span2 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("span");
			span2.textContent = "DocumentCloud";
			t10 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["space"])();
			div5 = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["element"])("div");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(span0, "class", "DC-note-title svelte-s76zzw");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(span1, "class", "DC-note-page-number");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a0, "href", a0_href_value = /*doc*/ ctx[0].noteUrl(/*note*/ ctx[1]));
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a0, "class", "DC-note-embed-resource svelte-s76zzw");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a0, "target", "_blank");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a0, "title", a0_title_value = "View the note ‘" + /*note*/ ctx[1].title + "’ in its original document context on\n        DocumentCloud in a new window or tab");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(div0, "class", "DC-note-header svelte-s76zzw");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a1, "href", a1_href_value = /*doc*/ ctx[0].noteUrl(/*note*/ ctx[1]));
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a1, "target", "_blank");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a1, "class", "DC-note-image-link svelte-s76zzw");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(a1, "left", "-" + /*note*/ ctx[1].x1 * 100 / /*note*/ ctx[1].width + "%");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(a1, "top", "-" + /*note*/ ctx[1].y1 * 100 / /*note*/ ctx[1].height + "%");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(a1, "width", 100 / /*note*/ ctx[1].width + "%");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(a1, "height", 100 / /*note*/ ctx[1].height + "%");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(div1, "class", "DC-note-image-aspect-ratio svelte-s76zzw");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(div1, "padding-bottom", /*note*/ ctx[1].height / /*note*/ ctx[1].width * /*aspect*/ ctx[2] * 100 + "%");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(div2, "class", "DC-note-image-max-bounds svelte-s76zzw");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(div2, "max-width", /*maxWidth*/ ctx[3] + "px");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["toggle_class"])(div2, "public", /*note*/ ctx[1].access == "public");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["toggle_class"])(div2, "organization", /*note*/ ctx[1].access == "organization");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["toggle_class"])(div2, "private", /*note*/ ctx[1].access == "private");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(div3, "class", "DC-note-body svelte-s76zzw");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(span2, "class", "DC-note-logotype-link svelte-s76zzw");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a2, "href", a2_href_value = /*doc*/ ctx[0].noteUrl(/*note*/ ctx[1]));
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a2, "target", "_blank");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a2, "title", a2_title_value = "View the note ‘" + /*note*/ ctx[1].title + "’ in its original document context on\n        DocumentCloud in a new window or tab");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a2, "class", "svelte-s76zzw");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(div4, "class", "DC-note-credit svelte-s76zzw");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(div5, "class", "DC-note-background-fader svelte-s76zzw");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(div6, "class", "DC-note svelte-s76zzw");
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(div6, "background-image", "url(" + Object(_api_viewer__WEBPACK_IMPORTED_MODULE_5__["pageImageUrl"])(/*doc*/ ctx[0], /*note*/ ctx[1].page, /*LARGE_WIDTH*/ ctx[4]) + ")");
		},
		m(target, anchor) {
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["insert"])(target, div6, anchor);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(div6, div0);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(div0, a0);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(a0, span0);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(span0, t0);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(a0, t1);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(a0, span1);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(span1, t2);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(span1, t3);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(span1, t4);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(div6, t5);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(div6, div2);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(div2, div1);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(div1, a1);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["mount_component"])(progressiveimage, a1, null);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(div6, t6);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(div6, div3);
			div3.innerHTML = raw_value;
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(div6, t7);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(div6, div4);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(div4, a2);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(a2, t8);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(a2, span2);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(div6, t10);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["append"])(div6, div5);
			current = true;
		},
		p(ctx, dirty) {
			if ((!current || dirty & /*note*/ 2) && t0_value !== (t0_value = /*note*/ ctx[1].title + "")) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_data"])(t0, t0_value);
			if ((!current || dirty & /*note*/ 2) && t3_value !== (t3_value = /*note*/ ctx[1].page + 1 + "")) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_data"])(t3, t3_value);

			if (!current || dirty & /*doc, note*/ 3 && a0_href_value !== (a0_href_value = /*doc*/ ctx[0].noteUrl(/*note*/ ctx[1]))) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a0, "href", a0_href_value);
			}

			if (!current || dirty & /*note*/ 2 && a0_title_value !== (a0_title_value = "View the note ‘" + /*note*/ ctx[1].title + "’ in its original document context on\n        DocumentCloud in a new window or tab")) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a0, "title", a0_title_value);
			}

			const progressiveimage_changes = {};
			if (dirty & /*note, doc*/ 3) progressiveimage_changes.alt = "Page " + (/*note*/ ctx[1].page + 1) + " of " + /*doc*/ ctx[0].title;
			if (dirty & /*aspect*/ 4) progressiveimage_changes.aspect = /*aspect*/ ctx[2];

			if (dirty & /*doc, note*/ 3) progressiveimage_changes.page = {
				document: /*doc*/ ctx[0],
				pageNumber: /*note*/ ctx[1].page
			};

			progressiveimage.$set(progressiveimage_changes);

			if (!current || dirty & /*doc, note*/ 3 && a1_href_value !== (a1_href_value = /*doc*/ ctx[0].noteUrl(/*note*/ ctx[1]))) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a1, "href", a1_href_value);
			}

			if (!current || dirty & /*note*/ 2) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(a1, "left", "-" + /*note*/ ctx[1].x1 * 100 / /*note*/ ctx[1].width + "%");
			}

			if (!current || dirty & /*note*/ 2) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(a1, "top", "-" + /*note*/ ctx[1].y1 * 100 / /*note*/ ctx[1].height + "%");
			}

			if (!current || dirty & /*note*/ 2) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(a1, "width", 100 / /*note*/ ctx[1].width + "%");
			}

			if (!current || dirty & /*note*/ 2) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(a1, "height", 100 / /*note*/ ctx[1].height + "%");
			}

			if (!current || dirty & /*note, aspect*/ 6) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(div1, "padding-bottom", /*note*/ ctx[1].height / /*note*/ ctx[1].width * /*aspect*/ ctx[2] * 100 + "%");
			}

			if (!current || dirty & /*maxWidth*/ 8) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(div2, "max-width", /*maxWidth*/ ctx[3] + "px");
			}

			if (dirty & /*note*/ 2) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["toggle_class"])(div2, "public", /*note*/ ctx[1].access == "public");
			}

			if (dirty & /*note*/ 2) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["toggle_class"])(div2, "organization", /*note*/ ctx[1].access == "organization");
			}

			if (dirty & /*note*/ 2) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["toggle_class"])(div2, "private", /*note*/ ctx[1].access == "private");
			}

			if ((!current || dirty & /*note*/ 2) && raw_value !== (raw_value = dompurify__WEBPACK_IMPORTED_MODULE_2___default.a.sanitize(/*note*/ ctx[1].content) + "")) div3.innerHTML = raw_value;;

			if (!current || dirty & /*doc, note*/ 3 && a2_href_value !== (a2_href_value = /*doc*/ ctx[0].noteUrl(/*note*/ ctx[1]))) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a2, "href", a2_href_value);
			}

			if (!current || dirty & /*note*/ 2 && a2_title_value !== (a2_title_value = "View the note ‘" + /*note*/ ctx[1].title + "’ in its original document context on\n        DocumentCloud in a new window or tab")) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["attr"])(a2, "title", a2_title_value);
			}

			if (!current || dirty & /*doc, note*/ 3) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["set_style"])(div6, "background-image", "url(" + Object(_api_viewer__WEBPACK_IMPORTED_MODULE_5__["pageImageUrl"])(/*doc*/ ctx[0], /*note*/ ctx[1].page, /*LARGE_WIDTH*/ ctx[4]) + ")");
			}
		},
		i(local) {
			if (current) return;
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["transition_in"])(progressiveimage.$$.fragment, local);
			current = true;
		},
		o(local) {
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["transition_out"])(progressiveimage.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["detach"])(div6);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["destroy_component"])(progressiveimage);
		}
	};
}

function create_fragment(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*note*/ ctx[1] != null && /*doc*/ ctx[0] != null && create_if_block(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["empty"])();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["insert"])(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*note*/ ctx[1] != null && /*doc*/ ctx[0] != null) {
				if (if_block) {
					if_block.p(ctx, dirty);
					Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["transition_in"])(if_block, 1);
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["transition_in"])(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["group_outros"])();

				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["transition_out"])(if_block, 1, 1, () => {
					if_block = null;
				});

				Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["check_outros"])();
			}
		},
		i(local) {
			if (current) return;
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["transition_in"])(if_block);
			current = true;
		},
		o(local) {
			Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["transition_out"])(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["detach"])(if_block_anchor);
		}
	};
}

const docWidth = 700;

function instance($$self, $$props, $$invalidate) {
	let { id } = $$props;
	let { noteId } = $$props;
	let doc = null;
	let note = null;
	const IMAGE_WIDTHS = "xlarge:2000,large:1000,normal:700,small:180,thumbnail:60".split(",").map(x => x.split(":")).map(x => [parseFloat(x[1]), x[0]]).sort((a, b) => a[0] - b[0]);
	const LARGE_WIDTH = IMAGE_WIDTHS.map((x, i) => [x, i]).filter(x => x[0][1] == "large")[0];

	Object(svelte__WEBPACK_IMPORTED_MODULE_6__["onMount"])(async () => {
		$$invalidate(0, doc = await Object(_api_document__WEBPACK_IMPORTED_MODULE_4__["getDocument"])(docId));
		$$invalidate(1, note = await Object(_api_annotation__WEBPACK_IMPORTED_MODULE_3__["getAnnotation"])(docId, noteId));
	});

	$$self.$set = $$props => {
		if ("id" in $$props) $$invalidate(5, id = $$props.id);
		if ("noteId" in $$props) $$invalidate(6, noteId = $$props.noteId);
	};

	let docId;
	let aspect;
	let maxWidth;

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*id*/ 32) {
			$: docId = id.split("-")[0];
		}

		if ($$self.$$.dirty & /*doc, note*/ 3) {
			$: $$invalidate(2, aspect = doc == null || note == null
			? 0
			: doc.pageSizes[note.page]);
		}

		if ($$self.$$.dirty & /*note*/ 2) {
			$: $$invalidate(3, maxWidth = note == null ? 0 : docWidth * note.width);
		}
	};

	return [doc, note, aspect, maxWidth, LARGE_WIDTH, id, noteId];
}

class Note extends svelte_internal__WEBPACK_IMPORTED_MODULE_0__["SvelteComponent"] {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-s76zzw-style")) add_css();
		Object(svelte_internal__WEBPACK_IMPORTED_MODULE_0__["init"])(this, options, instance, create_fragment, svelte_internal__WEBPACK_IMPORTED_MODULE_0__["safe_not_equal"], { id: 5, noteId: 6 });
	}
}


if (false) {}

/* harmony default export */ __webpack_exports__["default"] = (Note);


/***/ }),

/***/ "./src/structure/document.js":
/*!***********************************!*\
  !*** ./src/structure/document.js ***!
  \***********************************/
/*! exports provided: Document, transformPassage, transformHighlights */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Document", function() { return Document; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transformPassage", function() { return transformPassage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transformHighlights", function() { return transformHighlights; });
/* harmony import */ var svue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svue */ "./node_modules/svue/src/svue.js");
/* harmony import */ var _util_string__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/util/string */ "./src/util/string.js");
/* harmony import */ var _util_array__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/util/array */ "./src/util/array.js");
/* harmony import */ var _api_pageSize__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/api/pageSize */ "./src/api/pageSize.js");
/* harmony import */ var _structure_note__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/structure/note */ "./src/structure/note.js");
/* harmony import */ var _structure_section__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/structure/section */ "./src/structure/section.js");







const HIGHLIGHT_START = "<em>";
const HIGHLIGHT_END = "</em>";
const PAGE_NO_RE = /^page_no_(\d+)$/;

const TAG_KEY = "_tag";
const APP_URL = "http://www.dev.documentcloud.org/";

class Document extends svue__WEBPACK_IMPORTED_MODULE_0__["Svue"] {
  constructor(rawDocument, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.doc = rawDocument;
        data.lastProgress = null;
        data.lastImagesProcessed = null;
        data.lastTextsProcessed = null;
        data.highlightStart = HIGHLIGHT_START;
        data.highlightEnd = HIGHLIGHT_END;
        return data;
      },
      computed: {
        ...computed,
        // Base properties
        id(doc) {
          return doc.id;
        },
        slug(doc) {
          return doc.slug;
        },
        slugId(id, slug) {
          return [id, slug].join("-");
        },
        canonicalUrl(slugId) {
          return APP_URL + "documents/" + slugId;
        },
        pageUrl(canonicalUrl) {
          return page => `${canonicalUrl}#document/p${page}`;
        },
        noteUrl(pageUrl) {
          return (note) => `${pageUrl(note.page + 1)}/a${note.id}`;
        },
        fakeNoteUrl(canonicalUrl) {
          return note => `${canonicalUrl}/annotations/${note.id}`;
        },
        title(doc) {
          return doc.title;
        },
        pageCount(doc) {
          return doc.page_count;
        },
        userName(doc) {
          return doc.user.name;
        },
        rawOrganization(doc) {
          // Unprocessed organization object
          return doc.organization;
        },
        individualOrg(rawOrganization) {
          return rawOrganization.individual;
        },
        organizationName(rawOrganization) {
          return rawOrganization.name;
        },
        assetUrl(doc) {
          return doc.asset_url;
        },
        pdf(assetUrl, id, slug) {
          return `${assetUrl}documents/${id}/${slug}.pdf`;
        },
        thumbnail(assetUrl, id, slug, updatedAtTimestamp) {
          // Calculate thumbnail route
          return `${assetUrl}documents/${id}/pages/${slug}-p1-small.gif?ts=${updatedAtTimestamp}`;
        },
        rawCreatedAt(doc) {
          // Unprocessed created at
          return doc.created_at;
        },
        createdAt(rawCreatedAt) {
          return new Date(Date.parse(rawCreatedAt));
        },
        rawUpdatedAt(doc) {
          // Unprocessed updated at
          return doc.updated_at;
        },
        updatedAtTimestamp(rawUpdatedAt) {
          return Date.parse(rawUpdatedAt);
        },
        updatedAt(updatedAtTimestamp) {
          return new Date(updatedAtTimestamp);
        },
        pageSpec(doc) {
          return doc.page_spec;
        },
        pageSizes(pageSpec) {
          if (pageSpec == null) return null;

          return Object(_api_pageSize__WEBPACK_IMPORTED_MODULE_3__["pageSizesFromSpec"])(pageSpec);
        },

        // Access properties
        access(doc) {
          return doc.access;
        },
        privateAccess(access) {
          return access == "private";
        },
        publicAccess(access) {
          return access == "public";
        },
        organizationAccess(access) {
          return access == "organization";
        },
        editAccess(doc) {
          if (doc.edit_access == null) return false;
          return doc.edit_access;
        },

        // Status and processing-related properties
        status(doc) {
          return doc.status;
        },
        success(status) {
          return status == "success";
        },
        readable(status) {
          return status == "readable";
        },
        pending(status) {
          return status == "pending";
        },
        deleted(status) {
          return status == "deleted";
        },
        error(status) {
          return status == "error";
        },
        nofile(status) {
          return status == "nofile";
        },
        processing(pending, readable) {
          return pending || readable;
        },
        viewable(success, readable, editAccess) {
          return success || (readable && editAccess);
        },
        nonPending(pending) {
          return !pending;
        },
        rawRemaining(doc) {
          return doc.remaining;
        },
        hasRemaining(rawRemaining) {
          return rawRemaining != null;
        },
        imagesRemaining(rawRemaining, hasRemaining) {
          if (!hasRemaining) return null;
          return rawRemaining.images;
        },
        textsRemaining(rawRemaining, hasRemaining) {
          if (!hasRemaining) return null;
          return rawRemaining.texts;
        },
        imagesProcessed(pageCount, imagesRemaining) {
          if (imagesRemaining == null) {
            return this.lastImagesProcessed;
          }
          if (pageCount == 0) {
            this.lastImagesProcessed = 0;
          } else {
            this.lastImagesProcessed = pageCount - imagesRemaining;
          }
          return this.lastImagesProcessed;
        },
        textsProcessed(pageCount, textsRemaining) {
          if (textsRemaining == null) {
            return this.lastTextsProcessed;
          }
          if (pageCount == 0) {
            this.lastTextsProcessed = 0;
          } else {
            this.lastTextsProcessed = pageCount - textsRemaining;
          }
          return this.lastTextsProcessed;
        },
        mightHaveThumbnail(success, imagesProcessed) {
          // Returns if at least one page image has been processed
          return success || imagesProcessed >= 1;
        },
        imageProgress(hasRemaining, imagesProcessed, pageCount) {
          if (!hasRemaining) return null;
          if (pageCount == 0) return 0;
          return imagesProcessed / pageCount;
        },
        textProgress(hasRemaining, textsProcessed, pageCount) {
          if (!hasRemaining) return null;
          if (pageCount == 0) return 0;
          return textsProcessed / pageCount;
        },
        processingProgress(hasRemaining, imageProgress, textProgress) {
          if (!hasRemaining) return null;
          // Overall processing progress is an average of image and text progress
          return (imageProgress + textProgress) / 2;
        },
        realProgress(processingProgress) {
          if (processingProgress == null) {
            return this.lastProgress;
          } else {
            this.lastProgress = processingProgress;
            return processingProgress;
          }
        },

        // Projects
        projectIds(doc) {
          return doc.projects == null ? [] : doc.projects;
        },

        // Notes/sections
        notes(doc) {
          return doc.notes == null
            ? []
            : doc.notes.map((note) => new _structure_note__WEBPACK_IMPORTED_MODULE_4__["Note"](note));
        },
        sections(doc) {
          return doc.sections == null
            ? []
            : doc.sections.map((section) => new _structure_section__WEBPACK_IMPORTED_MODULE_5__["Section"](section));
        },

        // Data
        rawData(doc) {
          return doc.data;
        },
        dataPoints(rawData) {
          const results = [];
          for (const key in rawData) {
            if (rawData.hasOwnProperty(key)) {
              const values = Object(_util_array__WEBPACK_IMPORTED_MODULE_2__["uniquify"])(rawData[key], (x) => x);
              for (let i = 0; i < values.length; i++) {
                results.push({
                  key,
                  value: values[i],
                });
              }
            }
          }
          results.sort((a, b) => {
            // Sort by value if it's a tag
            const aKey = a.key == TAG_KEY ? a.value : a.key;
            const bKey = b.key == TAG_KEY ? b.value : b.key;
            const aValue = a.value;
            const bValue = b.value;

            const keyCompare = aKey.localeCompare(bKey);
            if (keyCompare != 0) return keyCompare;
            return aValue.localeCompare(bValue);
          });
          return results;
        },

        // Highlights
        rawHighlights(doc) {
          return doc.highlights;
        },
        highlights(rawHighlights, highlightStart, highlightEnd) {
          if (rawHighlights == null) return null;
          return transformHighlights(
            rawHighlights,
            highlightStart,
            highlightEnd
          );
        },

        // Text properties
        userOrgString(individualOrg, userName, organizationName) {
          // Return user and organization formatted as a string
          if (individualOrg) {
            return userName;
          }
          return `${userName} (${organizationName})`;
        },
        pageCountString(pageCount) {
          if (pageCount == 0) return "";
          return Object(_util_string__WEBPACK_IMPORTED_MODULE_1__["handlePlural"])(pageCount, "page", true);
        },
        createdAtString(createdAt) {
          return createdAt.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        },
        summary(pageCountString, userOrgString, createdAtString) {
          return [pageCountString, userOrgString, createdAtString]
            .filter((x) => x.length > 0)
            .join(" - ");
        },
      },
    });
  }
}

function transformPassage(passage, highlightStart, highlightEnd) {
  const chunks = [];

  const advance = (numChars) => {
    passage = passage.substr(numChars);
  };

  const pushRaw = (numChars) => {
    if (numChars == null) numChars = passage.length;
    if (numChars == 0) return;
    chunks.push({
      text: passage.substr(0, numChars),
      type: "normal",
    });
    advance(numChars);
  };

  const pushHighlight = (numChars) => {
    if (numChars == 0) return;
    chunks.push({
      text: passage.substr(0, numChars),
      type: "highlight",
    });
    advance(numChars);
  };

  while (passage.length > 0) {
    let foundHighlight = false;
    let idxStart = passage.indexOf(highlightStart);
    if (idxStart != -1) {
      let idxEnd = passage.indexOf(
        highlightEnd,
        idxStart + highlightStart.length
      );
      if (idxEnd != -1) {
        pushRaw(idxStart);
        advance(highlightStart.length);
        pushHighlight(idxEnd - idxStart - highlightStart.length);
        advance(highlightEnd.length);
        foundHighlight = true;
      }
    }
    if (!foundHighlight) break;
  }
  pushRaw();

  return chunks;
}

function transformHighlights(
  rawHighlights,
  highlightStart,
  highlightEnd,
  returnDict = false
) {
  const highlights = returnDict ? {} : [];
  const pages = [];
  for (const pageKey in rawHighlights) {
    if (rawHighlights.hasOwnProperty(pageKey)) {
      // Get number out of page key
      const match = pageKey.match(PAGE_NO_RE);
      if (match == null) continue;
      const page = parseInt(match[1]) - 1;

      // Populate highlight object
      const highlight = { page, passages: [] };
      const passages = rawHighlights[pageKey];
      for (let i = 0; i < passages.length; i++) {
        const passage = passages[i];
        // Transform passage
        highlight.passages.push(
          transformPassage(passage, highlightStart, highlightEnd)
        );
      }
      // Handle response type
      if (returnDict) {
        if (highlights[page] == null) {
          pages.push({ page, count: highlight.passages.length });
        }
        highlights[page] = highlight.passages;
      } else {
        highlights.push(highlight);
      }
    }
  }

  // Sort results by page number
  if (!returnDict) {
    highlights.sort((a, b) => a.page - b.page);
    return highlights;
  } else {
    pages.sort((a, b) => a.page - b.page);
    return { highlights, pages };
  }
}


/***/ }),

/***/ "./src/structure/note.js":
/*!*******************************!*\
  !*** ./src/structure/note.js ***!
  \*******************************/
/*! exports provided: Note */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Note", function() { return Note; });
/* harmony import */ var svue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svue */ "./node_modules/svue/src/svue.js");


function getDefault(obj, defaultValue = "") {
  if (obj == null) return defaultValue;
  return obj;
}

class Note extends svue__WEBPACK_IMPORTED_MODULE_0__["Svue"] {
  constructor(rawNote, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.note = rawNote;
        return data;
      },
      computed: {
        ...computed,
        id(note) {
          return note.id;
        },
        title(note) {
          return getDefault(note.title);
        },
        content(note) {
          return getDefault(note.content);
        },
        access(note) {
          return getDefault(note.access, "private");
        },
        page(note) {
          return note.page_number;
        },
        isPageNote(note) {
          return note.x1 == null;
        },
        x1(note) {
          return note.x1;
        },
        x2(note) {
          return note.x2;
        },
        y1(note) {
          return note.y1;
        },
        y2(note) {
          return note.y2;
        },
        width(x1, x2) {
          return x2 - x1;
        },
        height(y1, y2) {
          return y2 - y1;
        },
        username(note) {
          return getDefault(note.user, { name: "" }).name;
        },
        organization(note) {
          const org = getDefault(note.organization, {});
          if (org.individual) return null;
          return org.name;
        }
      }
    });
  }
}


/***/ }),

/***/ "./src/structure/results.js":
/*!**********************************!*\
  !*** ./src/structure/results.js ***!
  \**********************************/
/*! exports provided: Results */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Results", function() { return Results; });
/* harmony import */ var svue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svue */ "./node_modules/svue/src/svue.js");
/* harmony import */ var _util_url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/util/url */ "./src/util/url.js");



const pageRe = /([&\?]page=)([0-9]+)/;

class Results extends svue__WEBPACK_IMPORTED_MODULE_0__["Svue"] {
  constructor(url, rawResults, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.rawResults = rawResults;
        data.url = url;
        return data;
      },
      computed: {
        ...computed,
        count(rawResults) {
          // Count of all results across pages
          return rawResults.count;
        },
        results(rawResults) {
          return rawResults.results;
        },
        length(results) {
          // Count of results for current page
          return results.length;
        },
        page(hasNext, hasPrev, nextUrl, prevUrl) {
          // On the first and only page
          if (!hasNext && !hasPrev) return 0;

          if (hasNext) {
            // Base current page off next page
            const match = nextUrl.match(pageRe);
            if (match == null) throw new Error("This should not happen");
            const number = parseInt(match[2]) - 1;
            return number - 1; // page before next
          } else if (hasPrev) {
            const match = prevUrl.match(pageRe);
            if (match == null) {
              // If the previous url doesn't match the regex, we are on the
              // second page, since only the first page won't match.
              return 1;
            }
            const number = parseInt(match[2]) - 1;
            return number + 1; // page after previous
          }
        },
        numPages(count, length, page, hasNext) {
          if (!hasNext) return page + 1; // we are on the last page
          return Math.ceil(count / length);
        },
        perPage(count, length, page, numPages) {
          if (numPages == 1) return count;
          if (page < numPages - 1) return length;
          return (count - length) / (numPages - 1);
        },

        // Next / previous
        nextUrl(rawResults) {
          return rawResults.next;
        },
        prevUrl(rawResults) {
          return rawResults.previous;
        },
        hasNext(nextUrl) {
          return nextUrl != null;
        },
        hasPrev(prevUrl) {
          return prevUrl != null;
        },
        nextPage(hasNext, page) {
          if (!hasNext) return null;
          return page + 1;
        },
        prevPage(hasPrev, page) {
          if (!hasPrev) return null;
          return page - 1;
        },
        onlyPage(hasPrev, hasNext) {
          return !hasPrev && !hasNext;
        },

        // Indices
        start(page, perPage) {
          return page * perPage;
        },
        end(page, perPage, length) {
          return page * perPage + length;
        }
      }
    });
  }

  getUrl(page) {
    const match = this.url.match(pageRe);
    if (match == null) return Object(_util_url__WEBPACK_IMPORTED_MODULE_1__["queryBuilder"])(this.url, { page: page + 1 });
    return this.url.replace(pageRe, `$1${page + 1}`);
  }
}


/***/ }),

/***/ "./src/structure/section.js":
/*!**********************************!*\
  !*** ./src/structure/section.js ***!
  \**********************************/
/*! exports provided: Section */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Section", function() { return Section; });
/* harmony import */ var svue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! svue */ "./node_modules/svue/src/svue.js");


class Section extends svue__WEBPACK_IMPORTED_MODULE_0__["Svue"] {
  constructor(rawSection, structure = {}) {
    const computed = structure.computed == null ? {} : structure.computed;
    super({
      data() {
        const data = structure.data == null ? {} : structure.data();
        data.section = rawSection;
        return data;
      },
      computed: {
        ...computed,
        id(section) {
          return section.id;
        },
        page(section) {
          return section.page_number;
        },
        title(section) {
          return section.title;
        }
      }
    });
  }
}


/***/ }),

/***/ "./src/util/array.js":
/*!***************************!*\
  !*** ./src/util/array.js ***!
  \***************************/
/*! exports provided: removeFromArray, uniquify, includes, intersection, arrayEq */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeFromArray", function() { return removeFromArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "uniquify", function() { return uniquify; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "includes", function() { return includes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "intersection", function() { return intersection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "arrayEq", function() { return arrayEq; });
function removeFromArray(array, elem) {
  const idx = array.indexOf(elem);
  if (idx != -1) {
    array.splice(idx, 1);
    return array;
  }
  return array;
}

function uniquify(array, fieldAccess = x => x.id) {
  // Remove duplicates
  let unique = {};
  const results = [];
  // Iterate backwards so most recent objects override past ones
  for (let i = array.length - 1; i >= 0; i--) {
    const obj = array[i];
    const field = fieldAccess(obj);
    if (unique[field] == null) {
      results.push(obj);
      unique[field] = true;
    }
  }

  return results;
}

function includes(array, elem, eq = (a, b) => a == b) {
  for (let i = 0; i < array.length; i++) {
    if (eq(array[i], elem)) return true;
  }
  return false;
}

function intersection(arrays, eq = (a, b) => a == b) {
  if (arrays.length == 0) return [];
  // Adapted from https://stackoverflow.com/a/59176460
  return arrays.reduce((a, b) => a.filter(elem => includes(b, elem, eq)));
}

function arrayEq(x1, x2) {
  if (x1.length != x2.length) return false;
  for (let i = 0; i < x1.length; i++) {
    if (x1[i] != x2[i]) return false;
  }
  return true;
}


/***/ }),

/***/ "./src/util/batchDelay.js":
/*!********************************!*\
  !*** ./src/util/batchDelay.js ***!
  \********************************/
/*! exports provided: batchDelay */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "batchDelay", function() { return batchDelay; });
/* harmony import */ var _util_timeout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/util/timeout */ "./src/util/timeout.js");


async function batchDelay(collection, batchSize, delay, fn) {
  let results = [];
  for (let i = 0; i < collection.length; i += batchSize) {
    const subCollection = collection.slice(i, i + batchSize);
    results = results.concat(await fn(subCollection));
    await Object(_util_timeout__WEBPACK_IMPORTED_MODULE_0__["timeout"])(delay);
  }
  return results;
}


/***/ }),

/***/ "./src/util/data.js":
/*!**************************!*\
  !*** ./src/util/data.js ***!
  \**************************/
/*! exports provided: injectMe */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "injectMe", function() { return injectMe; });
/**
 * Patches the provided data with the specified user data.
 * @param {Object} data The starting data.
 * @param {Object} me The user data.
 */
function injectMe(data, me) {
  data.user = me;
  data.organization = me.organization;
  return data;
}


/***/ }),

/***/ "./src/util/paginate.js":
/*!******************************!*\
  !*** ./src/util/paginate.js ***!
  \******************************/
/*! exports provided: MAX_PER_PAGE, grabAllPages */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MAX_PER_PAGE", function() { return MAX_PER_PAGE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "grabAllPages", function() { return grabAllPages; });
/* harmony import */ var _api_session__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/api/session */ "./src/api/session.js");
/* harmony import */ var _url__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./url */ "./src/util/url.js");



const MAX_PER_PAGE = parseInt("100");

/**
 * Requests the specified URL and paginates through to return all
 * results if additional pages are present.
 * @param {string} url The API url to request.
 * @param {number?} perPage If present, the per page to request
 */
async function grabAllPages(url, perPage = MAX_PER_PAGE) {
  if (perPage != null) url = Object(_url__WEBPACK_IMPORTED_MODULE_1__["queryBuilder"])(url, { per_page: perPage });
  const { data } = await _api_session__WEBPACK_IMPORTED_MODULE_0__["default"].get(url);
  const results = data.results;
  if (data.next != null) {
    // Grab the next page
    const next = await grabAllPages(data.next);
    return results.concat(next);
  } else {
    return results;
  }
}


/***/ }),

/***/ "./src/util/string.js":
/*!****************************!*\
  !*** ./src/util/string.js ***!
  \****************************/
/*! exports provided: handlePlural, simplePlural, nameSingularNumberPlural, formatBytes, stripExtension, slugify, extractSlugId, titlecase, allIndices */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "handlePlural", function() { return handlePlural; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "simplePlural", function() { return simplePlural; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "nameSingularNumberPlural", function() { return nameSingularNumberPlural; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "formatBytes", function() { return formatBytes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stripExtension", function() { return stripExtension; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "slugify", function() { return slugify; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extractSlugId", function() { return extractSlugId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "titlecase", function() { return titlecase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "allIndices", function() { return allIndices; });
/**
 * Appropriately pluralizes a word based on the quantity.
 * @param {number} value The number of items
 * @param {string} str The base string name of a singular item
 * @param {boolean} allowZero If false, return an empty string on zero items
 */
function handlePlural(value, str, allowZero = false) {
  if (!allowZero && value == 0) return "";
  return `${value} ${simplePlural(value, str)}`;
}

/**
 * Returns a word with an "s" after it if appropriate
 * @param {number} value The number of items
 * @param {string} string The base string name of a single item
 */
function simplePlural(value, string) {
  return string + (value != 1 ? "s" : "");
}

/**
 * Pluralizes a word and puts the number before it only if non-singular,
 * e.g. for the "selected document" vs. for the "3 selected documents"
 * @param {number} value The number of items
 * @param {string} string The base string name of a single item
 */
function nameSingularNumberPlural(value, string) {
  return `${value == 1 ? "" : `${value} `}${simplePlural(value, string)}`;
}

/**
 * Formats a size to a human-readable format
 * @param {number} bytes The number of bytes
 * @param {number} decimals Number of decimal places
 */
function formatBytes(bytes, decimals = 0) {
  // from https://stackoverflow.com/a/18650828/1404888
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Strips the extension part of a filename
 * @param {string} filename The filename
 */
function stripExtension(filename) {
  const parts = filename.split(".");
  return parts.slice(0, parts.length - 1).join(".");
}

function slugify(str, id = null, maxLength = 25) {
  const slug = str
    .substring(0, maxLength)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  if (id != null) return `${slug}-${id}`;
  return slug;
}

function extractSlugId(str) {
  // Must be valid slug
  if (!/^[a-z0-9-]+$/.test(str)) return null;
  const parts = str.split("-");
  if (parts.length == 0) return null;
  return parts[parts.length - 1];
}

function titlecase(str) {
  return str.charAt(0).toUpperCase() + str.substr(1);
}

function allIndices(text, query) {
  const results = [];
  let pos = 0;
  while (true) {
    const idx = text.indexOf(query, pos);
    if (idx == -1) return results;
    results.push(idx);
    pos = idx + 1;
  }
}


/***/ }),

/***/ "./src/util/timeout.js":
/*!*****************************!*\
  !*** ./src/util/timeout.js ***!
  \*****************************/
/*! exports provided: timeout */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "timeout", function() { return timeout; });
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/***/ }),

/***/ "./src/util/url.js":
/*!*************************!*\
  !*** ./src/util/url.js ***!
  \*************************/
/*! exports provided: urlParts, urlJoin, getQueryStringParams, urlsEqual, currentUrl, queryBuilder */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "urlParts", function() { return urlParts; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "urlJoin", function() { return urlJoin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getQueryStringParams", function() { return getQueryStringParams; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "urlsEqual", function() { return urlsEqual; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "currentUrl", function() { return currentUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "queryBuilder", function() { return queryBuilder; });
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


/***/ }),

/***/ 0:
/*!*********************************!*\
  !*** multi ./src/noteLoader.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./src/noteLoader.js */"./src/noteLoader.js");


/***/ })

/******/ });
//# sourceMappingURL=loader.js.map