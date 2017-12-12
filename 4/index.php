<?php $version = preg_replace("#[^0-9]+#si", "", getenv("HTTP_HOST")); ?><!doctype html>
<html>
<head>
	<title><?=htmlentities("Game #". $version);?></title>
	<link rel="stylesheet" href="/static/css/reset.css" />
	<link rel="stylesheet" href="/static/css/style.css" />
	
	<script type="text/javascript" src="/static/js/lib/underscore-1.8.3.min.js"></script>
	<script type="text/javascript" src="/static/js/lib/phaser-ce-2.9.2.js"></script>
	
	<!-- <script type="text/javascript" src="/static/js/lib/phaser-plugins/advancedTiming.js"></script> -->
</head>
<body>
	<script type="text/javascript" src="/static/js/game/init.js"></script>
	
	<script type="text/javascript" src="/static/js/game/data/characters.js"></script>
	<script type="text/javascript" src="/static/js/game/data/tile_types.js"></script>
	
	<script type="text/javascript" src="/static/js/game/entity/WorldEntity.js"></script>
	<script type="text/javascript" src="/static/js/game/entity/TileEntity.js"></script>
	
	<script type="text/javascript" src="/static/js/game/state/BootState.js"></script>
	<script type="text/javascript" src="/static/js/game/state/PreloaderState.js"></script>
	<script type="text/javascript" src="/static/js/game/state/MainMenuState.js"></script>
	<script type="text/javascript" src="/static/js/game/state/GameState.js"></script>
	
	<script type="text/javascript" src="/static/js/game/start.js"></script>
</body>
</html>