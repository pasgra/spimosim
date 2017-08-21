<?php
//const USE_DARK_THEME = True;
//const USE_DARK_THEME_SWITCH = True;
//const MOVABLE_SECTIONS = False;
const APP_BEFORE_INFO = True;
//const MAX_NODES = 256 * 256;//Set max nodes
const MODEL_IDS = "[ modelName ]";//A list of models
//Load the following scripts
const MODEL_CONFIG_URLS = array('model-config.js');
const PLOT_DISPLAY_URLS = array('plots/plot-displays.js');
const DATA_AGGREGATOR_URLS = array('plots/data-aggregators.js'); 

require('../template/model-app-default.php');
?>
