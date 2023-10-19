import _tier from '@/public/tier.json';
import type { Tier } from '../data';
import type { CharacterKey } from '../good';

// 10/18/23
export const tier: Record<CharacterKey, Tier> = _tier as any;
