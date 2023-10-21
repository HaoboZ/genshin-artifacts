import type { Tier } from '../types/data';
import type { CharacterKey } from '../types/good';
import _tier from './tier.json';

// 10/18/23
export const tier: Record<CharacterKey, Tier> = _tier as any;
