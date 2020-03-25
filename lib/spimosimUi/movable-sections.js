/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

function makeSectionsMovable(mainElement) {
  var children = mainElement.children;
  for (var i = 0, len = children.length; i < len; i++) {
    var div = document.createElement('div');
    div.className = 'section-drag-bar';
    children[i].insertBefore(div, children[i].firstChild);
    
    graphicTools.enableDragAndDropMove(div, children[i]);
    
    div.addEventListener('dblclick', function (e) {
      this.parentNode.classList.toggle('whole-width');
      if (typeof(Event) === 'function') {
        window.dispatchEvent(new Event('resize'));
      }
    });
  }
}
