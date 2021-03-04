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

/***/ "./src/embed/noteLoader.js":
/*!*********************************!*\
  !*** ./src/embed/noteLoader.js ***!
  \*********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _iframeSizer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./iframeSizer */ "./src/embed/iframeSizer.js");


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

    // Clear the container
    while (noteElem.firstChild) noteElem.removeChild(noteElem.firstChild);
    noteElem.style = `max-width:${noteElem.style.maxWidth}`;

    // Create the iframe
    const iframe = document.createElement('iframe');
    iframe.style = 'border: none; width: 100%;';
    iframe.src = `${"http://www.dev.documentcloud.org/"}documents/${id}/annotations/${noteId}`;
    Object(_iframeSizer__WEBPACK_IMPORTED_MODULE_0__["setupResizeEvent"])(iframe);

    noteElem.appendChild(iframe);
  });
}

if (window['dc'] == null) window['dc'] = {};
if (window['dc']['embed'] == null) window['dc']['embed'] = {};
if (window['dc']['embed']['loadNote'] == null) window['dc']['embed']['loadNote'] = loadNote;


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

/***/ 0:
/*!***************************************!*\
  !*** multi ./src/embed/noteLoader.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./src/embed/noteLoader.js */"./src/embed/noteLoader.js");


/***/ })

/******/ });
//# sourceMappingURL=loader.js.map