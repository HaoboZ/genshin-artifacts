import { Chip, Stack, Typography } from '@mui/material';
import makeArray from '../helpers/makeArray';
import { statName } from '../resources/stats';

export default function StatChips({ name, statArr }: { name: string; statArr: string | string[] }) {
	return (
		<Stack direction='row' spacing={0.5} alignItems='center'>
			<Typography>{name}:</Typography>
			{makeArray(statArr).map((stat) => (
				<Chip key={stat} label={statName[stat]} size='small' />
			))}
		</Stack>
	);
}
