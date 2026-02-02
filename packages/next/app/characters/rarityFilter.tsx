import { Star as StarIcon } from '@mui/icons-material';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { type Dispatch } from 'react';

const rarities = [
	[5, '#ae8356'],
	[4, '#896ea7'],
	[3, '#5684a0'],
];

export default function RarityFilter({
	rarity,
	setRarity,
	hide3,
}: {
	rarity: number;
	setRarity: Dispatch<number>;
	hide3?: boolean;
}) {
	return (
		<ToggleButtonGroup exclusive value={rarity} onChange={(_, newRarity) => setRarity(newRarity)}>
			<ToggleButton value={0}>All</ToggleButton>
			{rarities.map(([rarity, color]) => {
				if (hide3 && rarity === 3) return null;
				return (
					<ToggleButton key={rarity} value={rarity} sx={{ p: 1 }}>
						<StarIcon fontSize='large' sx={{ color }} />
					</ToggleButton>
				);
			})}
		</ToggleButtonGroup>
	);
}
