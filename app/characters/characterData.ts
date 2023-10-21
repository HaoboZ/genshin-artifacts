import data from '@/src/resources/data.json';
import type { DCharacter } from '@/src/types/data';
import type { CharacterKey } from '@/src/types/good';

export const charactersInfo: Record<CharacterKey, DCharacter> = data.characters as any;
