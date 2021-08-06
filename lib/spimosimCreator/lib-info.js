spimosimCore.modules.add("creator-lib-info", 'spimosimCreator', {
  link:    'http://spimosim.pascalgrafe.net',
  name:    'SpiMoSimCreator',
  license: 'http://spimosim.pascalgrafe.net/LICENSE.txt',
  scripts: [
    'lib/spimosimCreator/spimosimCreator.js',
  ],
  styles: [
    'spimosimCreator/creator.css',
  ],
  otherFiles: [
    'spimosimCreator/spimosim-data-flow.dia',
    'spimosimCreator/index.html',
    'spimosimCreator/spimosim-data-flow.svg'
  ]
});
