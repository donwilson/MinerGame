	
	var playable_characters = {
		'man': {
			'spritesheet': "players",
			'default_frame': 0,
			'animations': {
				'stand_left': [9],
				'run_left': [10, 11],
				'stand_right': [18],
				'run_right': [19, 20]
			},
			'reach': 5
		},
		'woman': {
			'spritesheet': "players",
			'default_frame': 3,
			'animations': {
				'stand_left': [12],
				'run_left': [13, 14],
				'stand_right': [21],
				'run_right': [22, 23]
			},
			'reach': 5
		},
		'alien': {
			'spritesheet': "players",
			'default_frame': 6,
			'animations': {
				'stand_left': [15],
				'run_left': [16, 17],
				'stand_right': [24],
				'run_right': [25, 26]
			},
			'reach': 5
		}
	};
	
	var playable_character_keys = ["man", "woman", "alien"];
	