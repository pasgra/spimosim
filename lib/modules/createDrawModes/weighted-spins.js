/* Copyright 2018 Pascal Grafe - MIT License */
'use strict';

(function () {
  (function () {
    var RGB_STR_BLUE = '#4682b4';
    var RGB_STR_RED = '#ff3333';
    var RGB_STR_GREEN = '#33ff33';
    var RGB_STR_YELLOW = '#ffb958';

    tools.copyInto({
      CONT_UP: [
        RGB_STR_BLUE,
        RGB_STR_GREEN
      ],
      CONT_DOWN: [
        RGB_STR_YELLOW,
        RGB_STR_RED
      ]
    }, spimosimUi.colorSet);
  }());

  function create1WeightedSpinDrawFrame(colorSet, spinName, spinNumber) {
    var b;
    switch (tools.ENDIAN) {
      case 'big':
        b = (1 << 8) - 1;
        break;
      case 'little':
        b = ((1 << 8) - 1) << 24;
        break;
    }

    var mUp = colorSet.CONT_UP[spinNumber],
      mDown = colorSet.CONT_DOWN[spinNumber],
      mUpComponents = [ mUp & 255, mUp & (255 << 8), mUp & (255 << 16), mUp & (255 << 24) ],
      mDownComponents = [ mDown & 255, mDown & (255 << 8), mDown & (255 << 16), mDown & (255 << 24) ];

    return function (pixels, protocol, t, offset) {
      function setPixel(value, i) {
        var m = value > 0 ? mUpComponents : mDownComponents;  
        value = Math.abs(value);
        pixels[i] = (value * m[3] & (255 << 24)) + (value * m[2] & (255 << 16)) + (value * m[1] & (255 << 8)) + (value * m[0] & 255) + b;
      };

      protocol.get(spinName, t).slice(offset, pixels.length + offset).forEach(setPixel);
    };
  }

  var weightedSpins = function (config, colorSet) {
    var drawModes = [],
      labelTexts = config.labelTexts || config.names,
      spinNumbers = config.spinNumbers;
    
    if (spinNumbers == undefined) {
      spinNumbers = [];
      for (var i = 0; i < config.names.length; i++) {
        spinNumbers[i] = i;
      }
    }

    for (var i = 0, len = config.names.length; i < len; i++) {
      drawModes.push({
        draw: create1WeightedSpinDrawFrame(colorSet, config.names[i], spinNumbers[i]),
        text: labelTexts[i]
      });
    }

    return drawModes;
  };

  spimosimCore.modules.add('createDrawModes', {
    name: 'weighted spins',
    files: [ 'lib/modules/createDrawModes/weighted-spins.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A draw mode for floats between -1 and 1 represented by two colors depending on the sign and brightness depending on the absolute value.',
    date: '2020-03-26'
  }, weightedSpins);
}());
