import { artifactSetsInfo, artifactSlotOrder } from '@/api/artifacts';
import { charactersInfo } from '@/api/characters';
import { capitalCase } from 'change-case';
import { flatMap } from 'remeda';
import { Bbox, createScheduler, createWorker } from 'tesseract.js';
import type { ArtifactSetKey, CharacterKey, IArtifact, StatKey } from '../../types/good';
import setupContext from './setupContext';

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

const textAreas: { item: string; area: number[] }[] = [
	{ item: 'mainStat', area: [20, 152, 250, 32] },
	{ item: 'level', area: [33, 314, 54, 25] },
	{ item: 'subStats', area: [20, 360, 450, 230] },
	{ item: 'character', area: [80, -50, 400, 50] },
];

const artifactNames = Object.values(artifactSetsInfo).map<[string, ArtifactSetKey]>(
	({ key, name }) => [name.split(' ').slice(0, 3).join(' ').toLowerCase(), key],
);

function drawBox(context: CanvasRenderingContext2D, box: Bbox) {
	context.strokeRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
}

export default async function findText(canvas: HTMLCanvasElement, newCanvas?: HTMLCanvasElement) {
	const context = setupContext(canvas, newCanvas);

	const artifact: Partial<IArtifact> = {
		setKey: 'GladiatorsFinale',
		slotKey: 'flower',
		level: 0,
		rarity: 5,
		mainStatKey: 'hp',
		substats: [],
	};

	const scheduler = createScheduler();
	try {
		await Promise.all(
			[...Array(4)].map(async () => scheduler.addWorker(await createWorker('eng'))),
		);

		const { data } = await scheduler.addJob(
			'recognize',
			canvas,
			{ rectangle: { left: 20, top: 66, width: 250, height: 50 } },
			{ blocks: true },
		);
		drawBox(context, data.blocks[0].bbox);
		const text = data.text.toLowerCase();
		artifact.slotKey = artifactSlotOrder.find((slot) => text.includes(slot));
		await Promise.all(
			textAreas.map(({ item, area }) =>
				scheduler
					.addJob(
						'recognize',
						canvas,
						{
							rectangle: {
								left: area[0],
								top: area[1] >= 0 ? area[1] : canvas.height + area[1],
								width: area[2],
								height: area[3],
							},
						},
						{ blocks: true },
					)
					.then(({ data }) => {
						context.strokeRect(
							area[0],
							area[1] >= 0 ? area[1] : canvas.height + area[1],
							area[2],
							area[3],
						);
						if (item !== 'subStats') drawBox(context, data.blocks[0].bbox);

						const text = data.text.toLowerCase();
						switch (item) {
							case 'mainStat':
								if (artifact.slotKey === 'flower') artifact.mainStatKey = 'hp';
								else if (artifact.slotKey === 'plume') artifact.mainStatKey = 'atk';
								else
									artifact.mainStatKey =
										mainStatsScan[
											Object.keys(mainStatsScan).find((stat) => text.includes(stat))
										];
								break;
							case 'level':
								artifact.level = +text.match(/\d+/)?.[0] || 0;
								break;
							case 'subStats': {
								const lines = flatMap(data.blocks[0].paragraphs, ({ lines }) =>
									flatMap(lines, ({ text, bbox }) => {
										drawBox(context, bbox);
										return text.toLowerCase();
									}),
								);

								for (const text of lines) {
									const match = text
										.replace(/,/g, '')
										.match(/([a-z]+? ?[a-z]+)\+([0-9.]+)(%?)/);
									if (match) {
										artifact.substats.push({
											key: subStatsScan[
												Object.keys(subStatsScan).find((stat) =>
													match[1].includes(stat),
												)
											][+Boolean(match[3])],
											value: +match[2],
										});
									} else {
										const foundArtifact = artifactNames.find((value) =>
											text.includes(value[0]),
										);
										if (foundArtifact) artifact.setKey = foundArtifact[1];
									}
									if (text.includes('unactivated')) {
										if (!artifact.unactivatedSubstats) artifact.unactivatedSubstats = [];
										artifact.unactivatedSubstats.push(artifact.substats.pop());
									}
								}
								break;
							}
							case 'character': {
								const match = text.match(/equipped: (\w+( \w+)*)/);
								if (match) {
									artifact.location = capitalCase(match[1]) as CharacterKey;
									if (!charactersInfo[artifact.location]) artifact.location = 'Traveler';
								}
								break;
							}
						}
					}),
			),
		);

		return artifact;
	} finally {
		await scheduler.terminate();
	}
}
