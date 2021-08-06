spimosimCore.modules.add("creator-module-templates", "ControlsAddOn", {
  labelText: "ControlsAddOn",
  templates: {
    "ControlsAddOn": {
      description: "A ControlsAddOn can be used to create custom settings for your model. The ControlsAddOn " +
        "called 'mycontrolsaddon' will be used if the section controls.mycontrolsaddon " +
        "exists in the model config.",
      object: "MyControlsAddOn",
      template: `/*
 * The config in controls.mycontrolsaddon is passed as the argument
 * config and the instance of Controls as controls.
 */
function MyControlsAddOn(config, controls) {
  // Use EventAttacher if you want to use custom events.
  // spimosimUi.EventAttacher.call(this);
  
  // Initialize 
  spimosimUi.ControlsAddOn.call(this, config, controls, "a-css-class", "A heading text");
}
MyControlsAddOn.prototype = Object.create(spimosimUi.ControlsAddOn.prototype);

/*
 * Return false here if your AddOn does not have a meaningful value at the moment.
 */
MyControlsAddOn.prototype.hasValue = function () {
  return true;
};

/*
 * ! Only called/needed if hasValue() returns true !
 * Return some custom settings that will be passed to the model (usually depending on user input)
 */
MyControlsAddOn.prototype.getValue = function (modelSettings, autoStart) {
  return {
    'A': this.inputs.A.getValue(),
    'B': this.inputs.B.getValue()
  };
};

/*
 * If the value returned by getValue() and/or the model parameters need some
 * processing before passing them to the model use a SettingsPreprocessor.
 * Add it here to active it if your ControlsAddOn is used.
 */
MyControlsAddOn.preprocessorConfig = {
  /*
  mySettingsProprocessor: {
    someConfig: 'a value'
  }
  */
}

/*
 * If your AddOn has a GUI return true.
 */
MyControlsAddOn.prototype.hasGui = function () {
  return true;
};

/* 
 * ! Only called/needed if hasGui() returns true !
 * Will be called at some point to set up the ControlsAddOn UI in memory.
 * You do not need to add anything to the document tree yourself.
 * */
MyControlsAddOn.prototype.initGui = function () {
  this.mainElement = document.createElement("div");
  var quote = document.createElement("q");
  quote.textContent = "Enjoy all the flexibility of HTML and all the comfort of spimosim using ControlsAddOns!";
  this.mainElement.appendChild(quote);

  this.inputs = graphicTools.createSettings({
    A: {
      type: 'text',
      labelText: 'Setting A',
      key: 'a',
      value: ''
    },
    B: {
      type: 'number',
      min: 3,
      max: 5,
      value: 4,
      labelText: 'Setting B',
      key: 'b'
    }
  }, this.mainElement, this.keyMap);
};

/*
 * ! Only called/needed if hasGui() returns true !
 * Will be called after initGui to return the DOM element containing
 * the ControlsAddOn UI. */
MyControlsAddOn.prototype.getMainElement = function () {
  return this.mainElement;
};
`
    }
  }
});
