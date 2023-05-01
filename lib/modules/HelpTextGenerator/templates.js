spimosimCore.modules.add("creator-module-templates", "HelpTextGenerator", {
  labelText: "HelpTextGenerator",
  templates: {
    "HelpTextGenerator": {
      object: 'myHelpTextGenerator',
      template: `/*
 * Return a customized help text (HTML is possible). The argument 'iconUrl' is
 * the directory containing the current set of icons.
 */
function myHelpTextGenerator(iconUrl) {
  return '<h2>My custom help</h2>' +
    'Click' +
    '<ul>' +
    '  <li><img class="inline-symbol" src="' + iconUrl + '/restart.svg"> to restart the simulation or</li>' +
    '  <li><img class="inline-symbol" src="' + iconUrl + '/settings.svg"> for more options.</li>' +
    '</ul>';
}`
    }
  }
});
