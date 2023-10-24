import useEventListener from '@/src/hooks/useEventListener';
import type { IArtifact, StatKey } from '@/src/types/good';
import { Button, CircularProgress } from '@mui/joy';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { createWorker, OEM, PSM } from 'tesseract.js';
import { artifactSetsInfo, artifactSlotOrder } from '../artifactData';

const mainStatsScan: Record<string, StatKey> = {
	atk: 'atk_',
	def: 'def_',
	hp: 'hp_',
	critrate: 'critRate_',
	critdmg: 'critDMG_',
	elementalmastery: 'eleMas',
	energyrecharge: 'enerRech_',
	healingbonus: 'heal_',
	physicaldmgbonus: 'physical_dmg_',
	pyrodmgbonus: 'pyro_dmg_',
	hydrodmgbonus: 'hydro_dmg_',
	dendrodmgbonus: 'dendro_dmg_',
	electrodmgbonus: 'electro_dmg_',
	anemodmgbonus: 'anemo_dmg_',
	cryodmgbonus: 'cryo_dmg_',
	geodmgbonus: 'geo_dmg_',
};

const subStatsScan: Record<string, StatKey[]> = {
	atk: ['atk', 'atk_'],
	def: ['def', 'def_'],
	hp: ['hp', 'hp_'],
	critrate: ['critRate_', 'critRate_'],
	critdmg: ['critDMG_', 'critDMG_'],
	elementalmastery: ['eleMas', 'eleMas'],
	energyrecharge: ['enerRech_', 'enerRech_'],
};

function scanFile(file: File, { setProgress, setArtifact }) {
	const image = new Image();
	image.addEventListener('load', async () => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		const { width, height } = image;
		canvas.width = width;
		canvas.height = height;
		ctx.drawImage(image, 0, 0);

		ctx.fillStyle = 'white';
		ctx.fillRect(width * 0.6, 0, width * 0.4, width * 0.7);

		const pixels = ctx.getImageData(0, 0, width, height);
		for (let y = 0; y < pixels.height; ++y) {
			for (let x = 0; x < pixels.width; ++x) {
				const i = (y * pixels.width + x) * 4;
				const count = pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2];
				const color = count > 450 ? 255 : 0;
				pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = color;
			}
		}
		ctx.putImageData(pixels, 0, 0, 0, 0, pixels.width, pixels.height);

		const worker = await createWorker('eng', OEM.LSTM_ONLY, {
			logger: ({ status, progress }) => {
				if (status === 'recognizing text') setProgress(progress);
			},
		});
		await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
		const { data } = await worker.recognize(canvas);
		await worker.terminate();
		setProgress(0);

		const lines = data.lines
			.filter(({ confidence }) => confidence > 10)
			.map(({ text }) => text.toLowerCase());
		const emptyLines = lines.map((line) => line.replaceAll(/\s/g, '').toLowerCase());
		const startLines = lines.slice(0, 5);

		const setKey = Object.keys(artifactSetsInfo).find((set) => {
			const emptySet = set.toLowerCase().replaceAll(/\s/g, '');
			return emptyLines.find((line) => line.includes(emptySet));
		});
		const slotKey = artifactSlotOrder.find((slot) =>
			startLines.find((line) => line.includes(slot)),
		);
		const mainStatKey =
			mainStatsScan[
				Object.keys(mainStatsScan).find((stat) =>
					startLines.find((line) => line.includes(stat)),
				)
			];
		const statLines = emptyLines.filter((line) => /[a-z]\+[0-9]+/.test(line));
		const substats = statLines
			.map((line) => line.replaceAll(',', '.').match(/([a-z]+)\+([0-9.]+)(%?)/))
			.filter(Boolean)
			.map((match) => ({
				key: subStatsScan[match[1]][+Boolean(match[3])],
				value: +match[2],
			}));

		const artifactSet = artifactSetsInfo[setKey as any];
		setArtifact((artifact) => ({
			...artifact,
			setKey,
			slotKey,
			mainStatKey,
			substats,
			rarity: artifactSet?.rarity,
			level: artifactSet?.rarity && artifactSet.rarity * 4,
		}));
	});
	image.src = URL.createObjectURL(file);
}

export default function ArtifactScanner({
	setArtifact,
	file,
}: {
	setArtifact: Dispatch<SetStateAction<IArtifact>>;
	file?: File;
}) {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		if (!file) return;
		scanFile(file, { setProgress, setArtifact });
	}, [file]);

	useEventListener(window, 'paste', ({ clipboardData }: ClipboardEvent) => {
		const item = Array.from(clipboardData.items).find(({ type }) => /^image\//.test(type));
		if (!item) return;
		scanFile(item.getAsFile(), { setProgress, setArtifact });
	});

	return (
		<Button
			component='label'
			loading={Boolean(progress)}
			loadingIndicator={<CircularProgress determinate value={progress * 100} />}>
			Paste or Upload File
			<input
				hidden
				type='file'
				accept='image/*'
				onChange={({ target }) => {
					if (!target.files) return;
					scanFile(target.files[0], { setProgress, setArtifact });
				}}
			/>
		</Button>
	);
}
