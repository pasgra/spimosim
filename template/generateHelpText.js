'use strict';

spimosimCore.modules.add('HelpTextGenerator', 'custom', function (iconUrl) {
  return '<h2>Instructions</h2>' +
    '<p>' +
    '  On this website you can play with several interesting models studied by' +
    '  our group.' +
    '  Use the arrows next to the model name to switch between models.' +
    '<p>' +
    '' +
    '<p>' +
    '  In the left section you can change parameters of the model and' +
    '  the network and more. Click' +
    '  <ul>' +
    '    <li><img class="inline-symbol" src="' + iconUrl + '/restart.svg"> to restart the simulation or</li>' +
    '    <li><img class="inline-symbol" src="' + iconUrl + '/settings.svg"> for more options.</li>' +
    '  </ul>' +
    '<p>' +
    '' +
    '<p>' +
    '  In the middle section you can see the state of the model.' +
    '</p>' +
    '' +
    '<p>' +
    '  In the right section you see plots that visualize and analyze the' +
    '  simulated data. Click <img class="inline-symbol" src="' + iconUrl + '/tools.svg">' +
    '  to download CSV files and more.' +
    '</p>';
  });
