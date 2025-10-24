import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import { useAppSelector } from '@/src/store/hooks';
import type { DCharacter } from '@/src/types/data';
import type { ArtifactSetKey, CharacterKey } from '@/src/types/good';
import { useMemo } from 'react';
import { filter, map, pipe, sortBy } from 'remeda';
import { builds } from './builds';
import data from './characters.json';

export const charactersInfo: Record<CharacterKey, DCharacter> = data as any;

export function useCharacters({
	artifactSet,
	owned,
}: {
	artifactSet?: ArtifactSetKey;
	owned?: boolean;
} = {}) {
	const priority = useAppSelector(pget('main.priority'));
	const characters = useAppSelector(pget('good.characters'));

	return useMemo(() => {
		const priorityIndex = Object.values(priority).flat();
		return pipe(
			Object.values(charactersInfo),
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
