import { omit } from 'remeda';

import data from '@/public/data/builds.json';
import { type Build } from '@/types/data';
import { type CharacterKey } from '@/types/good';

export const builds: Record<CharacterKey, Build | Build[]> = omit(data, ['@lastUpdated']) as any;

export const buildsList = Object.values(builds).flat();
