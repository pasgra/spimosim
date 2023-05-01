spimosimCore.modules.add("creator-lib-info", 'modernizr', {
  link:    'https://modernizr.com/',
  name:    'Modernizr',
  license: '../ext_lib/lib/modernizr/modernizr-custom.js',
  scripts: [
    'ext_lib/lib/modernizr/modernizr-custom.js'
  ],
  folders: [
    'ext_lib/lib/modernizr'
  ],
});

spimosimCore.modules.add("creator-lib-info", 'jszip', {
  link:    'https://stuk.github.io/jszip/',
  name:    'JSZip',
  license: '../ext_lib/lib/jszip/LICENSE.markdown',
  scripts: [
    'ext_lib/lib/jszip/jszip.js'
  ],
  otherFiles: [
    'ext_lib/lib/jszip/LICENSE.markdown'
  ]
});

spimosimCore.modules.add("creator-lib-info", 'dygraph', {
  link:    'http://dygraphs.com/',
  name:    'Dygraph',
  license: '../ext_lib/lib/dygraph/dygraph.min.js',
  scripts: [
    'ext_lib/lib/dygraph/dygraph.min.js'
  ],
  styles: [
    'ext_lib/lib/dygraph/dygraph.min.css'
  ],
  otherFiles: [
    'ext_lib/lib/dygraph/dygraph.min.css.map',
    'ext_lib/lib/dygraph/dygraph.min.js.map'
  ]
});

spimosimCore.modules.add("creator-lib-info", 'gifjs', {
  link:    'https://jnordberg.github.io/gif.js/',
  name:    'gif.js',
  license: '../ext_lib/lib/gif.js/LICENSE',
  scripts: [
    'ext_lib/lib/gif.js/gif.js'
  ],
  folders: [
    'ext_lib/lib/gif.js'
  ],
  otherFiles: [
    'ext_lib/lib/gif.js/LICENSE',
    'ext_lib/lib/gif.js/gif.worker.js'
  ]
});

spimosimCore.modules.add("creator-lib-info", 'visjs', {
  link:    'http://visjs.org/',
  name:    'vis.js',
  license: '../ext_lib/lib/vis.js/vis-network.min.js',
  scripts: [
    'ext_lib/lib/vis.js/vis-network.min.js'
  ],
  otherFiles: [
    'ext_lib/lib/vis.js/vis-network.min.js.map'
  ],
});

spimosimCore.modules.add("creator-lib-info", 'numericjs', {
  link:    'http://www.numericjs.com/',
  name:    'numeric.js',
  license: '../ext_lib/lib/numeric/license.txt',
  scripts: [
    'ext_lib/lib/numeric/numeric-1.2.8-2.min.js'
  ],
  folders: [
    'ext_lib/lib/numeric'
  ],
  otherFiles: [
    'ext_lib/lib/numeric/license.txt',
  ]
});
