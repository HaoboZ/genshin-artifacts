import { statName } from '@/app/artifacts/artifactData';
import { Breadcrumbs, Chip, Stack, Typography } from '@mui/joy';
import makeArray from '../helpers/makeArray';

export default function ChipArray({
	name,
	arr,
	breadcrumbs,
}: {
	name: string;
	arr: (string | string[])[];
	breadcrumbs?: boolean;
}) {
	return (
		<Stack direction='row' alignItems='center' spacing={1}>
			<Typography>{name}:</Typography>
			{breadcrumbs ? (
				<Breadcrumbs sx={{ p: 0 }}>
					{arr.map((subArr, index) => (
						<Stack key={index} direction='row' spacing={0.5}>
							{makeArray(subArr).map((stat, index) => (
								<Chip key={index}>{statName[stat]}</Chip>
							))}
						</Stack>
					))}
				</Breadcrumbs>
			) : (
				<Stack direction='row' spacing={0.5}>
					{makeArray(arr).map((stat: string) => (
						<Chip key={stat}>{statName[stat]}</Chip>
					))}
				</Stack>
			)}
		</Stack>
	);
}
