<?php
if(count(get_included_files()) == 1) exit("Direct access not permitted.");
/**
 * Creates a spimosim application.
 * 
 * Example usage:
 * -----------------------BEGIN FILE: my-model/index.php--------------------------
 * <?php
 * const MOVABLE_SECTIONS = True;
 * const MAX_NODES = 256 * 256;//Set max nodes
 * const MODEL_IDS = array('my-model-id');//A list of models
 * //Load the following scripts
 * const MODEL_CONFIG_URLS = array('my-model-config.js');
 * const PLOT_DISPLAY_URLS = array('plots/plot_displays.js');
 * const DATA_AGGREGATOR_URLS = array('plots/data_aggregators.js'); 
 * ?>
 * -------------------------END FILE: my-model/index.php--------------------------
 * */
const USE_DARK_THEME = True;
const USE_DARK_THEME_SWITCH = True;
const MOVABLE_SECTIONS = True;
const MAX_NODES = 256 * 256;//Set max nodes
const N_VIDEOS = 1;
const APP_BEFORE_INFO = false;
?>
<!doctype html>
<html lang="en-US">
<head>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="../ext_lib/lib/dygraph/dygraph.min.css" />
  <link rel="stylesheet" href="../ext_lib/css/radio-checkbox.css" />
  <link rel="stylesheet" href="../ext_lib/css/sliders.css" />
<?php
if (USE_DARK_THEME or USE_DARK_THEME_SWITCH) {
?>
  <link rel="stylesheet" href="../lib/spimosimUi/css/spimosim.css" />
<?php
}
?>
  <link rel="stylesheet" href="../lib/spimosimUi/css/spimosim-dark.css" />

  <link rel="icon" href="../lib/spimosimUi/icon/favicon.svg" />

  <title>Spin Model Simulation</title>

  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body class="<?php
if (USE_DARK_THEME) {
  echo 'spimosim-dark ';
}
?>has-header-image">
  <h1 id="heading0" class="model-heading"></h1>

  <div class="main<?php if (APP_BEFORE_INFO) { echo " app-before-info"; } ?>">
<?php
function section($id, $hide = false) {
  echo '    <section id="'.$id.'"';
  if ($hide) {
    echo ' style="display:none;"';
  }
  echo '>
';
  echo '    </section>
';
}
section('info0');
section('help0');
section('controls0');
section('video0');
section('plotter0');
section('downloads0');
?>
  </div>
  <footer>
    <div>
      <div class="used-libs">
        Used libraries:
        <ul>
          <li class="used-lib"><a href="http://spimosim.pascalgrafe.net">spimosim</a><a class="lib-license" href="http://spimosim.pascalgrafe.net/LICENSE.md">(License)</a></li>,
          <li class="used-lib"><a href="https://modernizr.com/">Modernizr</a><a class="lib-license" href="../ext_lib/lib/modernizr/modernizr-custom.js">(License)</a></li>,
          <li class="used-lib"><a href="http://dygraphs.com/">Dygraph</a><a class="lib-license" href="../ext_lib/lib/dygraph/dygraph.min.js">(License)</a></li>,
          <li class="used-lib"><a href="https://jnordberg.github.io/gif.js/">gif.js</a><a class="lib-license" href="../ext_lib/lib/gif.js/LICENSE">(License)</a></li>,
          <li class="used-lib"><a href="http://visjs.org/">vis.js</a><a class="lib-license" href="../ext_lib/lib/vis.js/vis-network.min.js">(License)</a></li>,
          <li class="used-lib"><a href="http://www.numericjs.com/">numeric.js</a><a class="lib-license" href="../ext_lib/lib/numeric/license.txt">(License)</a></li>
        </ul>
      </div>
      <div class="author">
        Powered by 
        <a href="http://spimosim.pascalgrafe.net">SpiMoSim</a> by Pascal Grafe
      </div>
    </div>
  </footer>
  <script src="../ext_lib/lib/modernizr/modernizr-custom.js"></script>
  <script src="../ext_lib/lib/dygraph/dygraph.min.js"></script>
  <script src="../ext_lib/lib/gif.js/gif.js"></script>
  <script src="../ext_lib/lib/numeric/numeric-1.2.8-2.min.js"></script>
  <script src="../ext_lib/lib/vis.js/vis-network.min.js"></script>

  <script src="../lib/spimosimCore/polyfill.js"></script>
  <script src="../lib/spimosimCore/tools.js"></script>
  <script src="../lib/spimosimCore/spimosimCore.js"></script>
  <script src="../lib/spimosimCore/protocol-vars.js"></script>
  <script src="../lib/spimosimCore/network-config.js"></script>
  
  <script src="../lib/spimosimUi/polyfill.js"></script>
  <script src="../lib/spimosimUi/graphic-tools.js"></script>
  <script src="../lib/spimosimUi/spimosimUi.js"></script>

<?php
if (null !== MAX_NODES) {
  echo '  <script>spimosimUi.MAX_NODES = '.MAX_NODES.'</script>
';
}
?>
  <script src="../lib/spimosimUi/network-ui-config.js"></script>
  <script src="../lib/spimosimUi/video.js"></script>
  <script src="../lib/spimosimUi/draw-modes.js"></script>
  <script src="../lib/spimosimUi/var-initializers.js"></script>

  <script src="../lib/modelChanger/model-changer.js"></script>
<?php
if (MOVABLE_SECTIONS) {
  echo '  <script src="../lib/movableSections/movable-sections.js"></script>
';
}
?>
  <script src="../template/generateHelpText.js"></script>

<?php
if (USE_DARK_THEME_SWITCH) {
  echo '  <script src="../lib/spimosimUi/darkThemeSwitch.js"></script>
';
}

foreach (array_merge(MODEL_CONFIG_URLS, PLOT_DISPLAY_URLS, DATA_AGGREGATOR_URLS) as $scriptUrl) {
  echo '  <script src="'.$scriptUrl.'"></script>
';
}
?>

  <script>
var modelChanger;
onload = function () {
  if (!modelChanger) {
    modelChanger = new ModelChanger(
      document.getElementById('heading0'),
      <?php echo MODEL_IDS; ?>,
      {
        downloads: document.getElementById('downloads0'),
        info: document.getElementById('info0'),
        help: document.getElementById('help0'),
        plotter: [
          document.getElementById('plotter0'),
        ],
        video: [
        <?php for ($i = 0; $i < N_VIDEOS; $i++) {?>
          document.getElementById('video0'),
        <?php } ?>
        ],
        controls: document.getElementById('controls0')
    });
  }
<?php
if (MOVABLE_SECTIONS) {
?>
    makeSectionsMovable(document.getElementsByClassName('main')[0]);
<?php
}
?>
};
  </script>
</body>
</html>
