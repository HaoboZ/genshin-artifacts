import CharacterImage from '@/components/images/character';
import { PageLinkComponent } from '@/components/page/link';
import StatChips from '@/components/statChips';
import type { ArtifactSetKey } from '@/src/good';
import strArrMatch from '@/src/helpers/strArrMatch';
import { data } from '@/src/resources/data';
import { tier } from '@/src/resources/tier';
import { Badge, Stack } from '@mui/material';
import { filter, flatMap, flatMapDeep, sortBy, uniq } from 'lodash';

export default function BestInSlot({ artifactSet }: { artifactSet: ArtifactSetKey }) {
	const characters = filter(tier, ({ artifact }) => strArrMatch(artifact[0], artifactSet));

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
			<StatChips name='Sands' statArr={sortBy(uniq(flatMap(characters, 'mainStat.sands')))} />
			<StatChips name='Goblet' statArr={sortBy(uniq(flatMap(characters, 'mainStat.goblet')))} />
			<StatChips
				name='Circlet'
				statArr={sortBy(uniq(flatMap(characters, 'mainStat.circlet')))}
			/>
			<StatChips name='SubStats' statArr={uniq(flatMapDeep(characters, 'subStat'))} />
		</Stack>
	);
}
