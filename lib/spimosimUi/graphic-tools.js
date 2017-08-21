/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

/*
 * This is a support library many with useful tools to interact with the user
 * mainly by manipulating HTML.
 */

var graphicTools = (function() {
  var EQUALS = '\u202F=\u202F';
  var EventDispatcher = tools.EventDispatcher;

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

    SearchURL.location.setOption(key, String(value)).replaceState();
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
   * Wraps a URI to easily manipulate its search string.
   */
  function SearchURL(loc) {
    this.url = new URL(loc);

    this.options = {};
    var search = this.url.search;
    if (search.length > 1) {
      var pairs = search.substr(1).split('&');
      for (var i = 0, len = pairs.length; i < len; i++) {
        var pair = pairs[i].split('=');
        this.options[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
    }
  }

  /*
   * Return the url as a string
   */
  SearchURL.prototype.toString = function () {
    var names = Object.getOwnPropertyNames(this.options).sort(),
      search = '?';

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
    this.url.search = search;

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

  if (Modernizr.urlparser) {
    //A wrapped versions of the documents location uri
    SearchURL.location = new SearchURL(location);

    /*
     * Replaces the URI of the document
     */
    SearchURL.location.replaceState = function () {
      window.history.replaceState({}, null, this.toString());
    };
  }


  /*
   * Prompt for the input value of a range input. This function is called when
   * clicking the label
   */
  function promtRangeValue(input, msg) {
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
   * range inputs. Requires events from jQuery with mousewheel plugin.
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

    var $form = $(form);

    var modes = $.map($form.find('input[name="' + name + '"]'),
        function (i) {
          return i.value;
        }),
      i = modes.indexOf($form.find('input[name="' + name + '"]:checked').val()),
      len = modes.length,
      newMode = modes[(i + len + steps) % len];

    $form.find('input[name="' + name + '"][value="' + newMode + '"]').click();
  };


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
   *   [ disabled: true//disables and hides the element,
   *     [ shown: true//show the element nevertheless, ] ]
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

      settingDiv = cE('div'),
      label = cE('label'),
      labelSet = cE('a'),
      labelVal = cE('span'),
      inputElement = cE('input'),
      equals = document.createTextNode(EQUALS);
    
    inputElement.className = 'labeled-input';

    var element = new EventDispatcher(['change']);
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

    if (config.disabled) {
      inputElement.disabled = true;
      if (!config.shown) {
        settingDiv.style.display = 'none';
      }
    }

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
        labelVal.textContent = element.getValue();
        if (trigger !== false) {
          this.dispatchEvent('change');
        }
      };
   
      function switchType() {
        switch (inputElement.type) {
          case 'range':
            var value = element.getValue();
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
            inputElement.value = toLogScale(element.getValue());
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
        labelVal.textContent = element.getValue();
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

    labelVal.textContent = element.getValue();

    element.addEventListener('change', function () {
      labelVal.textContent = element.getValue();
    });
    element.domElement = settingDiv;

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
   *   [ disabled: true//disables and hides the element,
   *     [ shown: true//show the element nevertheless, ] ]
   * }
   */
  function createNumberSetting(config) {
    var name = config.name,
      id = config.id || tools.randId(name),
      value = config.value,
      labelText = config.labelText,

      settingDiv = cE('div'),
      label = cE('label'),
      inputElement = cE('input');

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

    if (config.disabled) {
      inputElement.disabled = true;
      if (!config.shown) {
        settingDiv.style.display = 'none';
      }
    }

    settingDiv.appendChild(inputElement);

    var element = new EventDispatcher(['change']);
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
   *   [ id: <the id attribute of the created input element>, ]
   *   [ disabled: true//disables and hides the element,
   *     [ shown: true//show the element nevertheless, ] ]
   * }
   */
  function createStringSetting(config) {
    var name = config.name,
      id = config.id || tools.randId(name),
      value = config.value,
      labelText = config.labelText,

      settingDiv = cE('div'),
      label = cE('label'),
      inputElement = cE('input');

    settingDiv.className = 'string-setting';

    label.htmlFor = id;
    label.innerHTML = labelText + EQUALS;

    settingDiv.appendChild(label);

    inputElement.type = 'text';
    inputElement.className = 'labeled-input';
    inputElement.value = value;
    inputElement.name = name;
    inputElement.id = id;

    if (config.disabled) {
      inputElement.disabled = true;
      if (!config.shown) {
        settingDiv.style.display = 'none';
      }
    }

    settingDiv.appendChild(inputElement);

    var element = new EventDispatcher(['change']);
    element.getValue = function () {
      return parseFloat(inputElement.value, 10);
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

    return element;
  }

  /*
   * Creates a input of type file with an label.
   *
   * config format:
   * {
   *   name: <name attribute of the created input element>,
   *   labelText: <text on the label>,
   *   [ id: <the id attribute of the created input element>, ]
   *   [ disabled: true//disables and hides the element,
   *     [ shown: true//show the element nevertheless, ] ]
   * }
   */
  function createFileSetting(config) {
    var name = config.name,
      id = config.id || tools.randId(name),
      labelText = config.labelText,

      settingDiv = cE('div'),
      label = cE('label'),
      labelButton = cE('button'),
      spanStatus = cE('span'),
      spanMsg = cE('span'),
      inputElement = cE('input');

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

    if (config.disabled) {
      inputElement.disabled = true;
      if (!config.shown) {
        settingDiv.style.display = 'none';
      }
    }

    settingDiv.appendChild(inputElement);

    labelButton.addEventListener('click', function () {
      if (inputElement.files.length > 0) {
        inputElement.value = '';
        element.dispatchEvent('change');
      } else {
        inputElement.click();
      }
    });

    var element = new EventDispatcher(['change']);
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
      settingDov.classList.add('file-setting-set');
    };
    element.setInvalid = function () {
      settingDov.classList.remove('file-setting-set');
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

    return element;
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
   *   [ disabled: true//disables and hides the element,
   *     [ shown: true//show the element nevertheless, ] ]
   *   [ disables: <list of names of inputs that will be disabled when the
   *      checkbox is checked>, ]
   *   [ enables: <list of names of inputs that will be enabled when the
   *      checkbox is checked>, ]
   * }
   */
  function createCheckboxSetting(config) {
    var name = config.name,
      id = config.id || tools.randId(name),
      value = config.value,
      labelText = config.labelText,

      settingDiv = cE('div'),
      label = cE('label'),
      inputElement = cE('input');

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

    if (config.disabled) {
      inputElement.disabled = true;
      if (!config.shown) {
        settingDiv.style.display = 'none';
      }
    }

    var element = new EventDispatcher(['change']);
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

    if (config.disables) {
      //disable a list of other element when this checkbox is selected.

      var disables = config.disables;
      
      if (!Array.isArray(disables)) {
        disables = [ disables ];
      }

      element.addEventListener('change',
        function (e) {
          var form;
          if (this.form) {
            form = this.form;
          } else {
            form = document;
          }

          for (var i = 0, len = disables.length; i < len; i++) {
            var input = form.querySelector('input[name="'  + disables[i] + '"]');

            if (element.getValue()) {
              input.disabled = true;
              input.parentNode.style.display = 'none';
            } else {
              input.disabled = false;
              input.parentNode.style.display = '';
            }
          }
        }
      );
    }

    if (config.enables) {
      //enable a list of other element when this checkbox is selected.

      var enables = config.enables;
      if (!Array.isArray(enables)) {
        enables = [ enables ];
      }

      element.addEventListener('change',
        function (e) {
          var form;
          if (this.form) {
            form = this.form;
          } else {
            form = document;
          }

          for (var i = 0, len = enables.length; i < len; i++) {
            var input = form.querySelector('input[name="'  + enables[i] + '"]');

            if (!element.getValue()) {
              input.disabled = true;
              input.parentNode.style.display = 'none';
            } else {
              input.disabled = false;
              input.parentNode.style.display = '';
            }
          }
        }
      );
    }
    
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
   *   [ disabled: true//disables and hides the element,
   *     [ shown: true//show the element nevertheless, ] ]
   * }
   */
  function createSelectSetting(config) {
    var name = config.name,
      id = config.id || tools.randId(name),
      value = config.value,
      labelText = config.labelText,
      optionTexts = config.texts,
      optionValues = config.values,

      settingDiv = cE('div'),
      label = cE('label'),
      select = cE('select'),
      option;

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

    if (config.disabled) {
      inputElement.disabled = true;
      if (!config.shown) {
        settingDiv.style.display = 'none';
      }
    }

    var element = new EventDispatcher(['change']);
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
   *   [ disabled: true//disables and hides the element,
   *     [ shown: true//show the element nevertheless, ] ]
   * }
   */
  function createRadioSetting(config) {
    var name = config.name,
      value = config.value,
      texts = config.texts,
      values = config.values,
      idPrefix = config.id || tools.randId(name),

      settingDiv = cE('div'),
      inputs = [];

    if (values.indexOf(value) === -1) {
      value = values[0];
    }

    settingDiv.className = 'radio-setting';

    var element = new EventDispatcher(['change']);
    
    for (var i = 0, len = values.length; i < len; i++) {
      var id = idPrefix + '_' + values[i];
      var span = cE('span');
      
      var radioInput = cE('input');
      radioInput.type = 'radio';
      radioInput.name = name;
      radioInput.value = values[i];
      radioInput.id = id;
      if (config.disabled) {
        radioInput.disabled = true;
      }

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


    if (config.disabled && !config.shown) {
      settingDiv.style.display = 'none';
    }
    
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
  function createSetting(config) {
    if (config.syncURI) {
      var value = graphicTools.getUriQuery(config.name);
      if (value !== undefined) {
        config.value = value;
      }
    }
    
    var element;
    switch (config.type) {
      case 'checkbox':
        element = createCheckboxSetting(config);
        break;
      case 'string':
        element = createStringSetting(config);
        break;
      case 'radio':
        element = createRadioSetting(config);
        break;
      case 'select':
        element = createSelectSetting(config);
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

    if (config.syncURI) {
      var name = config.name;
      graphicTools.setUriQuery(name, element.getValue());
      element.addEventListener('change', function () {
        graphicTools.setUriQuery(name, element.getValue());
      });
    }

    return element;
  }

  /*
   * Toggles div as the fullscreen element
   */
  function toggleFullscreen(e, div) {
    var $body = $(document.body);

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
        $body.css('overflow', '');//show scroll bars (if necessary)
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
        $body.css('overflow', 'hidden');//hide scroll bars
      }
    }

    e.stopPropagation();
  }

  /*
   * Enables drag and drop reordering of the childs (matching 'childSelector')
   * of an element (matching 'parentSelector'). If 'childSelector' is not
   * defined, the direct childs of 'parentSelector' are used. The childs
   * can be dragged at any of their child nodes that match 'handleSelect' (or
   * any if not defined) but not 'cancelSelector' (if defined).
   *
   * Build on the jQueryUI modules draggable and droppable.
   */
  function enableDragAndDropMove(parentSelector, childSelector, handleSelector,
      cancelSelector) {
    var options = {
      revert: true,
      revertDuration: 0,
      cursor: 'move',
      distance: 20
    };

    if (childSelector === undefined) {
      childSelector = parentSelector + '>*';
    }

    if (handleSelector !== undefined) {
      options.handle = handleSelector;
    }

    if (cancelSelector !== undefined) {
      options.cancel = cancelSelector;
    }

    $(childSelector)
      .draggable(options)
      .droppable({
        accept: parentSelector + '>*',
        drop: function(e, ui) {
          var dragged = ui.draggable[0],
            droppedOn = this,
            parentNode = dragged.parentNode;

          var siblings = parentNode.children,
            sibling;
          for (var i = 0, len = siblings.length; i < len - 1; i++) {
            sibling = siblings[i];
            if (sibling === droppedOn) {
              parentNode.insertBefore(dragged, droppedOn);
              return;
            } else if (sibling === dragged) {
              parentNode.insertBefore(dragged, droppedOn.nextSibling);
              return;
            }
          }

          parentNode.appendChild(dragged);
        }
      });
  }

  /*
   * Returns true if the event 'e' was fired on a input element with text input.
   * Useful to skip unintented keyboard shortcurs.
   */
  function wasFiredOnInput(e) {
    return (e.target.nodeName.toLowerCase() === 'select' ||
      e.target.nodeName.toLowerCase() === 'input' &&
      e.target.type !== 'range' && e.target.type !== 'checkbox' &&
      e.target.type !== 'radio');
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

  return {
    createSetting: createSetting,
    
    SearchURL: SearchURL,
    setUriQuery: setUriQuery,
    setUriQueries: setUriQueries,
    removeUriQuery: removeUriQuery,
    removeUriQueries: removeUriQueries,
    getUriQuery: getUriQuery,
    
    enableDragAndDropMove: enableDragAndDropMove,
    processKey: processKey,
    toValidFileName: toValidFileName,
    startDownload: startDownload,
    removeAllChildNodes: removeAllChildNodes,
    askForNumber: askForNumber,
    getFontColor: getFontColor,
    createLabeledRadioButton: createLabeledRadioButton,

    toFixed: toFixed,
    toggleFullscreen: toggleFullscreen,
    promtRangeValue: promtRangeValue,
    getValueAfterSteps: getValueAfterSteps,
    getValueAfterKey: getValueAfterKey,
    getValueAfterScroll: getValueAfterScroll,
    radioStep: radioStep,
    wasFiredOnInput: wasFiredOnInput
  };
}());
