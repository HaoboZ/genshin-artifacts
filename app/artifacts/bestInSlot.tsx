import CharacterImage from '@/components/images/character';
import { PageLinkComponent } from '@/components/page/link';
import type { ArtifactSetKey } from '@/src/good';
import strArrMatch from '@/src/helpers/strArrMatch';
import { data } from '@/src/resources/data';
import { statName } from '@/src/resources/stats';
import { tier } from '@/src/resources/tier';
import { Badge, Chip, Stack, Typography } from '@mui/material';
import { filter, flatMap, flatMapDeep, sortBy, uniq } from 'lodash';

export default function BestInSlot({ artifactSet }: { artifactSet: ArtifactSetKey }) {
	const characters = filter(tier, ({ artifact }) => strArrMatch(artifact[0], artifactSet));
	const sands = sortBy(uniq(flatMap(characters, 'mainStat.sands')));
	const goblet = sortBy(uniq(flatMap(characters, 'mainStat.goblet')));
	const circlet = sortBy(uniq(flatMap(characters, 'mainStat.circlet')));
	const substats = uniq(flatMapDeep(characters, 'subStat'));

	return (
		<Stack spacing={1}>
			<Stack direction='row' spacing={1}>
				{characters.map(({ key, artifact }) => (
					<Badge
						key={key}
						badgeContent={typeof artifact[0] === 'string' ? 0 : artifact[0].length}
						color='primary'>
						<CharacterImage
							character={data.characters[key]}
							component={PageLinkComponent}
							//@ts-ignore
							href={`characters/${key}`}
						/>
					</Badge>
				))}
			</Stack>
			<Stack direction='row' spacing={0.5} alignItems='center'>
				<Typography>Sands:</Typography>
				{sands.map((stat) => (
					<Chip key={stat} label={statName[stat]} size='small' />
				))}
			</Stack>
			<Stack direction='row' spacing={0.5} alignItems='center'>
				<Typography>Goblet:</Typography>
				{goblet.map((stat) => (
					<Chip key={stat} label={statName[stat]} size='small' />
				))}
			</Stack>
			<Stack direction='row' spacing={0.5} alignItems='center'>
				<Typography>Circlet:</Typography>
				{circlet.map((stat) => (
					<Chip key={stat} label={statName[stat]} size='small' />
				))}
			</Stack>
			<Stack direction='row' spacing={0.5} alignItems='center'>
				<Typography>SubStats:</Typography>
				{substats.map((stat) => (
					<Chip key={stat} label={statName[stat]} size='small' />
				))}
			</Stack>
		</Stack>
	);
}
