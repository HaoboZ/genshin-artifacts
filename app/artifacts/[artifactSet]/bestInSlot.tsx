import StatChipArray from '@/components/statChipArray';
import type { Tier } from '@/src/types/data';
import type { SlotKey } from '@/src/types/good';
import { Stack } from '@mui/joy';
import { capitalCase } from 'change-case';
import Link from 'next/link';
import { charactersInfo } from '../../characters/characterData';
import CharacterImage from '../../characters/characterImage';
import { statName } from '../artifactData';

export default function BestInSlot({
	characters,
	mainStats,
	subStatArr,
	slot,
}: {
	characters: Tier[];
	mainStats: { [slot: string]: { [stat: string]: number } };
	subStatArr: string[][];
	slot: SlotKey;
}) {
	return (
		<Stack spacing={1}>
			<Stack direction='row' spacing={1}>
				{characters.map(({ key }) => (
					<Link key={key} href={`/characters/${key}`}>
						<CharacterImage character={charactersInfo[key]} size={50} />
					</Link>
				))}
			</Stack>
			{!slot &&
				['sands', 'goblet', 'circlet'].map((slot) => {
					const statsArr = Object.keys(mainStats[slot]).sort();
					if (!statsArr.length) return null;
					return <StatChipArray key={slot} mapStats name={capitalCase(slot)} arr={statsArr} />;
				})}
			{slot && mainStats[slot]?.length && (
				<StatChipArray
					name={capitalCase(slot)}
					arr={Object.entries(mainStats[slot]).map(
						([stat, count]) => `${statName[stat]} x${count}`,
					)}
				/>
			)}
			{Boolean(subStatArr.length) && (
				<StatChipArray mapStats breadcrumbs name='SubStats' arr={subStatArr} />
			)}
		</Stack>
	);
}
