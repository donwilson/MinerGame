	
	var MinerGame = window.MinerGame || (window.MinerGame = {});
	MinerGame.Data = window.MinerGame.Data || (window.MinerGame.Data = {});
	
	MinerGame.Data.missing_tile_sprite = 41;
	
	MinerGame.Data.tile_types = {
		'air': {
			'type': "tile",
			'sprites': [40],
			'collide': false,
			'properties': {
				'title': "Air",
				'strength': 0
			}
		},
		
		// earth
		'bedrock': {
			'type': "tile",
			'sprites': [360, 361, 362, 363],
			'collide': true,
			'properties': {
				'title': "Bedrock",
				'strength': 0
			}
		},
		'dirt': {
			'type': "tile",
			'sprites': [200, 201, 203, 204, 205, 206, 207],
			'collide': true,
			'properties': {
				'title': "Dirt",
				'strength': 1
			}
		},
		'stone': {
			'type': "tile",
			'sprites': [80, 81, 82, 83, 84, 85, 86, 87],
			'collide': true,
			'properties': {
				'title': "Stone",
				'strength': 3
			}
		},
		'ore': {
			'type': "tile",
			'sprites': [2640, 2641, 2642, 2643],
			'collide': true,
			'properties': {
				'title': "Ore",
				'strength': 5
			}
		},
		'lava': {
			'type': "tile",
			'sprites': [1120, 1121, 1122, 1123],
			'collide': true,
			'properties': {
				'title': "Lava",
				'strength': 0
			}
		},
		
		// tree
		'tree_leaf': {
			'type': "tile",
			'sprites': [1395],
			'collide': false,
			'properties': {
				'title': "Tree Leaf",
				'strength': 1,
				'drops': [
					{'type': "tree_leaf"}
				]
			}
		},
		'tree_trunk': {
			'type': "tile",
			'sprites': [1386, 1387, 1388],
			'collide': false,
			'properties': {
				'title': "Tree Trunk",
				'strength': 3,
				'drops': [
					{'type': "wood", 'quantity': 3}
				]
			}
		},
		'tree_stump': {
			'type': "tile",
			'sprites': [1391],
			'collide': false,
			'properties': {
				'title': "Tree Stump",
				'strength': 3,
				'drops': [
					{'type': "wood", 'quantity': 3}
				]
			}
		},
		'tree_stump_both': {
			'type': "tile",
			'sprites': [1392],
			'collide': false,
			'properties': {
				'title': "Tree Stump Both",
				'strength': 3,
				'drops': [
					{'type': "wood", 'quantity': 3}
				]
			}
		},
		'tree_stump_left': {
			'type': "tile",
			'sprites': [1389],
			'collide': false,
			'properties': {
				'title': "Tree Stump Left",
				'strength': 3,
				'drops': [
					{'type': "wood", 'quantity': 3}
				]
			}
		},
		'tree_stump_right': {
			'type': "tile",
			'sprites': [1390],
			'collide': false,
			'properties': {
				'title': "Tree Stump Right",
				'strength': 3,
				'drops': [
					{'type': "wood", 'quantity': 3}
				]
			}
		},
		'tree_stump_arm_left': {
			'type': "tile",
			'sprites': [1393],
			'collide': false,
			'properties': {
				'title': "Tree Stump Arm Left",
				'strength': 3,
				'drops': [
					{'type': "wood"}
				]
			}
		},
		'tree_stump_arm_right': {
			'type': "tile",
			'sprites': [1394],
			'collide': false,
			'properties': {
				'title': "Tree Stump Arm Right",
				'strength': 3,
				'drops': [
					{'type': "wood"}
				]
			}
		},
		
		
		// ingredients
		'wood': {
			'type': "tile",
			'sprites': [1397],
			'inventory_sprite': 1396,
			'collide': true,
			'properties': {
				'title': "Wood",
				'strength': 3
			}
		},
		
		
		// tools
		'wood_shovel': {
			'type': "tool",
			'sprites': [66],
			'collide': false,
			'properties': {
				'strength': 1,
				'effective_tiles': ['dirt']
			},
			'grip_offset': {
				'x': 7,
				'y': 24
			},
			'angle_offset': 45,
			'angle_resting': 110,
			'angle_max': 20
		},
		'wood_pickaxe': {
			'type': "tool",
			'sprites': [106],
			'collide': false,
			'properties': {
				'strength': 1,
				'effective_tiles': ['stone', 'ore']
			},
			'grip_offset': {
				'x': 7,
				'y': 24
			},
			'angle_offset': 45,
			'angle_resting': 40,
			'angle_max': 110
		},
		'wood_axe': {
			'type': "tool",
			'sprites': [146],
			'collide': false,
			'properties': {
				'strength': 1,
				'effective_tiles': [
					'wood',
					'tree_leaf',
					'tree_trunk',
					'tree_stump',
					'tree_stump_both',
					'tree_stump_left',
					'tree_stump_right',
					'tree_stump_arm_left',
					'tree_stump_arm_right'
				]
			},
			'grip_offset': {
				'x': 7,
				'y': 24
			},
			'angle_offset': 45,
			'angle_resting': 40,
			'angle_max': 110
		}
	};
	