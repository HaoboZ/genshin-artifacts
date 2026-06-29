// Shape of one per-role entry inside `buildOverrides.json`
export type BuildEntry = Partial<ScrapedBuild> & { omit?: true };

export type WeaponGroup = string | string[];
export type ArtifactGroup = string | string[];

export type ScrapedBuild = {
	key: string;
	role: string;
	weapon: WeaponGroup[];
	artifact: ArtifactGroup[];
	mainStat: {
		sands: string | string[];
		goblet: string | string[];
		circlet: string | string[];
	};
	subStat: (string | string[])[];
	group?: number;
	buildIndex?: number;
	overridden?: BuildEntry;
};

// One character's block in `buildOverrides.json`
export type CharacterBuildOverride = Record<string, BuildEntry | number | ScrapedBuild[]> & {
	additional?: ScrapedBuild[];
};
export type BuildOverridesFile = Record<string, CharacterBuildOverride>;

export type DiscoveredRoles = Record<string, Set<string>>;
