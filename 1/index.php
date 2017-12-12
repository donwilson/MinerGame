<?php $version = preg_replace("#[^0-9]+#si", "", getenv("HTTP_HOST")); ?><!doctype html>
<html>
<head>
	<title><?=htmlentities("Game #". $version);?></title>
	<link rel="stylesheet" href="/static/css/reset.css" />
	<link rel="stylesheet" href="/static/css/style.css" />
	<!-- <script type="text/javascript" src="/static/js/phaser-ce-2.9.2.min.js"></script> -->
	<script type="text/javascript" src="/static/js/phaser-ce-2.9.2.js"></script>
</head>
<body>
	
	
	<!-- <script type="text/javascript" src="/static/js/game.js"></script> -->
	<script type="text/javascript">
		<?=file_get_contents(__DIR__ ."/static/js/game.js");?>
	</script>
</body>
</html>