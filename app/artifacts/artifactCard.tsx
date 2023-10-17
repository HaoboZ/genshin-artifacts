import Image from '@/components/image';
import PercentBar from '@/components/percentBar';
import data from '@/public/data.json';
import type { IArtifact, StatKey } from '@/src/good';
import { Box, Paper, Typography } from '@mui/material';
import { stats } from '../stats';

const statName: Record<StatKey, string> = {
	anemo_dmg_: 'Anemo%',
	atk: 'ATK%',
	atk_: 'ATK',
	critDMG_: 'CritDMG',
	critRate_: 'CritRate',
	cryo_dmg_: 'Cryo%',
	def: 'DEF',
	def_: 'DEF%',
	dendro_dmg_: 'Dendro%',
	eleMas: 'EM',
	electro_dmg_: 'Electro%',
	enerRech_: 'ER%',
	geo_dmg_: 'Geo%',
	heal_: 'Healing%',
	hp: 'HP',
	hp_: 'HP%',
	hydro_dmg_: 'Hydro%',
	physical_dmg_: 'Phys%',
	pyro_dmg_: 'Pyro%',
};

export default function ArtifactCard({ artifact }: { artifact: IArtifact }) {
	const character = data.characters[artifact.location];

	return (
		<Paper sx={{ position: 'relative', display: 'flex', width: 180, p: 1 }}>
			<Image
				alt={artifact.setKey}
				src={data.artifacts[artifact.setKey][artifact.slotKey]}
				width={90}
				height={90}
				className={`rarity${artifact.rarity}`}
			/>
			{character && (
				<Image
					alt={character.name}
					src={character.image}
					width={30}
					height={30}
					sx={{ position: 'absolute', left: 60, top: 60 }}
				/>
			)}
			<Box width='100%' ml={1}>
				<Typography>{statName[artifact.mainStatKey]}</Typography>
				{artifact.substats.map((substat) => (
					<PercentBar
						key={substat.key}
						vals={[
							{
								max: stats[substat.key][artifact.rarity],
								current: substat.value,
							},
						]}>
						{statName[substat.key]}
					</PercentBar>
				))}
			</Box>
		</Paper>
	);
}
