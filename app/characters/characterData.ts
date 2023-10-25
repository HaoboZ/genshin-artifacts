import data from '@/src/resources/data.json';
import _tier from '@/src/resources/tier.json';
import type { DCharacter, DElement, Tier } from '@/src/types/data';
import type { CharacterKey } from '@/src/types/good';

export const charactersInfo: Record<CharacterKey, DCharacter> = data.characters as any;

// 10/18/23
export const charactersTier: Record<CharacterKey, Tier> = _tier as any;

export const elementsInfo: Record<string, DElement> = data.elements;
