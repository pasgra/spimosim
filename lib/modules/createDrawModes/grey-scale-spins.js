/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  function create1SpinGreyScaleDrawFrame(colorSet, spinName, minValue, maxValue) {
    var diff = maxValue - minValue, m, b;

    switch (tools.ENDIAN) {
      case 'big':
        m = (1 + (1 << 8) + (1 << 16)) << 8;
        b = (1 << 8) - 1;
        break;
      case 'little':
        m = 1 + (1 << 8) + (1 << 16);
        b = ((1 << 8) - 1) << 24;
        break;
    }

    return function (pixels, protocol, t, offset) {
      function setPixel(value, i) {
        pixels[i] = m * ~~((value - minValue) * 255 / diff) + b;
      };

      protocol.get(spinName, t).slice(offset, pixels.length + offset).forEach(setPixel);
    };
  }
  
  var greyScaleSpins = function (config, colorSet) {
    var drawModes = [],
      labelTexts = config.labelTexts || config.names;
    for (var i = 0, len = config.names.length; i < len; i++) {
      drawModes.push({
        draw: create1SpinGreyScaleDrawFrame(colorSet, config.names[i], config.minValues[i], config.maxValues[i]),
        text: labelTexts[i]
      });
    }

    return drawModes;
  };

  spimosimCore.modules.add('createDrawModes', {
    name: 'grey scale spins',
    files: [ 'lib/modules/createDrawModes/grey-scale-spins.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A draw mode for integers or floats shown as grey scale values.',
    date: '2020-03-26'
  }, greyScaleSpins);
}());
