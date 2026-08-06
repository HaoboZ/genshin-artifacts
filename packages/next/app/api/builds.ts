import { type Build } from '@/types/data';
import { type CharacterKey } from '@/types/good';
import data from '@/public/data/builds.json';
import { omit } from 'remeda';

export const builds: Record<CharacterKey, Build | Build[]> = omit(data, ['@lastUpdated']) as any;

export const buildsList = Object.values(builds).flat();
