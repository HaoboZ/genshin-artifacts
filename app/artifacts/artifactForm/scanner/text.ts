import { artifactSetsInfo, artifactSlotOrder } from '@/api/artifacts';
import { charactersInfo } from '@/api/characters';
import type { ArtifactSetKey, CharacterKey, IArtifact, StatKey } from '@/src/types/good';
import { capitalCase } from 'change-case';
import { createWorker, OEM, PSM } from 'tesseract.js';

const mainStatsScan: Record<string, StatKey> = {
	'atk': 'atk_',
	'def': 'def_',
	'hp': 'hp_',
	'crit rate': 'critRate_',
	'crit dmg': 'critDMG_',
	'elemental mastery': 'eleMas',
	'energy recharge': 'enerRech_',
	'healing bonus': 'heal_',
	'physical dmg bonus': 'physical_dmg_',
	'pyro dmg bonus': 'pyro_dmg_',
	'hydro dmg bonus': 'hydro_dmg_',
	'dendro dmg bonus': 'dendro_dmg_',
	'electro dmg bonus': 'electro_dmg_',
	'anemo dmg bonus': 'anemo_dmg_',
	'cryo dmg bonus': 'cryo_dmg_',
	'geo dmg bonus': 'geo_dmg_',
};

const subStatsScan: Record<string, StatKey[]> = {
	'atk': ['atk', 'atk_'],
	'def': ['def', 'def_'],
	'hp': ['hp', 'hp_'],
	'crit rate': ['critRate_', 'critRate_'],
	'crit dmg': ['critDMG_', 'critDMG_'],
	'elemental mastery': ['eleMas', 'eleMas'],
	'energy recharge': ['enerRech_', 'enerRech_'],
};

const textAreas = {
	slot: [0, 0.12, 0.5, 0.09],
	mainStat: [0, 0.3, 0.5, 0.065],
	level: [0.065, 0.63, 0.11, 0.053],
	subStat1: [0.04, 0.719, 0.9, 0.079],
	subStat2: [0.04, 0.798, 0.9, 0.079],
	subStat3: [0.04, 0.877, 0.9, 0.079],
	subStat4: [0.04, 0.956, 0.9, 0.079],
	subStat5: [0.04, 1.035, 0.9, 0.079],
	character: [0.158, -0.109, 0.842, 0.1],
};

const artifactNames = Object.values(artifactSetsInfo).map<[string, ArtifactSetKey]>(
	({ key, name }) => [name.split(' ').slice(0, 3).join(' ').toLowerCase(), key],
);

export default async function text(canvas: HTMLCanvasElement, setProgress?) {
	const worker = await createWorker('eng', OEM.DEFAULT);
	await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_LINE });

	// @ts-ignore
	const artifact: IArtifact = {
		setKey: 'GladiatorsFinale',
		slotKey: 'flower',
		level: 0,
		rarity: 5,
		mainStatKey: 'hp',
		location: '',
		substats: [],
	};

	const scale = canvas.width;
	for (const key in textAreas) {
		const rect = textAreas[key];
		const { data } = await worker.recognize(canvas, {
			rectangle: {
				left: rect[0] * scale,
				top: rect[1] >= 0 ? rect[1] * scale : canvas.height + rect[1] * scale,
				width: rect[2] * scale,
				height: rect[3] * scale,
			},
		});

		const ctx = canvas.getContext('2d');
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = 1;
		ctx.strokeRect(
			rect[0] * scale,
			rect[1] >= 0 ? rect[1] * scale : canvas.height + rect[1] * scale,
			rect[2] * scale,
			rect[3] * scale,
		);

		const text = data.text.toLowerCase();
		switch (key) {
			case 'slot':
				artifact.slotKey = artifactSlotOrder.find((slot) => text.includes(slot));
				break;
			case 'mainStat':
				if (artifact.slotKey === 'flower') artifact.mainStatKey = 'hp';
				else if (artifact.slotKey === 'plume') artifact.mainStatKey = 'atk';
				else
					artifact.mainStatKey =
						mainStatsScan[Object.keys(mainStatsScan).find((stat) => text.includes(stat))];
				break;
			case 'level':
				artifact.level = +text.match(/\d+/)?.[0] || 0;
				break;
			case 'character': {
				const match = text.match(/equipped: (\w+( \w+)*)/);
				if (match) {
					artifact.location = capitalCase(match[1]) as CharacterKey;
					if (!charactersInfo[artifact.location]) artifact.location = 'Traveler';
				}
				break;
			}
			default: {
				const match = text.match(/([a-z]+? ?[a-z]+)\+([0-9.]+)(%?)/);
				if (match) {
					artifact.substats.push({
						key: subStatsScan[
							Object.keys(subStatsScan).find((stat) => match[1].includes(stat))
						][+Boolean(match[3])],
						value: +match[2],
					});
				} else {
					const found = artifactNames.find((value) => text.includes(value[0]));
					if (found) artifact.setKey = found[1];
				}
				break;
			}
		}
		setProgress?.((progress) => progress + 1);
	}

	await worker.terminate();
	return artifact;
}
