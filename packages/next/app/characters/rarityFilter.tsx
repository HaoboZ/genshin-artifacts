import { Star as StarIcon } from '@mui/icons-material';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

const rarities = [
	['5', '#ae8356'],
	['4', '#896ea7'],
	['3', '#5684a0'],
];

export default function RarityFilter({
	rarity,
	setRarity,
	hide3,
}: {
	rarity: string;
	setRarity: (rarity: string) => void;
	hide3?: boolean;
}) {
	return (
		<ToggleButtonGroup
			exclusive
			value={rarity ?? 'none'}
			onChange={(e, newRarity) => setRarity(newRarity === 'none' ? null : newRarity)}>
			<ToggleButton value='none'>All</ToggleButton>
			{rarities.map(([rarity, color]) => {
				if (hide3 && rarity === '3') return null;
				return (
					<ToggleButton key={rarity} value={rarity} sx={{ p: 1 }}>
						<StarIcon fontSize='large' sx={{ color }} />
					</ToggleButton>
				);
			})}
		</ToggleButtonGroup>
	);
}
