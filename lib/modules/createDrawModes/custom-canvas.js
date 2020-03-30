/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  var customCanvas = function (config, colorSet) {
    var drawModes = [];
    try {
      var createCustomDrawFrame = new Function('colorSet', config.code);
      var drawFunctions = createCustomDrawFrame(colorSet);
    } catch (e) {
      e.message = 'Cannot create draw mode - ' + e.message;
      throw e;
    }
    if (drawFunctions.length !== config.texts.length) {
      throw 'Cannot create draw modes - number of texts does not equal number of draw functions.';
    }
    for (var i = 0; i < drawFunctions.length; i++) {
      drawModes.push({
        draw: drawFunctions[i],
        text: config.texts[i]
      });
    }
    return drawModes;
  };

  spimosimCore.modules.add('createDrawModes', {
    files: [ 'lib/modules/createDrawModes/custom-canvas.js' ],
    name: 'custom canvas',
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'An abstract draw mode that uses a canvas.',
    date: '2020-03-26'
  }, customCanvas);
}());
