import makeArray from '@/helpers/makeArray';
import data from '@/public/data/characters.json';
import { useAppSelector } from '@/store/hooks';
import { type DCharacter } from '@/types/data';
import { type ArtifactSetKey, type CharacterKey } from '@/types/good';
import { useMemo } from 'react';
import { filter, map, pipe, prop, sortBy, values } from 'remeda';
import { builds } from './builds';

export const charactersInfo: Record<CharacterKey, DCharacter> = data as any;

export function useCharacters({
	artifactSet,
	owned,
}: {
	artifactSet?: ArtifactSetKey;
	owned?: boolean;
} = {}) {
	const priority = useAppSelector(prop('main', 'priority'));
	const characters = useAppSelector(prop('good', 'characters'));

	return useMemo(() => {
		const priorityIndex = Object.values(priority).flat();
		return pipe(
			charactersInfo,
			values(),
			map((character) => ({
				...character,
				...characters.find(({ key }) => character.key === key),
				...builds[character.key],
			})),
			filter(
				(character) =>
					(owned ? character.level : true) &&
					(!artifactSet || makeArray(character.artifact[0])[0] === artifactSet),
			),
			sortBy([({ level }) => Boolean(level), 'desc'], ({ key }) => {
				const index = priorityIndex.indexOf(key);
				return index === -1 ? Infinity : index;
			}),
		);
	}, [priority, characters, owned, artifactSet]);
}
