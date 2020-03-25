/* Copyright 2018 Pascal Grafe - MIT License */
'use strict';

(function () {
  (function () {
    var RGB_STR_BLUE = '#4682b4';
    var RGB_STR_YELLOW = '#ffb958';

    tools.copyInto({
      CONT_UP: [
        RGB_STR_BLUE,
      ],
      CONT_DOWN: [
        RGB_STR_YELLOW
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
        var m= value > 0 ? mUpComponents : mDownComponents;  
        value = Math.abs(value);
        pixels[i] = (value * m[3] & (255 << 24)) + (value * m[2] & (255 << 16)) + (value * m[1] & (255 << 8)) + (value * m[0] & 255) + b;
      };

      protocol.get(spinName, t).slice(offset).forEach(setPixel);
    };
  }

  spimosimCore.modules.add('createDrawModes', 'weighted spins', function (config, colorSet) {
    var drawModes = [],
      labelTexts = config.labelTexts || config.names,
      spinNumbers = config.spinNumbers || new Array(config.names.length);
    for (var i = 0, len = config.names.length; i < len; i++) {
      drawModes.push({
        draw: create1WeightedSpinDrawFrame(colorSet, config.names[i], config.spinNumbers[i]),
        text: labelTexts[i]
      });
    }

    return drawModes;
  });
}());
