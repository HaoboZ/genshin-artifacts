import CharacterImage from '@/components/images/character';
import { PageLinkComponent } from '@/components/page/link';
import StatChips from '@/components/statChips';
import type { ArtifactSetKey } from '@/src/good';
import makeArray from '@/src/helpers/makeArray';
import { data } from '@/src/resources/data';
import { tier } from '@/src/resources/tier';
import { Stack } from '@mui/material';
import { filter, flatMap, flatMapDeep, sortBy, uniq } from 'lodash';

export default function BestInSlot({ artifactSet }: { artifactSet: ArtifactSetKey }) {
	const characters = filter(tier, ({ artifact }) => makeArray(artifact[0])[0] === artifactSet);

	return (
		<Stack spacing={1}>
			<Stack direction='row' spacing={1}>
				{characters.map(({ key }) => (
					<CharacterImage
						key={key}
						character={data.characters[key]}
						component={PageLinkComponent}
						//@ts-ignore
						href={`characters/${key}`}
					/>
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
