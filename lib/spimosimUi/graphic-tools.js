/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

/*
 * This is a support library many with useful tools to interact with the user
 * mainly by manipulating HTML.
 */

var graphicTools = (function() {
  var EQUALS = '\u202F=\u202F';
  var EventDispatcher = tools.EventDispatcher;
  var EventAttacher = tools.EventAttacher;

  function cE(name) {
    return document.createElement(name);
  }

  /*
   * Starts a download by creating an invisible <a>-element with the blob as its
   * data URL and clicking it.
   */
  function startDownload(url, fileName) {
    //Create a hidden hyperlink
    var a = cE('a');
    a.style.display = 'none';

    //a needs to be attached to the body
    document.body.appendChild(a);

    a.href = url;//Might be a data URL
    a.target = '_blank';//Might be a data URL
    a.download = fileName;//Default name for the file

    //Start Download
    a.click();

    //Remove hyperlink
    document.body.removeChild(a);

    setTimeout(function () {URL.revokeObjectURL(url);}, 10000);
    //Remove url from memory after 10s
  }

  /*
   * Removes all child nodes of a HTML element. This should be faster than
   * element.innerHTML = '';
   */
  function removeAllChildNodes(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  /*
   * Removes possibly invalid characters from a string to use it as (a part of)
   * a file name.
   */
  function toValidFileName(str) {
    return str.replace(/[^0-9a-zA-Z_]/g, '');
  };

  /*
   * Prompts the user to enter a number between 'min' and 'max'.
   */
  function askForNumber(question, min, max) {
    var text = question + ' Enter a number between ' + min + ' and ' + max +
      '!',
      answer = prompt(text);

    if (answer !== null) {
      var num = parseInt(answer);
      if (isFinite(num) && num >= 0 && num <= max) {
        return num;
      } else {
        alert('Invalid number: ' + answer);
      }
    }
  }

  /*
   * Replaces or adds a URI query to the documents URL.
   */
  function setUriQuery(key, value) {
    if (!Modernizr.urlparser) {
      return;
    }

    if (Array.isArray(value)) {
      value = value.toSource();
    } else {
      value = String(value);
    }
    SearchURL.location.setOption(key, value).replaceState();
  }

  /*
   * Replaces or adds multiple URI queries to the documents URL.
   */
  function setUriQueries(keys, values) {
    if (!Modernizr.urlparser) {
      return;
    }

    var l = SearchURL.location;

    for (var i = 0, len = keys.length; i < len; i++) {
      l.setOption(keys[i], String(values[i]));
    }

    l.replaceState();
  }

  /*
   * Remove a URI query from the documents URL.
   */
  function removeUriQuery(key) {
    if (!Modernizr.urlparser) {
      return;
    }

    SearchURL.location.removeOption(key).replaceState();
  }

  /*
   * Remove multiple URI query from the documents URL.
   */
  function removeUriQueries(keys) {
    if (!Modernizr.urlparser) {
      return;
    }

    var l = SearchURL.location;

    for (var i = 0, len = keys.length; i < len; i++) {
      l.removeOption(keys[i]);
    }

    l.replaceState();
  }

  /*
   * Returns a URI query from the documents URL.
   */
  function getUriQuery(key) {
    if (!Modernizr.urlparser) {
      return undefined;
    }

    return SearchURL.location.options[key];
  }

  /*
   * Replaces or adds a URI fragment query to the documents URL.
   */
  function setUriFragmentQuery(key, value) {
    if (!Modernizr.urlparser) {
      return;
    }

    if (Array.isArray(value)) {
      value = value.toSource();
    } else {
      value = String(value);
    }
    SearchURL.location.setFragmentOption(key, value).replaceState();
  }

  /*
   * Replaces or adds multiple URI queries to the documents URL.
   */
  function setUriFragmentQueries(keys, values) {
    if (!Modernizr.urlparser) {
      return;
    }

    var l = SearchURL.location;

    for (var i = 0, len = keys.length; i < len; i++) {
      l.setFragmentOption(keys[i], String(values[i]));
    }

    l.replaceState();
  }

  /*
   * Remove a URI fragment query from the documents URL.
   */
  function removeUriFragmentQuery(key) {
    if (!Modernizr.urlparser) {
      return;
    }

    SearchURL.location.removeFragmentOption(key).replaceState();
  }

  /*
   * Remove multiple URI fragment query from the documents URL.
   */
  function removeUriFragmentQueries(keys) {
    if (!Modernizr.urlparser) {
      return;
    }

    var l = SearchURL.location;

    for (var i = 0, len = keys.length; i < len; i++) {
      l.removeFragmentOption(keys[i]);
    }

    l.replaceState();
  }

  /*
   * Returns a URI fragment query from the documents URL.
   */
  function getUriFragmentQuery(key) {
    if (!Modernizr.urlparser) {
      return undefined;
    }

    return SearchURL.location.fragmentOptions[key];
  }

  /*
   * Wraps a URI to easily manipulate its search string.
   */
  function SearchURL(loc) {
    this.url = new URL(loc);

    this.options = {};
    this.fragmentOptions = {};
    var search = this.url.search;
    var fragment = this.url.hash;
    if (search.length > 1) {
      var pairs = search.substr(1).split('&');
      for (var i = 0, len = pairs.length; i < len; i++) {
        var pair = pairs[i].split('=');
        this.options[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
    }
    if (fragment.length > 1) {
      var pairs = fragment.substr(1).split('&');
      for (var i = 0, len = pairs.length; i < len; i++) {
        var pair = pairs[i].split('=');
        this.fragmentOptions[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
    }
  }

  SearchURL.pauseStateReplacing = false; // can be set to true temporary to prevent to many replacements at once

  /*
   * Return the url as a string
   */
  SearchURL.prototype.toString = function () {
    var names = Object.getOwnPropertyNames(this.options).sort(),
      search = '?',
      fragmentNames = Object.getOwnPropertyNames(this.fragmentOptions).sort(),
      fragment = '#';

    for (var i = 0, len = names.length; i < len; i++) {
      var name = names[i],
        value = this.options[name];

      if (value !== undefined) {
        if (search !== '?') {
          search += '&';
        }

        search += encodeURIComponent(name) + '=' + encodeURIComponent(value);
      }
    }
    if (search === '?') {
      search = '';
    }
    this.url.search = search;
    
    for (var i = 0, len = fragmentNames.length; i < len; i++) {
      var name = fragmentNames[i],
        value = this.fragmentOptions[name];

      if (value !== undefined) {
        if (fragment !== '#') {
          fragment += '&';
        }

        fragment += encodeURIComponent(name) + '=' + encodeURIComponent(value);
      }
    }
    if (fragment === '#') {
      fragment = '';
    }

    this.url.hash = fragment;

    return this.url.toString();
  };

  /*
   * Sets an URI query of the URL
   */
  SearchURL.prototype.setOption = function (key, value) {
    this.options[key] = value;

    return this;
  };

  /*
   * Removes an URI query from the URL
   */
  SearchURL.prototype.removeOption = function (key) {
    this.options[key] = undefined;

    return this;
  };

  /*
   * Sets an URI fragment query of the URL
   */
  SearchURL.prototype.setFragmentOption = function (key, value) {
    this.fragmentOptions[key] = value;

    return this;
  };

  /*
   * Removes an URI fragment query from the URL
   */
  SearchURL.prototype.removeFragmentOption = function (key) {
    this.fragmentOptions[key] = undefined;

    return this;
  };

  if (Modernizr.urlparser) {
    //A wrapped versions of the documents location uri
    SearchURL.location = new SearchURL(location);

    /*
     * Replaces the URI of the document
     */
    SearchURL.location.replaceState = function () {
      if (!SearchURL.pauseStateReplacing) {
        window.history.replaceState({}, null, this.toString());
      }
    };
  }


  /*
   * Prompt for the input value of a range input. This function is called when
   * clicking the label
   */
  function promptRangeValue(input, msg) {
    //The input element of the label
    var val = parseFloat(input.value, 10);
    var min = input.min;
    var max = input.max;

    var answer = prompt(msg, val);
    if (answer !== null) {
      val = parseFloat(answer, 10);

      //Set the value if it is valid
      if (isFinite(val) && val <= max && min <= val) {
        return val;
      } else {
        alert('Invalid value');
      }
    }
  };

  /*
   * This function can be used as an event listener for mousewheel events on
   * range inputs.
   */
  function getValueAfterScroll(input, e) {
    if (!this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return getValueAfterSteps(input, (e.deltaX + e.deltaY));
    }
  };

  /*
   * Increases / decreases the value of an input element
   * by steps * step. The input needs to be of type range or number.
   */
  function getValueAfterSteps(input, steps) {
    var value = parseFloat(input.value, 10),
      min  = parseFloat(input.min || '-Infinity'),
      max  = parseFloat(input.max || 'Infinity'),
      step = parseFloat(input.step || '1');

    return Math.max(min, Math.min(max, value + step * steps));//stay in limits
  };
  
  function getValueAfterKey(input, e) {
    var steps = (e.shiftKey ? -1 : 1) * (e.altKey || e.ctrlKey ? 10 : 1);
    return getValueAfterSteps(input, steps);
  }

  /*
   * Finds radio inputs with the same name in 'form' and selects the steps-th
   * next.
   */
  function radioStep(name, steps, form) {
    if (!form) {
      form = document;
    }

    var inputs = form.querySelectorAll('input[name="' + name + '"]');
    var len = inputs.length;
    if (len === 0) {
      return;
    }
    var index;
    for (var i = 0; i < len; i++) {
      if (inputs[i].checked) {
        index = i;
      }
    }
    
    inputs[(index + len + steps) % len].click();
  };


  /*
   * Toggles div as the fullscreen element
   */
  function toggleFullscreen(e, div) {
    if (document.fullscreen || document.webkitIsFullScreen ||
        document.mozFullScreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else {
        document.body.style.overflow = '';//show scroll bars (if necessary)
      }
    } else {
      if (div.requestFullscreen) {
        div.requestFullscreen();
      } else if (div.msRequestFullscreen) {
        div.msRequestFullscreen();
      } else if (div.mozRequestFullScreen) {
        div.mozRequestFullScreen();
      } else if (div.webkitRequestFullscreen) {
        div.webkitRequestFullscreen();
      } else {
        document.body.style.overflow = 'hidden';//hide scroll bars
      }
    }

    e.stopPropagation();
  }

  /*
   * Enables drag and drop reordering of the children
   * of an element. 'movedElement' is one of the children and
   * 'grabbedElement' can be the same as 'movedElement' or one
   * of its children.
   */
  function enableDragAndDropMove(grabbedElement, movedElement, addData) {
    var parentElement = movedElement.parentNode;
    
    var hold = false;
    var left, top;
   
    grabbedElement.addEventListener('mouseover', function (e) {
      if (e.buttons === 0) {
        hold = true;
      }
    });
    grabbedElement.addEventListener('mouseup', function (e) {
      hold = true;
    });
    grabbedElement.addEventListener('mouseout', function (e) {
      if (e.buttons === 0) {
        hold = false;
      }
    });
    
    grabbedElement.addEventListener('mousedown', function (e) {
      if (movedElement.classList.contains("spimosim-floating")) {
        left = movedElement.getBoundingClientRect().left + window.scrollX;
        top = movedElement.getBoundingClientRect().top + window.scrollY;
        window.addEventListener('mousemove', mover);
        window.addEventListener('mouseup', moveEnd);
        e.preventDefault();
      }
    });
    
    function mover(e) {
      if (movedElement.classList.contains("spimosim-floating")) {
        left += e.movementX;
        top += e.movementY;
        movedElement.style.left = Math.max(0, left + e.movementX) + "px";
        movedElement.style.top = Math.max(0, top + e.movementY) + "px";
      } else {
        moveEnd();
      }
    };

    function moveEnd(e) {
      window.removeEventListener("mousemove", mover);
      window.removeEventListener("mouseup", moveEnd);
    }

    movedElement.draggable = true;
    movedElement.addEventListener('dragstart', function (e) {
      if (e.rangeParent && isInput(e.rangeParent)) {
        return;
      }
      movedElement.style.position = null;
      
      if (hold) {
        e.dataTransfer.effectAllowed = 'all';
        e.dataTransfer.dropEffect = 'copy';
        var siblings = parentElement.children;
        for (var i = 0, len = siblings.length; i < len; i++) {
          if (siblings[i] === this) {
            if (addData !== undefined) {
              addData(e, movedElement);
            }
            e.dataTransfer.setData('spimosim/section', i);
            break;
          }
        }
        e.stopPropagation();
      } else {
        e.preventDefault();
      }
    });

    movedElement.addEventListener('dragover', function (e) {
      e.preventDefault();
    });
    movedElement.addEventListener('drop', function (e) {
      var siblings = parentElement.children,
        sibling;
      var grabbed = siblings[parseInt(e.dataTransfer.getData('spimosim/section'), 10)];
      for (var i = 0, len = siblings.length; i < len - 1; i++) {
        sibling = siblings[i];
        if (sibling === this) {
          parentElement.insertBefore(grabbed, this);
          e.stopPropagation();
          return;
        } else if (sibling === grabbed) {
          parentElement.insertBefore(grabbed, this.nextSibling);
          e.stopPropagation();
          return;
        }
      }
    });
  }

  /*
   * Returns true if the event 'e' was fired on a input element with text input.
   * Useful to skip unintented keyboard shortcurs.
   */
  function wasFiredOnInput(e) {
    return isInput(e.target);
  }
  
  function isInput(element) {
    return (element.nodeName.toLowerCase() === 'select' ||
      element.nodeName.toLowerCase() === 'textarea' ||
      element.nodeName.toLowerCase() === 'input' &&
      element.type !== 'range' && element.type !== 'checkbox' &&
      element.type !== 'radio');
  }

  function toFixed(num, digits) {
    if (!isFinite(num)) {
      return num;
    }

    var factor = Math.pow(10, -~~Math.log10(num) + digits - 1);
    return Math.round(num * factor) / factor;
  }
  
  function getFontColor(element, pseudo) {
    var colorStr = getComputedStyle(element, pseudo).color;
    var colorArray = colorStr.substring(4,colorStr.length - 1).split(', ');
    return colorArray.reduce(function (str,i) {
      return str += parseInt(i).toString(16)
    },'#');
  }

  function processKey(e, keyMap) {
    var key = e.key,
      entry = keyMap[key.toLowerCase()],
      step;
    if (entry) {
      if (entry.processKey !== undefined) {
        entry.processKey(e);
      } else if (entry.nodeName === undefined) {
        if (e.shiftKey) {
          step = -1;
        } else {
          step = 1;
        }

        graphicTools.radioStep(entry.name, step, entry.form);
      } else {
        switch (entry.nodeName.toLowerCase()) {
          case 'a':
          case 'button':
            entry.click();
            break;
          default: 
            if (!entry.disabled) {
              entry.value = getValueAfterKey(entry, e);
              break;
            }
        }
      }
      e.preventDefault();
    }
  }

  function createLabeledRadioButton(prefix, name, value, text) {
    var surroundingDiv = cE('div'),
      label = cE('label'),
      radioButton = cE('input'),
      id = tools.randId(prefix);

    radioButton.type = 'radio';
    radioButton.name = name;
    radioButton.id = id;
    radioButton.value = value;

    surroundingDiv.appendChild(radioButton);

    label.htmlFor = id;
    label.textContent = text;

    surroundingDiv.appendChild(label);

    return {
      surroundingDiv: surroundingDiv,
      radioButton: radioButton
    };
  }

  function addVisibilityListener(element, parent, value) {
    element.attachEventListener({
      dispatcher: parent,
      type: 'visibility',
      callback: function (visible) {
        if (Array.isArray(value)) {
          element.setVisibility(visible && value.indexOf(parent.getValue()) !== -1);
        } else {
          element.setVisibility(visible && parent.getValue() === value);
        }
      }
    });
  }

  function addValueListener(element, parent, value) {
    if (Array.isArray(value)) {
      element.attachEventListener({
        dispatcher: parent,
        type: 'change', 
        callback: function () {
          element.setVisibility(value.indexOf(parent.getValue()) !== -1);
        }
      });
    } else {
      element.attachEventListener({
        dispatcher: parent,
        type: 'change', 
        callback: function () {
          element.setVisibility(parent.getValue() === value);
        }
      });
    }
  }

  function setVisibility(element, visible) {
    if (visible) {
      element.domElement.classList.remove('hidden-setting');
    } else {
      element.domElement.classList.add('hidden-setting');
    }
    element.dispatchEvent('visibility', visible);
  }
  
  /*
   * Converts float to string without meaningless trailing zeros
   */
  function roundedFloatToString(n) {
    return n.toPrecision(10).replace(/\.?0*e/, "e").replace(/\.([0-9]*[1-9])?0*$/, ".$1").replace(/\.$/, "");
  }
  
  /*
   * Creates a input of type range with an self updating label.
   *
   * config format:
   * {
   *   name: <name attribute of the created input element>,
   *   value: <default input value>,
   *   labelText: <text on the label>,
   *   [ id: <the id attribute of the created input element>, ]
   *   [ min: <minimal input value>, ]
   *   [ max: <maximal input value>, ]
   *   [ step: <step size in with the input value is increased>, ]
   *   [ info: <additional information>, ]
   *   [ disabled: true ]
   * }
   */
  function createRangeSetting(config) {
    var name = config.name,
      id = config.id || tools.randId(name),
      value = config.value,
      labelText = config.labelText,
      min = config.min,
      max = config.max,
      step = config.step,
      logScale = config.logScale,
      info = config.info,

      settingDiv = cE('div'),
      label = cE('label'),
      labelSet = cE('a'),
      labelVal = cE('span'),
      inputElement = cE('input'),
      equals = document.createTextNode(EQUALS);
    
    if (info !== undefined) {
      var divInfo = cE('div');
      divInfo.className = 'setting-info';
      divInfo.innerHTML = info;
      settingDiv.appendChild(divInfo);
    }

    inputElement.className = 'labeled-input';

    var element = new EventDispatcher(['change', 'visibility']);
    settingDiv.className = 'range-setting';

    label.htmlFor = id;

    labelSet.className = 'label-set';
    labelSet.href = 'javascript:void(0)';
    labelSet.innerHTML = labelText;

    label.appendChild(labelSet);
    labelSet.appendChild(equals);
    labelVal.className = 'label-val';
    labelSet.appendChild(labelVal);
    settingDiv.appendChild(label);

    inputElement.type = 'range';
    if (min !== undefined) {
      inputElement.min = min;
    }

    if (max !== undefined) {
      inputElement.max = max;
    }

    if (step !== undefined) {
      inputElement.step = step;
    }
    inputElement.name = name;
    inputElement.id = id;

    if (logScale) {
      if (min === undefined || max === undefined) {
        throw 'Need min and max value for log scale input: ' + name;
      }
      inputElement.value = toLogScale(value, min, max);
      element.getValue = function () {
        switch (inputElement.type) {
          case 'number':
            return parseFloat(inputElement.value, 10);
          case 'range':
            var toRound = fromLogScale(parseFloat(inputElement.value, 10), min, max);
            if (step !== undefined && step !== 'any') {
              return step * Math.round(toRound / step);
            } else {
              return toRound;
            }
        }
      };
      
      element.setValue = function (value, trigger) {
        switch (inputElement.type) {
          case 'number':
            inputElement.value = value;
            break;
          case 'range':
            inputElement.value = toLogScale(value, min, max);
            break;
        }
        labelVal.textContent = roundedFloatToString(element.getValue());
        if (trigger !== false) {
          this.dispatchEvent('change');
        }
      };
   
      function switchType() {
        var value = element.getValue();
        switch (inputElement.type) {
          case 'range':
            if (step !== undefined) {
              inputElement.step = step;
            } else {
              inputElement.removeAttribute('step');
            }
            inputElement.value = value;
            inputElement.step = step;
            inputElement.type = 'number';
            break;
          case 'number':
            inputElement.step = 'any';
            inputElement.value = toLogScale(value, min, max);
            inputElement.type = 'range';
            break;
        }
      };

      labelSet.addEventListener('click', function () {
        switchType();
        inputElement.focus();
      });

      inputElement.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && this.type === 'number') {
          switchType();
          inputElement.focus();
          e.stopPropagation();
          e.preventDefault();
        }
      });
      
      element.processKey = function (e) {
        var newValue;
        switch (inputElement.type) {
          case 'range':
            switchType();
            newValue = getValueAfterKey(inputElement, e);
            switchType();
            break;
          case 'number':
            newValue = getValueAfterKey(inputElement, e);
            break;
        }
        element.setValue(newValue);
      };
    } else {
      inputElement.value = value;
      element.getValue = function () {
        return parseFloat(inputElement.value, 10);
      };
      
      element.setValue = function (value, trigger) {
        inputElement.value = value;
        labelVal.textContent = roundedFloatToString(element.getValue());
        if (trigger !== false) {
          this.dispatchEvent('change');
        }
      };
      labelSet.addEventListener('click', function () {
        switch (inputElement.type) {
          case 'number':
            inputElement.type = 'range';
            break;
          case 'range':
            inputElement.type = 'number';
            break;
        }
        inputElement.focus();
      });

      inputElement.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && this.type === 'number') {
          this.type = 'range';
          this.focus();
          e.stopPropagation();
          e.preventDefault();
        }
      });
      
      element.processKey = function (e) {
        element.setValue(getValueAfterKey(inputElement, e));
      };
    }
    
    
    settingDiv.appendChild(inputElement);
    
    inputElement.addEventListener('input', function () {
      element.dispatchEvent('change');
    });

    labelVal.textContent = roundedFloatToString(element.getValue());

    element.focus = function() {
      inputElement.focus();
    };
      
    element.addEventListener('change', function () {
      labelVal.textContent = roundedFloatToString(element.getValue());
    });
    element.domElement = settingDiv;

    if (config.disabled) {
      inputElement.disabled = true;
    }

    element.setVisibility = function (visible) {
      if (!config.disabled) {
        if (visible) {
          inputElement.removeAttribute('disabled');
        } else {
          inputElement.disabled = true;
        }
      }
      setVisibility(this, visible);
    }

    return element;
  }
  
  function fromLogScale(value, min, max) {
    return min * Math.pow(max / min, (value - min) / (max - min));
  }

  function toLogScale(value, min, max) {
    return min + (max - min) * Math.log(value / min) / Math.log(max / min);
  }


  /*
   * Creates a input of type number with an self updating label.
   *
   * config format:
   * {
   *   name: <name attribute of the created input element>,
   *   value: <default input value>,
   *   labelText: <text on the label>,
   *   [ id: <the id attribute of the created input element>, ]
   *   [ min: <minimal input value>, ]
   *   [ max: <maximal input value>, ]
   *   [ step: <step size in with the input value is increased>, ]
   *   [ info: <additional information>, ]
   *   [ disabled: true ]
   * }
   */
  function createNumberSetting(config) {
    var name = config.name,
      id = config.id || tools.randId(name),
      value = config.value,
      labelText = config.labelText,
      info = config.info,

      settingDiv = cE('div'),
      label = cE('label'),
      inputElement = cE('input');

    if (info !== undefined) {
      var divInfo = cE('div');
      divInfo.className = 'setting-info';
      divInfo.innerHTML = info;
      settingDiv.appendChild(divInfo);
    }

    settingDiv.className = 'number-setting';

    label.htmlFor = id;
    label.innerHTML = labelText + EQUALS;
    settingDiv.appendChild(label);

    inputElement.type = 'number';
    inputElement.className = 'labeled-input';
    inputElement.name = name;
    inputElement.id = id;
    inputElement.value = value;

    inputElement.step = config.step;
    inputElement.min = config.min;
    inputElement.max = config.max;

    settingDiv.appendChild(inputElement);

    var element = new EventDispatcher(['change', 'visibility']);
    element.getValue = function () {
      return parseFloat(inputElement.value, 10);
    };
    element.setValue = function (value, trigger) {
      inputElement.value = value;
      if (trigger !== false) {
        this.dispatchEvent('change');
      }
    };
    inputElement.addEventListener('input', function () {
      element.dispatchEvent('change');
    });

    element.domElement = settingDiv;
    
    if (config.disabled) {
      inputElement.disabled = true;
    }
    
    element.setVisibility = function (visible) {
      if (!config.disabled) {
        if (visible) {
          inputElement.removeAttribute('disabled');
        } else {
          inputElement.disabled = true;
        }
      }
      setVisibility(this, visible);
    }

    element.focus = function() {
      inputElement.focus();
    };
      
    return element;
  }

  /*
   * Creates a input of type string with an label.
   *
   * config format:
   * {
   *   name: <name attribute of the created input element>,
   *   value: <default input value>,
   *   labelText: <text on the label>,
   *   [ maxlength: <maximal number of characters>, ]
   *   [ id: <the id attribute of the created input element>, ]
   *   [ info: <additional information>, ]
   *   [ disabled: true ]
   * }
   */
  function createStringSetting(config) {
    var name = config.name,
      id = config.id || tools.randId(name),
      value = config.value,
      maxlength = config.maxlength,
      labelText = config.labelText,
      info = config.info,

      settingDiv = cE('div'),
      label = cE('label'),
      inputElement = cE('input');

    if (info !== undefined) {
      var divInfo = cE('div');
      divInfo.className = 'setting-info';
      divInfo.innerHTML = info;
      settingDiv.appendChild(divInfo);
    }

    settingDiv.className = 'string-setting';

    label.htmlFor = id;
    label.innerHTML = labelText + EQUALS;

    settingDiv.appendChild(label);

    inputElement.type = 'text';
    inputElement.className = 'labeled-input';
    inputElement.value = value;
    inputElement.name = name;
    inputElement.id = id;

    if (maxlength !== undefined) {
      inputElement.maxLength = maxlength;
    }

    settingDiv.appendChild(inputElement);

    var element = new EventDispatcher(['change', 'visibility']);
    element.getValue = function () {
      return inputElement.value;
    };
    element.setValue = function (value, trigger) {
      inputElement.value = value;
      if (trigger !== false) {
        this.dispatchEvent('change');
      }
    };
    element.setTitle = function (title) {
      if (title === undefined) {
        inputElement.removeAttribute('title');
      } else {
        inputElement.title = title;
      }
    };
    element.setInvalid = function () {
      inputElement.classList.add('invalid');
    };
    element.setValid = function () {
      inputElement.classList.remove('invalid');
    };
    element.domElement = settingDiv;
    inputElement.addEventListener('input', function () {
      element.dispatchEvent('change');
    });
    
    if (config.disabled) {
      inputElement.disabled = true;
    }
    
    element.focus = function() {
      inputElement.focus();
    };
      
    element.setVisibility = function (visible) {
      if (!config.disabled) {
        if (visible) {
          inputElement.removeAttribute('disabled');
        } else {
          inputElement.disabled = true;
        }
      }
      setVisibility(this, visible);
    }

    return element;
  }

  /*
   * Creates a textarea with an label.
   *
   * config format:
   * {
   *   name: <name attribute of the created input element>,
   *   value: <default input value>,
   *   labelText: <text on the label>,
   *   rows: <number of rows>,
   *   [ id: <the id attribute of the created input element>, ]
   *   [ info: <additional information>, ]
   *   [ disabled: true ]
   * }
   */
  function createTextSetting(config) {
    var name = config.name,
      id = config.id || tools.randId(name),
      value = config.value,
      rows = config.rows || 3,
      labelText = config.labelText,
      info = config.info,

      settingDiv = cE('div'),
      label = cE('label'),
      inputElement = cE('textarea');

    if (info !== undefined) {
      var divInfo = cE('div');
      divInfo.className = 'setting-info';
      divInfo.innerHTML = info;
      settingDiv.appendChild(divInfo);
    }

    settingDiv.className = 'text-setting';

    label.htmlFor = id;
    label.innerHTML = labelText + EQUALS;

    settingDiv.appendChild(label);

    inputElement.rows = rows;
    inputElement.className = 'labeled-input';
    inputElement.value = value;
    inputElement.name = name;
    inputElement.id = id;

    settingDiv.appendChild(inputElement);

    var element = new EventDispatcher(['change', 'visibility']);
    element.getValue = function () {
      return inputElement.value;
    };
    element.setValue = function (value, trigger) {
      inputElement.value = value;
      if (trigger !== false) {
        this.dispatchEvent('change');
      }
    };
    element.setTitle = function (title) {
      if (title === undefined) {
        inputElement.removeAttribute('title');
      } else {
        inputElement.title = title;
      }
    };
    element.setInvalid = function () {
      inputElement.classList.add('invalid');
    };
    element.setValid = function () {
      inputElement.classList.remove('invalid');
    };
    element.domElement = settingDiv;
    inputElement.addEventListener('input', function () {
      element.dispatchEvent('change');
    });
    
    if (config.disabled) {
      inputElement.disabled = true;
    }
    
    element.setVisibility = function (visible) {
      if (!config.disabled) {
        if (visible) {
          inputElement.removeAttribute('disabled');
        } else {
          inputElement.disabled = true;
        }
      }
      setVisibility(this, visible);
    }

    element.focus = function() {
      inputElement.focus();
    };
      
    return element;
  }
  
  function createJSCodeSetting(config) {
    if (CodeMirror == undefined) {
      return createTextSetting(config);
    } else {
      var name = config.name,
        id = config.id || tools.randId(name),
        value = config.value,
        rows = config.rows || 3,
        labelText = config.labelText,
        info = config.info,
        lineNumbers = config.lineNumbers !== undefined ? config.lineNumbers : true,
        viewportMargin = config.viewportMargin !== undefined ? config.viewportMargin : Infinity,

        settingDiv = cE('div'),
        label = cE('label'),
        inputElement = cE('textarea');

      if (info !== undefined) {
        var divInfo = cE('div');
        divInfo.className = 'setting-info';
        divInfo.innerHTML = info;
        settingDiv.appendChild(divInfo);
      }

      settingDiv.className = 'jscode-setting';

      label.htmlFor = id;
      label.innerHTML = labelText + EQUALS;

      settingDiv.appendChild(label);

      /*inputElement.rows = rows;
      inputElement.className = 'labeled-input';
      inputElement.value = value;
      inputElement.name = name;
      inputElement.id = id;*/

      settingDiv.appendChild(inputElement);

      var element = new EventDispatcher(['change', 'visibility']);
      
      element.codeMirror = CodeMirror(function(elt) {
        settingDiv.replaceChild(elt, inputElement);
      }, {
        value: value,
        theme: 'ambiance',
        keyMap: localStorage.getItem("codemirror-keymap") || "default",
        readOnly: config.disabled,
        lineNumbers: lineNumbers,
        viewportMargin: viewportMargin,
      });

      element.getValue = function () {
        return this.codeMirror.getValue();
      };
      
      element.setValue = function (value, trigger) {
        this.codeMirror.setValue(value);
        this.codeMirror.setSize();
        this.codeMirror.refresh();
        if (trigger !== false) {
          this.dispatchEvent('change');
        }
      };
      element.setTitle = function (title) {
        if (title === undefined) {
          settingsDiv.removeAttribute('title');
        } else {
          settingsDiv.title = title;
        }
      };
      element.setInvalid = function () {
        settingsDiv.classList.add('invalid');
      };
      element.setValid = function () {
        settingsDiv.classList.remove('invalid');
      };
      element.domElement = settingDiv;
      element.codeMirror.on('change', function () {
        element.dispatchEvent('change');
      });
      
      element.setVisibility = function (visible) {
        if (!config.disabled) {
          if (visible) {
            settingDiv.removeAttribute('disabled');
          } else {
            settingDiv.disabled = true;
          }
        }
        setVisibility(this, visible);
        if (visible) {
          element.codeMirror.setSize();
          element.codeMirror.refresh();
        }
      }

      element.focus = function() {
        element.codeMirror.focus();
        element.codeMirror.refresh();
      };
      
      setTimeout(function () {
        element.codeMirror.setSize();
        element.codeMirror.refresh();
      }, 0);

      return element;
    }
  }

  /*
   * Creates a input of type file with an label.
   *
   * config format:
   * {
   *   name: <name attribute of the created input element>,
   *   labelText: <text on the label>,
   *   [ id: <the id attribute of the created input element>, ]
   *   [ info: <additional information>, ]
   *   [ disabled: true ]
   * }
   */
  function createFileSetting(config) {
    var name = config.name,
      id = config.id || tools.randId(name),
      labelText = config.labelText,
      info = config.info,

      settingDiv = cE('div'),
      label = cE('label'),
      labelButton = cE('button'),
      spanStatus = cE('span'),
      spanMsg = cE('span'),
      inputElement = cE('input');

    if (info !== undefined) {
      var divInfo = cE('div');
      divInfo.className = 'setting-info';
      divInfo.innerHTML = info;
      settingDiv.appendChild(divInfo);
    }

    settingDiv.className = 'file-setting';

    label.htmlFor = id;

    labelButton.innerHTML = labelText;
    labelButton.type = 'button';
    label.appendChild(labelButton);

    settingDiv.appendChild(label);

    spanStatus.className = 'file-status';

    spanMsg.className = 'file-msg';
    spanStatus.appendChild(spanMsg);

    settingDiv.appendChild(spanStatus);

    inputElement.type = 'file';
    inputElement.className = 'labeled-input';
    inputElement.name = name;
    inputElement.id = id;

    settingDiv.appendChild(inputElement);

    labelButton.addEventListener('click', function () {
      if (inputElement.files.length > 0) {
        inputElement.value = '';
        element.dispatchEvent('change');
      } else {
        inputElement.click();
      }
    });

    var element = new EventDispatcher(['change', 'visibility']);
    element.removeValue = function () {
      return inputElement.value = '';
    };
    element.getValue = function () {
      return inputElement.files;
    };
    element.setMsg = function (html) {
      spanMsg.innerHTML = html;
    };
    element.setValid = function () {
      settingDiv.classList.add('file-setting-set');
    };
    element.setInvalid = function () {
      settingDiv.classList.remove('file-setting-set');
    };
    element.domElement = settingDiv;
    inputElement.addEventListener('change', function () {
      element.dispatchEvent('change');
    });
    
    element.addEventListener('change', function () {
      if (element.getValue().length > 0) {
        labelButton.textContent = 'Reset (Currently: ' + inputElement.files[0].name + ')';

        settingDiv.classList.add('file-setting-set');
      } else {
        labelButton.innerHTML = labelText;
        settingDiv.classList.remove('file-setting-set');
      }
    });
    
    element.focus = function() {
      inputElement.focus();
    };
      
    if (config.disabled) {
      inputElement.disabled = true;
    }
    
    element.setVisibility = function (visible) {
      if (!config.disabled) {
        if (visible) {
          inputElement.removeAttribute('disabled');
        } else {
          inputElement.disabled = true;
        }
      }
      setVisibility(this, visible);
    }

    return element;
  }

  function setCodeMirrorKeyMap(keyMap) {
    localStorage.setItem("codemirror-keymap", keyMap);
    document.querySelectorAll(".CodeMirror").forEach(function (element) {element.CodeMirror.setOption("keyMap", keyMap)});
  }

  /*
   * Creates a input of type checkbox with an label.
   *
   * config format:
   * {
   *   name: <name attribute of the created input element>,
   *   value: {true, false}//checked or not checked,
   *   labelText: <text on the label>,
   *   [ id: <the id attribute of the created input element>, ]
   *   [ info: <additional information>, ]
   *   [ disabled: true ]
   * }
   */
  function createCheckboxSetting(config, settings) {
    var name = config.name,
      id = config.id || tools.randId(name),
      value = config.value,
      labelText = config.labelText,
      info = config.info,

      settingDiv = cE('div'),
      label = cE('label'),
      inputElement = cE('input');

    if (info !== undefined) {
      var divInfo = cE('div');
      divInfo.className = 'setting-info';
      divInfo.innerHTML = info;
      settingDiv.appendChild(divInfo);
    }

    settingDiv.className = 'checkbox-setting';

    inputElement.type = 'checkbox';
    inputElement.className = 'labeled-input';
    inputElement.name = name;
    inputElement.id = id;

    if (value === 'true' || value === true) {
      inputElement.checked = true;
    }

    settingDiv.appendChild(inputElement);

    label.htmlFor = id;
    label.innerHTML = labelText;

    settingDiv.appendChild(label);

    var element = new EventDispatcher(['change', 'visibility']);
    element.getValue = function () {
      return inputElement.checked;
    };
    element.setValue = function (value, trigger) {
      inputElement.checked = (value == true);
      if (trigger !== false) {
        this.dispatchEvent('change');
      }
    };
    element.processKey = function (e) {
      element.setValue(!element.getValue());
    };
    element.domElement = settingDiv;
    inputElement.addEventListener('change', function () {
      element.dispatchEvent('change');
    });

    if (config.disabled) {
      inputElement.disabled = true;
    }

    element.setVisibility = function (visible) {
      if (!config.disabled) {
        if (visible) {
          inputElement.removeAttribute('disabled');
        } else {
          inputElement.disabled = true;
        }
      }
      setVisibility(this, visible);
    }

    element.focus = function() {
      inputElement.focus();
    };
    
    return element;
  }

  /*
   * Creates a <select> with an label.
   *
   * config format:
   * {
   *   name: <name attribute of the created input element>,
   *   labelText: <text on the label>,
   *   values: [ <value for option1>, [...] ],
   *   texts: [ <shown value for option1>, [...] ],
   *   [ value: <default value from the lists values>, ]
   *   [ id: <the id attribute of the created input element>, ]
   *   [ info: <additional information>, ]
   *   [ disabled: true ]
   * }
   */
  function createSelectSetting(config) {
    var name = config.name,
      id = config.id || tools.randId(name),
      value = config.value,
      labelText = config.labelText,
      optionTexts = config.texts,
      optionValues = config.values,
      info = config.info,

      settingDiv = cE('div'),
      label = cE('label'),
      select = cE('select'),
      option;

    if (info !== undefined) {
      var divInfo = cE('div');
      divInfo.className = 'setting-info';
      divInfo.innerHTML = info;
      settingDiv.appendChild(divInfo);
    }

    settingDiv.className = 'select-setting';

    select.name = name;
    select.id = id;

    if (labelText !== undefined) {
      label.htmlFor = id;
      label.innerHTML = labelText;

      settingDiv.appendChild(label);
    }

    settingDiv.appendChild(select);

    for (var i = 0, len = optionTexts.length; i < len; i++) {
      option = cE('option');
      option.value = optionValues[i];
      option.innerHTML = optionTexts[i];

      if (optionValues[i] === value) {
        option.selected = true;
      }

      select.appendChild(option);
    }

    var element = new EventDispatcher(['change', 'visibility']);
    element.getValue = function () {
      return select.value;
    };
    element.setValue = function (value, trigger) {
      select.value = value;
      if (trigger !== false) {
        this.dispatchEvent('change');
      }
    };
    element.domElement = settingDiv;
    select.addEventListener('change', function () {
      element.dispatchEvent('change');
    });
    
    if (config.disabled) {
      select.disabled = true;
    }
    
    element.setVisibility = function (visible) {
      if (!config.disabled) {
        if (visible) {
          select.removeAttribute('disabled');
        } else {
          select.disabled = true;
        }
      }
      setVisibility(this, visible);
    }
    
    element.focus = function() {
      inputElement.focus();
    };
    
    return element;
  }

  /*
   * Creates a list of radio inputs with labels.
   *
   * config format:
   * {
   *   name: <name attribute of the created input elements>,
   *   values: [ <value for radio1>, [...] ],
   *   texts: [ <shown value for radio1>, [...] ],
   *   [ value: <default value from the lists values>, ]
   *   [ id: <the id attribute of the created input element>, ]
   *   [ info: <additional information>, ]
   *   [ disabled: true ]
   * }
   */
  function createRadioSetting(config) {
    var name = config.name,
      value = config.value,
      texts = config.texts,
      values = config.values,
      idPrefix = config.id || tools.randId(name),
      info = config.info,

      settingDiv = cE('div'),
      inputs = [];

    if (info !== undefined) {
      var divInfo = cE('div');
      divInfo.className = 'setting-info';
      divInfo.innerHTML = info;
      settingDiv.appendChild(divInfo);
    }

    if (values.indexOf(value) === -1) {
      value = values[0];
    }

    settingDiv.className = 'radio-setting';

    var element = new EventDispatcher(['change', 'visibility']);
    
    for (var i = 0, len = values.length; i < len; i++) {
      var id = idPrefix + '_' + values[i];
      var span = cE('span');
      
      var radioInput = cE('input');
      radioInput.type = 'radio';
      radioInput.name = name;
      radioInput.value = values[i];
      radioInput.id = id;

      radioInput.addEventListener('change', function () {
        element.dispatchEvent('change');
      });

      if (values[i] === value) {
        radioInput.checked = true;
      }
      span.appendChild(radioInput);
      inputs[i] = radioInput;
      
      var label = cE('label');
      label.innerHTML = texts[i];
      label.htmlFor = id;
      span.appendChild(label);
      
      settingDiv.appendChild(span);
    }
    
    element.setValue = function (value, trigger) {
      for (var i = 0, len = inputs.length; i < len; i++) {
        inputs[i].checked = inputs[i].value === value;
      }
      if (trigger !== false) {
        this.dispatchEvent('change');
      }
    };
    
    element.getValue = function () {
      for (var i = 0, len = inputs.length; i < len; i++) {
        if (inputs[i].checked) {
          return inputs[i].value;
        }
      }
    };

    element.processKey = function (e) {
      var step = (e.shiftKey ? -1 : 1);
      var len = values.length;
      this.setValue(values[(values.indexOf(this.getValue()) + step + len) % len]);
    };

    element.domElement = settingDiv;

    if (config.disabled) {
      for (var i = 0, len = inputs.length; i < len; i++) {
        inputs[i].disabled = true;
      }
    }

    element.setVisibility = function (visible) {
      if (!config.disabled) {
        for (var i = 0, len = inputs.length; i < len; i++) {
          var input = inputs[i];
          if (visible) {
            input.removeAttribute('disabled');
          } else {
            input.disabled = true;
          }
        }
      }
      setVisibility(this, visible);
    }
    
    element.focus = function() {
      inputElement.focus();
    };
    
    return element;
  }

  function createTabsSetting(config, settings) {
    var element = createRadioSetting(config);
    element.domElement.className = 'tabs-setting';
    
    return element;
  }

  /*
   * Creates a labeled setting
   *
   * config format:
   * {
   *   [ type: {checkbox, string, radio, select, file, number, range}, ]//default:range
   *   
   *   ... type specific config
   * }
   */
  function createSetting(config, settings) {
    if (config.syncURI) {
      var value = graphicTools.getUriFragmentQuery(config.name);
      if (value !== undefined) {
        var config = tools.copyInto(config, {});
        config.value = value;
      }
    }
    
    var element;
    switch (config.type) {
      case 'checkbox':
        element = createCheckboxSetting(config, settings);
        break;
      case 'string':
        element = createStringSetting(config);
        break;
      case 'text':
        element = createTextSetting(config);
        break;
      case 'jscode':
        element = createJSCodeSetting(config);
        break;
      case 'radio':
        element = createRadioSetting(config);
        break;
      case 'select':
        element = createSelectSetting(config);
        break;
      case 'tabs':
        element = createTabsSetting(config, settings);
        break;
      case 'file':
        element = createFileSetting(config);
        break;
      case 'number':
        element = createNumberSetting(config);
        break;
      case 'range':
      default:
        element = createRangeSetting(config);
        break;
    }
    EventAttacher.call(element);
    for (var name in EventAttacher.prototype) {
      if (EventAttacher.prototype.hasOwnProperty(name)) {
        element[name] = EventAttacher.prototype[name];
      }
    }

    if (config.syncURI) {
      var name = config.name;
      graphicTools.setUriFragmentQuery(name, element.getValue());
      element.addEventListener('change', function () {
        graphicTools.setUriFragmentQuery(name, element.getValue());
      });
    }

    return element;
  }
  
  function createSettings(configs, container, keyMap, settings) {
    if (settings === undefined) {
      settings = {};
    }
    var configs = tools.copyInto(configs, {});
    for (var name in configs) {
      if (configs.hasOwnProperty(name)) {
        var config = configs[name];
        config.name = name;

        var setting = createSetting(config, settings);
        settings[name] = setting;
        container.appendChild(setting.domElement);

        if (config.key) {
          keyMap[config.key] = setting;
        }
      }
    }
    
    for (var name in configs) {
      if (configs.hasOwnProperty(name)) {
        var value = settings[name].getValue();
      }
    }
    
    connectSettings(configs, settings);

    return settings;
  }

  function connectSettings(configs, settings) {
    var parent, value;
    for (var name in configs) {
      if (configs.hasOwnProperty(name)) {
        parent = configs[name].parent;
        value = configs[name].parentValue;
        if (parent !== undefined) {
          addVisibilityListener(settings[name], settings[parent], value);
          if (value !== undefined) {
            addValueListener(settings[name], settings[parent], value);
          }
        }
      }
    }

    for (var name in configs) {
      if (configs.hasOwnProperty(name)) {
        parent = configs[name].parent;
        value = configs[name].parentValue;
        if (parent !== undefined) {
          if (Array.isArray(value)) {
            settings[name].setVisibility(value.indexOf(settings[parent].getValue()) !== -1);
          } else {
            settings[name].setVisibility(settings[parent].getValue() === value);
          }
        }
      }
    }
  }

  return {
    createSetting: createSetting,
    createSettings: createSettings,
    connectSettings: connectSettings,
    
    SearchURL: SearchURL,
    setUriQuery: setUriQuery,
    setUriQueries: setUriQueries,
    removeUriQuery: removeUriQuery,
    removeUriQueries: removeUriQueries,
    getUriQuery: getUriQuery,
    
    setUriFragmentQuery: setUriFragmentQuery,
    setUriFragmentQueries: setUriFragmentQueries,
    removeUriFragmentQuery: removeUriFragmentQuery,
    removeUriFragmentQueries: removeUriFragmentQueries,
    getUriFragmentQuery: getUriFragmentQuery,
    
    enableDragAndDropMove: enableDragAndDropMove,
    processKey: processKey,
    toValidFileName: toValidFileName,
    startDownload: startDownload,
    removeAllChildNodes: removeAllChildNodes,
    askForNumber: askForNumber,
    getFontColor: getFontColor,
    createLabeledRadioButton: createLabeledRadioButton,

    setCodeMirrorKeyMap: setCodeMirrorKeyMap,
    toFixed: toFixed,
    toggleFullscreen: toggleFullscreen,
    promptRangeValue: promptRangeValue,
    getValueAfterSteps: getValueAfterSteps,
    getValueAfterKey: getValueAfterKey,
    getValueAfterScroll: getValueAfterScroll,
    radioStep: radioStep,
    wasFiredOnInput: wasFiredOnInput
  };
}());
