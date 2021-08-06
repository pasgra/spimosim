spimosimCore.modules.add("creator-module-templates", "VarInitializer", {
  labelText: "VarInitializer",
  description: `A VarInitializer module can be used to get more flexibility when
setting the initial state of state variables in spimosim.`,
  templates: {
    "VarInitializer": {
      object: 'MyVarInitializer',
      template: `
function MyVarInitializer(config, controls, varName) {
  spimosimUi.VarInitializer.call(this, config, controls, varName);
}
MyVarInitializer.prototype = Object.create(spimosimUi.VarInitializer.prototype);

/*
 * Return false here if your VarInitializer does not have a meaningful value at the moment.
 */
MyVarInitializer.prototype.hasValue = function () {
  return true;
};

/*
 * ! Only called/needed if hasValue() returns true !
 * Return some custom settings that will be passed to the model (usually depending on user input)
 */
MyVarInitializer.prototype.getValue = function (modelSettings, autoStart) {
  return [
    // some initial value
  ];
};


/*
 * If your VarInitializer has a GUI return true.
 */
MyVarInitializer.prototype.hasGui = function () {
  return true;
};

/* 
 * ! Only called/needed if hasGui() returns true !
 * Will be called at some point to set up the VarInitializer UI in memory.
 * You do not need to add anything to the document tree yourself.
 * */
MyVarInitializer.prototype.initGui = function () {
  this.mainElement = document.createElement("div");
  var quote = document.createElement("q");
  quote.textContent = "Enjoy all the flexibility of HTML and all the comfort of spimosim using ControlsAddOns!";
  this.mainElement.appendChild(quote);

  this.inputs = graphicTools.createSettings({
    A: {
      type: 'text',
      labelText: 'Setting A',
      key: 'a'
    },
    B: {
      type: 'number',
      min: 3,
      max: 5,
      labelText: 'Setting B',
      key: 'b'
    }
  }, this.mainElement, this.keyMap);
};

/*
 * ! Only called/needed if hasGui() returns true !
 * Will be called after initGui to return the DOM element containing
 * the VarInitializer UI. */
MyVarInitializer.prototype.getMainElement = function () {
  return this.mainElement;
};

MyVarInitializer.prototype.addToKeyMap = function () {
}

MyVarInitializer.protocolVarType = 'MyProtocolVar'; // A module of type 'ProtocolVar' with this name must exist
`
    }
  }
});
