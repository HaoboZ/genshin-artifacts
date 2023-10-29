import { statName } from '@/app/artifacts/artifactData';
import { Breadcrumbs, Chip, Stack, Typography } from '@mui/joy';
import makeArray from '../helpers/makeArray';

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
		<Stack direction='row' alignItems='center' spacing={1}>
			<Typography>{name}:</Typography>
			{breadcrumbs ? (
				<Breadcrumbs sx={{ p: 0 }}>
					{arr.map((subArr, index) => (
						<Stack key={index} direction='row' spacing={0.5}>
							{makeArray(subArr).map((stat, index) => (
								<Chip key={index}>{mapStats ? statName[stat] : stat}</Chip>
							))}
						</Stack>
					))}
				</Breadcrumbs>
			) : (
				<Stack direction='row' spacing={0.5}>
					{makeArray(arr).map((stat: string) => (
						<Chip key={stat}>{mapStats ? statName[stat] : stat}</Chip>
					))}
				</Stack>
			)}
		</Stack>
	);
}
