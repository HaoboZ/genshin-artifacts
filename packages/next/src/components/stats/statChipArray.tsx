import { statName } from '@/api/stats';
import { Breadcrumbs, Chip, Stack, Typography } from '@mui/material';
import makeArray from '../../helpers/makeArray';

export default function StatChipArray({
	name,
	arr,
	breadcrumbs,
	mapStats,
}: {
	name: string;
	arr: (string | string[])[];
	breadcrumbs?: boolean;
	mapStats?: boolean;
}) {
	return (
		<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
			<Typography>{name}:</Typography>
			{breadcrumbs ? (
				<Breadcrumbs sx={{ p: 0 }}>
					{arr.map((subArr, index) => (
						<Stack key={index} direction='row' spacing={0.5}>
							{makeArray(subArr).map((stat, index) => (
								<Chip key={index} label={mapStats ? statName[stat] : stat} />
							))}
						</Stack>
					))}
				</Breadcrumbs>
			) : (
				<Stack direction='row' spacing={0.5}>
					{makeArray(arr).map((stat: string) => (
						<Chip key={stat} label={mapStats ? statName[stat] : stat} />
					))}
				</Stack>
			)}
		</Stack>
	);
}
