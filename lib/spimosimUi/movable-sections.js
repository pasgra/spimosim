/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

function makeSectionsMovable(mainElement) {
  var children = mainElement.children;
  for (var i = 0, len = children.length; i < len; i++) {
    var div = document.createElement('div');
    div.className = 'section-drag-bar';
    children[i].insertBefore(div, children[i].firstChild);
    
    var unpin = document.createElement('button');
    unpin.classList.add('unpin-section');
    unpin.classList.add('icon-button');
    div.appendChild(unpin);
    
    var expand = document.createElement('button');
    expand.classList.add('expand-section');
    expand.classList.add('icon-button');
    div.appendChild(expand);
    
    graphicTools.enableDragAndDropMove(div, children[i]);
    
    
    div.addEventListener('mousedown', function (e) {
      if (this.parentNode.classList.contains('spimosim-floating')) {
        this.parentNode.style.zIndex = ++makeSectionsMovable.lastZIndex;
      }
    });
  
    expand.addEventListener('click', function (e) {
      this.parentNode.parentNode.classList.toggle('whole-width');
      if (typeof(Event) === 'function') {
        window.dispatchEvent(new Event('resize'));
      }
    });
  
    unpin.addEventListener('click', function (e) {
      var section = this.parentNode.parentNode;
      if (section.classList.contains('spimosim-floating')) {
        section.style.left = null;
        section.style.top = null;
        section.style.zIndex = null;
      	section.classList.remove('spimosim-floating');
      } else {
        var left = section.getBoundingClientRect().left + window.scrollX + 25;
        var top = section.getBoundingClientRect().top + window.scrollY + 25;
        section.style.left = left + "px";
        section.style.top = top + "px";
        section.style.zIndex = ++makeSectionsMovable.lastZIndex;
        section.classList.add("spimosim-floating");
      }
      
      if (typeof(Event) === 'function') {
        window.dispatchEvent(new Event('resize'));
      }
    });
  }
}
makeSectionsMovable.lastZIndex = 30;
