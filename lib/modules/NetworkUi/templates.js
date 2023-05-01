spimosimCore.modules.add("creator-module-templates", "NetworkUi", {
  description: `A NetworkUi module extends a Network module with a user interface. Both modules
must have the same name to tell spimosim that they belong together.

Like a model it can have some user defined parameters. The return value of the
function getVideoSettings configures with Video module is used to show the network.`,
  labelText: "NetworkUi",
  templates: {
    "NetworkUi": {
      object: 'MyNetworkUi',
      template: `/**
 * A NetworkUi module is used to configure the GUI for a Network module of the
 * same name.
 */

var MyNetworkUi = {
  labelText: 'My Network',
  parameters: {
    // what can be set by the user
    myNetworkParameterA: {
      type: 'range',
      labelText: 'My Network Parameter A',
      min: 1,
      value: 16,
      max: 2000,
    },
    //...
  }
};

/*
 * Select and configure the video module based on the modelSettings.
 */
MyNetworkUi.getVideoSettings = function (modelSettings) {
  return {
    type: 'my-video',// the Video module 'my-video' is used to visualize the data
    A: modelSettings.network.myNetworkParameterA,
    someVideoConfigVar: 'foobar'
  }
}

/*
 * Optional: Add some event listeners 
 */
MyNetworkUi.addEventListeners = function (networkUi) {
  // networkUi.domCache.inputsNetworkParameters.myNetworkParameterA.addEventListeners('change', function () {...});
}`
    }
  }
});
