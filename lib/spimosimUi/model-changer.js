/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

var spimosimDbg;

function ModelChanger(heading, modelIds, sections) {
  this.initializer = new spimosimUi.Initializer(sections);
  spimosimDbg = this.initializer;
  
  this.modelConfigs = [];
  for (var i = 0, len = modelIds.length; i < len; i++) {
    var config = spimosimCore.modules.get('ModelConfig', modelIds[i]);
    if (config.info.compactName === undefined) {
      config.info.compactName = modelIds[i];
    }
    this.modelConfigs.push(config);
  }

  this.modelNo = 0;

  this.severalModels = this.modelConfigs.length > 1;
  if (this.severalModels) {
    var modelName = graphicTools.getUriFragmentQuery('model');
    if (modelName) {
      for (var i = 0, len = this.modelConfigs.length; i < len; i++) {
        if (this.modelConfigs[i].info.compactName === modelName) {
          this.modelNo = i;
          break;
        }
      }
    }
  }

  this.initGUI(heading);

  this.changeModel(this.modelConfigs[this.modelNo]);
}

ModelChanger.prototype.initGUI = function (heading) {
  function cE(type) {
    return document.createElement(type);
  }

  if (this.severalModels) {
    var buttonPrevModel = cE('button');
    buttonPrevModel.textContent = '<';
    buttonPrevModel.className = 'prev-model';
    heading.appendChild(buttonPrevModel);
  }

  var spanHeadingContainer = cE('span');
  spanHeadingContainer.className = 'heading-container';

  var spanCurrentHeading = cE('span');
  spanCurrentHeading.className = 'current-heading-span';
  //spanCurrentHeading.style.animationIterationCount = 1;

  var buttonHeading = cE('a');
  buttonHeading.className = 'heading-button';
  spanCurrentHeading.appendChild(buttonHeading);

  spanHeadingContainer.appendChild(spanCurrentHeading);

  var spanPreviousHeading = cE('span');
  spanPreviousHeading.className = 'previous-heading-span';
  //spanPreviousHeading.style.animationIterationCount = 1;

  spanHeadingContainer.appendChild(spanPreviousHeading);

  heading.appendChild(spanHeadingContainer);

  if (this.severalModels) {
    spanHeadingContainer.classList.add('multi-model-heading');
    var buttonNextModel = cE('button');
    buttonNextModel.textContent = '>';
    buttonNextModel.className = 'next-model';
    heading.appendChild(buttonNextModel);
    
    var modelChanger = this;
    buttonPrevModel.addEventListener('click', function () {
      modelChanger.nextModel(true);
    });
    buttonNextModel.addEventListener('click', function () {
      modelChanger.nextModel();
    });
  }

  var modelChanger = this;
  buttonHeading.addEventListener('click', function () {
    var modelInfo = modelChanger.initializer.modelInfo,
      help = modelChanger.initializer.help;

    if (modelInfo && help) {
      if (help.isShown() && modelInfo.isShown()) {
        modelInfo.hide();
        help.hide();
      } else {
        modelInfo.show();
        help.show();
      }
    } else if (modelInfo) {
      if (modelInfo.isShown()) {
        modelInfo.hide();
      } else {
        modelInfo.show();
      }
    } else if (help) {
      if (help.isShown()) {
        help.hide();
      } else {
        help.show();
      }
    }
  });

  this.domCache = {
    buttonHeading: buttonHeading,
    spanHeadingContainer: spanHeadingContainer,
    spanPreviousHeading: spanPreviousHeading,
    spanCurrentHeading: spanCurrentHeading,
  };
}

ModelChanger.prototype.nextModel = function (reverseDirection) {
  var spanHeadingContainer = this.domCache.spanHeadingContainer,
    spanCurrentHeading = this.domCache.spanCurrentHeading,
    spanPreviousHeading = this.domCache.spanPreviousHeading;

  var len = this.modelConfigs.length;
  if (reverseDirection) {
    spanHeadingContainer.appendChild(spanCurrentHeading);
    spanHeadingContainer.appendChild(spanPreviousHeading);
    spanHeadingContainer.appendChild(spanCurrentHeading);
    spanHeadingContainer.appendChild(spanPreviousHeading);

    this.modelNo = (this.modelNo + len - 1) % len;
  } else {
    spanHeadingContainer.appendChild(spanPreviousHeading);
    spanHeadingContainer.appendChild(spanCurrentHeading);
    spanHeadingContainer.appendChild(spanPreviousHeading);
    spanHeadingContainer.appendChild(spanCurrentHeading);

    this.modelNo = (this.modelNo + 1) % len;
  }

  this.changeModel(this.modelConfigs[this.modelNo]);
};

ModelChanger.prototype.changeModel = function (modelConfig) {
  document.title = modelConfig.info.title;

  if (this.severalModels) {
    graphicTools.setUriFragmentQuery('model', modelConfig.info.compactName);
  }

  var buttonHeading = this.domCache.buttonHeading,
    spanCurrentHeading = this.domCache.spanCurrentHeading,
    spanPreviousHeading = this.domCache.spanPreviousHeading;

  var previousHeadingText = buttonHeading.textContent;
  if (previousHeadingText === '') {
      spanCurrentHeading.style.animationDuration = '0s';
  } else {
    spanCurrentHeading.style.animationDuration = '';
    spanPreviousHeading.textContent = previousHeadingText;
  }

  buttonHeading.textContent = modelConfig.info.title;

  this.initializer.changeModel(modelConfig);
}
