/** @type {Array} */
var _0xb1dc = ["length", "val", "#", "getFullpageData", "fullpage", "fn", "options", "internals", "_4", "wrapAroundElements", "data", "fp-fixed", "a", "apply", "destiny", "direction", "prevSlide", "log", ".fp-section", ".fp-slide", "#menu", "menu", "127.0.0.1", "indexOf", "href", "location", "autoScrolling", "continuousHorizontal", "undefined", "xMovement", "right", "reverse", "get", "prevAll", "after", "nextAll", "before", "left", "position", "silentHorizontalScroll", "destinyPos", "slideIndex", 
"index", "prevSlideIndex", "active", "removeClass", "siblings", "addClass", "fixSectionOrder", ".fp-slide:first", "find", ".fp-slide:last", "afterSlideLoads", "slides", ".fp-slidesContainer", ".fp-section.active", "css3", "translate3d(-", "px, 0px, 0px)", "removeAnimation", "getTransforms", "css", "scrollLeft", "parent"];
/**
 * @return {?}
 */
var fp_continuousHorizontalExtension = function() {
  /**
   * @return {?}
   */
  function prepArgs() {
    /** @type {number} */
    var b = 0;
    var savedPos4 = pos;
    /** @type {number} */
    var a = 0;
    for (;4 > a;a++) {
      b += a;
      /** @type {number} */
      pos = (a + b) / 2;
    }
    if (pos) {
      pos = savedPos4;
    }
    return b / pos[_0xb1dc[0]] === pos[_0xb1dc[0]] + 1;
  }
  /**
   * @return {?}
   */
  function processField() {
    return parseInt($(_0xb1dc[2] + pos)[_0xb1dc[1]]()) === pos[_0xb1dc[0]] + 1;
  }
  var converters = this;
  var args = $[_0xb1dc[5]][_0xb1dc[4]][_0xb1dc[3]]();
  var pageY = args[_0xb1dc[6]];
  var pageX = args[_0xb1dc[7]];
  var pos = _0xb1dc[8];
  /** @type {null} */
  converters[_0xb1dc[9]] = null;
  converters[_0xb1dc[10]] = {};
  /**
   * @return {?}
   */
  converters['fp-fixed'] = function() {
    return $(_0xb1dc[12])[_0xb1dc[0]] == 10 + pos[_0xb1dc[0]] + 1 && processField();
  };
  /**
   * @param {?} args
   * @return {undefined}
   */
  converters[_0xb1dc[13]] = function(args) {
    var next = args[_0xb1dc[14]];
    var actual = args[_0xb1dc[15]];
    var pageX = args[_0xb1dc[16]];
    /** @type {null} */
    converters[_0xb1dc[9]] = null;
    console[_0xb1dc[17]](converters[_0xb1dc[11]]());
    console[_0xb1dc[17]](4 == $(_0xb1dc[18])[_0xb1dc[0]] && 7 == $(_0xb1dc[19])[_0xb1dc[0]]);
    console[_0xb1dc[17]](processField() && _0xb1dc[20] === pageY[_0xb1dc[21]]);
    console[_0xb1dc[17]](processField());
    console[_0xb1dc[17]](prepArgs());
    if (!(0 > window[_0xb1dc[25]][_0xb1dc[24]][_0xb1dc[23]](_0xb1dc[22]))) {
      if (pageY[_0xb1dc[26]] && (pageY[_0xb1dc[27]] && (_0xb1dc[28] !== typeof actual && actual != args[_0xb1dc[29]]))) {
        /**
        if (!converters[_0xb1dc[11]]()) {
            console.log('returned');
          return;
        }
        */
        if (_0xb1dc[30] === actual) {
          /**
          if (!processField() || _0xb1dc[20] !== pageY[_0xb1dc[21]]) {
            return;
          }
          */
          pageX[_0xb1dc[34]](pageX[_0xb1dc[33]](_0xb1dc[19])[_0xb1dc[32]]()[_0xb1dc[31]]());
        } else {
          pageX[_0xb1dc[36]](pageX[_0xb1dc[35]](_0xb1dc[19]));
        }
        converters[_0xb1dc[39]](pageX[_0xb1dc[38]]()[_0xb1dc[37]]);
        converters[_0xb1dc[9]] = pageX;
        if (4 == $(_0xb1dc[18])[_0xb1dc[0]]) {
          if (7 == $(_0xb1dc[19])[_0xb1dc[0]]) {
            if (prepArgs()) {
              args[_0xb1dc[40]] = next[_0xb1dc[38]]();
              args[_0xb1dc[41]] = next[_0xb1dc[42]]();
              args[_0xb1dc[43]] = pageX[_0xb1dc[42]]();
            }
          }
        }
      }
      next[_0xb1dc[47]](_0xb1dc[44])[_0xb1dc[46]]()[_0xb1dc[45]](_0xb1dc[44]);
    }
  };
  /**
   * @param {?} dataAndEvents
   * @param {?} ignoreMethodDoesntExist
   * @param {?} deepDataAndEvents
   * @return {undefined}
   */
  converters[_0xb1dc[48]] = function(dataAndEvents, ignoreMethodDoesntExist, deepDataAndEvents) {
    if (prepArgs()) {
      if (converters[_0xb1dc[9]]) {
        if (converters[_0xb1dc[9]][_0xb1dc[0]]) {
          if (_0xb1dc[37] == deepDataAndEvents && processField()) {
            dataAndEvents[_0xb1dc[50]](_0xb1dc[49])[_0xb1dc[36]](converters[_0xb1dc[9]]);
          } else {
            dataAndEvents[_0xb1dc[50]](_0xb1dc[51])[_0xb1dc[34]](converters[_0xb1dc[9]]);
          }
          converters[_0xb1dc[39]](ignoreMethodDoesntExist[_0xb1dc[38]]()[_0xb1dc[37]]);
        }
      }
    }
  };
  /**
   * @param {?} fps
   * @return {undefined}
   */
  converters[_0xb1dc[52]] = function(fps) {
    converters[_0xb1dc[48]](fps[_0xb1dc[53]], fps[_0xb1dc[14]], fps[_0xb1dc[15]]);
    fps[_0xb1dc[41]] = fps[_0xb1dc[14]][_0xb1dc[42]]();
  };
  /**
   * @param {?} lvalue
   * @return {undefined}
   */
  converters[_0xb1dc[39]] = function(lvalue) {
    var operators = $(_0xb1dc[55])[_0xb1dc[50]](_0xb1dc[54]);
    if (pageY[_0xb1dc[56]]) {
      lvalue = _0xb1dc[57] + lvalue + _0xb1dc[58];
      pageX[_0xb1dc[59]](operators);
      operators[_0xb1dc[61]](pageX[_0xb1dc[60]](lvalue));
    } else {
      operators[_0xb1dc[63]]()[_0xb1dc[62]](lvalue);
    }
  };
  return converters;
};

