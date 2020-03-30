/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  var modules = spimosimCore.modules;

  (function () {
    var RGB_STR_WHITE = '#ffffff',
      RGB_STR_GREY = '#708090',
      RGB_STR_BLACK = '#000000',
      RGB_STR_BLUE = '#4682b4',
      RGB_STR_LIGHT_BLUE = '#6e95b5',
      RGB_STR_DARK_BLUE = '#2d5373',
      RGB_STR_YELLOW = '#ffb958',
      RGB_STR_DARK_YELLOW = '#d5820f',
      RGB_STR_LIGHT_YELLOW = '#ffc87c',
      RGB_STR_GREEN = '#a39e86',
      RGB_STR_YELLOWISH_GREEN = '#c2a834',
      RGB_STR_BLUEISH_GREEN = '#87749a',
      RGB_STR_RED = '#b40431',
      RGB_STR_SLATEGREY = '#708090',
      RGB_STR_DARKSLATEGREY = '#2d4f4f',
      RGB_STR_STEELBLUE = '#4682b4';

    tools.copyInto({
      UP: [
        RGB_STR_BLUE,
        RGB_STR_YELLOW
      ],
      BOTH_UP: RGB_STR_GREEN,
      DOWN: [
        RGB_STR_BLACK,
        RGB_STR_BLACK
      ],
      BOTH_DOWN: RGB_STR_BLACK,
      GOT_UP: [
        RGB_STR_LIGHT_BLUE,
        RGB_STR_LIGHT_YELLOW
      ],
      BOTH_GOT_UP: RGB_STR_WHITE,
      GOT_DOWN: [
        RGB_STR_DARK_BLUE,
        RGB_STR_DARK_YELLOW
      ],
      BOTH_GOT_DOWN: RGB_STR_BLACK,
      UP_DOWN: RGB_STR_BLUE,
      DOWN_UP: RGB_STR_YELLOW,
      GOT_UP_GOT_DOWN: RGB_STR_BLUEISH_GREEN,
      GOT_DOWN_GOT_UP: RGB_STR_YELLOWISH_GREEN
    }, spimosimUi.colorSet);
  }());



  function create1SpinDrawFrame(colorSet, spinName, spinNumber) {
    var NEUTRAL = colorSet.NEUTRAL,
      INVALID = colorSet.INVALID,
      UP = colorSet.UP[spinNumber],
      DOWN = colorSet.DOWN[spinNumber];

    return function (pixels, protocol, t, offset) {
      function setPixel(is1Up, i) {
        if (is1Up === 1) {
          pixels[i] = UP;
        } else if (is1Up === 0) {
          pixels[i] = DOWN;
        } else {//Spin is probably undefined
          pixels[i] = INVALID;
        }
      };

      protocol.get(spinName, t).forEach(setPixel, offset);
    };
  }

  function create2SpinDrawFrame(colorSet, spinName1, spinName2,
      spinNumber1, spinNumber2) {
    var NEUTRAL = colorSet.NEUTRAL,
      INVALID = colorSet.INVALID,
      UP_DOWN = colorSet.UP_DOWN,
      DOWN_UP = colorSet.DOWN_UP,
      BOTH_UP = colorSet.BOTH_UP,
      BOTH_DOWN = colorSet.BOTH_DOWN;

    return function (pixels, protocol, t, offset) {
      function setPixel(is1Up, is2Up, i) {
        if (is1Up === 1 && is2Up === 1) {
          pixels[i] = BOTH_UP;
        } else if (is1Up === 1 && is2Up === 0) {
          pixels[i] = UP_DOWN;
        } else if (is1Up === 0 && is2Up === 1) {
          pixels[i] = DOWN_UP;
        } else if (is1Up === 0 && is2Up === 0) {
          pixels[i] = BOTH_DOWN;
        } else {//Spins are probably undefined
          pixels[i] = INVALID;
        }
      };

      protocol.get(spinName1, t)
        .forEach2(setPixel, offset, protocol.get(spinName2, t));
    };
  }

  function create1SpinDrawDeltaFrame(colorSet, spinName, spinNumber) {
    var NEUTRAL = colorSet.NEUTRAL,
      INVALID = colorSet.INVALID,
      GOT_UP = colorSet.GOT_UP[spinNumber],
      GOT_DOWN = colorSet.GOT_DOWN[spinNumber];

    return function (pixels, protocol, t, offset) {
      function setPixel(isUp, wasUp, i) {
        if ((isUp === 1 && wasUp === 1) || (isUp === 0 && wasUp === 0)) {
          pixels[i] = NEUTRAL;
        } else if (isUp === 1 && wasUp === 0) {
          pixels[i] = GOT_UP;
        } else if (isUp === 0 && wasUp === 1) {
          pixels[i] = GOT_DOWN;
        } else {//Spins are probably undefined
          pixels[i] = INVALID;
        }
      };

      protocol.get(spinName, t)
        .forEach2(setPixel, offset, protocol.get(spinName, t - 1));
    };
  }

  function create2SpinDrawDeltaFrame(colorSet, spinName1, spinName2,
      spinNumber1, spinNumber2) {
    var NEUTRAL = colorSet.NEUTRAL,
      INVALID = colorSet.INVALID,
      BOTH_GOT_UP = colorSet.BOTH_GOT_UP,
      BOTH_GOT_DOWN = colorSet.BOTH_GOT_DOWN,
      GOT_UP_GOT_DOWN = colorSet.GOT_UP_GOT_DOWN,
      GOT_DOWN_GOT_UP = colorSet.GOT_DOWN_GOT_UP,
      GOT_UP_1 = colorSet.GOT_UP[spinNumber1],
      GOT_UP_2 = colorSet.GOT_UP[spinNumber2],
      GOT_DOWN_1 = colorSet.GOT_DOWN[spinNumber1],
      GOT_DOWN_2 = colorSet.GOT_DOWN[spinNumber2];

    return function (pixels, protocol, t, offset) {
      function setPixel(is1Up, was1Up, is2Up, was2Up, i) {
        if (((is1Up === 1 && was1Up === 1) || (is1Up === 0 && was1Up === 0)) &&
            ((is2Up === 1 && was2Up === 1) || (is2Up === 0 && was2Up === 0))) {
          pixels[i] = NEUTRAL;
        } else if ((is1Up === 1 && was1Up === 0) &&
            ((is2Up === 1 && was2Up === 1) || (is2Up === 0 && was2Up === 0))) {
          pixels[i] = GOT_UP_1;
        } else if ((is1Up === 0 && was1Up === 1) &&
            ((is2Up === 1 && was2Up === 1) || (is2Up === 0 && was2Up === 0))) {
          pixels[i] = GOT_DOWN_1;
        } else if ((is2Up === 1 && was2Up === 0) &&
            ((is1Up === 1 && was1Up === 1) || (is1Up === 0 && was1Up === 0))) {
          pixels[i] = GOT_UP_2;
        } else if ((is2Up === 0 && was2Up === 1) &&
            ((is1Up === 1 && was1Up === 1) || (is1Up === 0 && was1Up === 0))) {
          pixels[i] = GOT_DOWN_2;
        } else if (is1Up === 1 && was1Up === 0 && is2Up === 0 && was2Up === 1) {
          pixels[i] = GOT_UP_GOT_DOWN;
        } else if (is1Up === 0 && was1Up === 1 && is2Up === 1 && was2Up === 0) {
          pixels[i] = GOT_DOWN_GOT_UP;
        } else if (is1Up === 0 && was1Up === 1 && is2Up === 0 && was2Up === 1) {
          pixels[i] = BOTH_GOT_DOWN;
        } else if (is1Up === 1 && was1Up === 0 && is2Up === 1 && was2Up === 0) {
          pixels[i] = BOTH_GOT_UP;
        } else {//Spins are probably undefined
          pixels[i] = INVALID;
        }
      };

      var spins1 = protocol.get(spinName1, t),
        spins2 = protocol.get(spinName2, t),
        spins1Before = protocol.get(spinName1, t - 1),
        spins2Before = protocol.get(spinName2, t - 1);
      spins1.forEach4(setPixel, offset, spins1Before, spins2, spins2Before);
    };
  }

  var spinsAndFlips = function (config, colorSet) {
    var names = config.names;
    if (!Array.isArray(names)) {
      names = [ names ];
    }

    var drawModes = [];

    for (var i = 0, len = names.length; i < len; i++) {
      var name = names[i];

      drawModes.push({
        draw: create1SpinDrawFrame(colorSet, name, i),
        text: name + ' spins'
      });

      drawModes.push({
        draw: create1SpinDrawDeltaFrame(colorSet, name, i),
        text: name + ' spin flips'
      });

      for (var j = 0; j < i; j++) {
        var name2 = names[j];

        drawModes.push({
          draw: create2SpinDrawFrame(colorSet, name, name2, i, j),
          text: name + ' and ' + name2 + ' spins'
        });

        drawModes.push({
          draw: create2SpinDrawDeltaFrame(colorSet, name, name2, i, j),
          text: name + ' and ' + name2 + ' spin flips'
        });
      }
    }

    return drawModes;
  };

  spimosimCore.modules.add('createDrawModes', {
    name: 'spins and flips',
    files: [ 'lib/modules/createDrawModes/spins-and-flips.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A draw mode for a bit spins/booleans, changes in their orientation and even two spins/booleans at once.',
    date: '2020-03-26'
  }, spinsAndFlips);
}());
