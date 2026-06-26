import { type Build } from '@/types/data';
import { type CharacterKey } from '@/types/good';
import data from '@/public/data/builds.json';

export const builds: Record<CharacterKey, Build | Build[]> = data as any;

export const buildsList = Object.values(builds).flat();
