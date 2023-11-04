import AutocompleteField from '@/components/fields/autocomplete';
import InputField from '@/components/fields/input';
import SelectField from '@/components/fields/select';
import type { ArtifactSetKey, IArtifact, SlotKey, StatKey } from '@/src/types/good';
import { Button, Grid, Option } from '@mui/joy';
import { useFormikContext } from 'formik';
import { clamp } from 'remeda';
import {
	artifactSetsInfo,
	artifactSlotInfo,
	artifactSlotOrder,
	statName,
	statsMax,
	subStats,
} from '../artifactData';
import ArtifactImage from '../artifactImage';
import ArtifactScanner from './artifactScanner';

export default function ArtifactForm({ file, cropBox }: { file?: File; cropBox?: boolean }) {
	const { handleSubmit, values, setValues, setFieldValue } = useFormikContext<IArtifact>();

	const artifactSet = artifactSetsInfo[values.setKey];

	return (
		<Grid container spacing={1} my={1}>
			<Grid xs={6}>
				<AutocompleteField
					autoHighlight
					disableClearable
					name='setKey'
					label='Set'
					options={Object.keys(artifactSetsInfo)}
					getOptionLabel={(set) => artifactSetsInfo[set].name}
					onChange={(_, value) => {
						const { rarity } = artifactSetsInfo[value as any as ArtifactSetKey];
						setValues((artifact) => ({ ...artifact, rarity, level: rarity * 4 }));
					}}
				/>
			</Grid>
			<Grid xs={6}>
				<ArtifactScanner cropBox={cropBox} setArtifact={setValues} file={file} />
			</Grid>
			<Grid xs={3}>
				<SelectField
					name='slotKey'
					label='Type'
					onChange={(_, value) => {
						setFieldValue('mainStatKey', artifactSlotInfo[value as any as SlotKey].stats[0]);
					}}>
					{artifactSlotOrder.map((key) => (
						<Option key={key} value={key}>
							{artifactSlotInfo[key].name}
						</Option>
					))}
				</SelectField>
			</Grid>
			<Grid xs={3}>
				<SelectField
					name='mainStatKey'
					label='Main Stat'
					disabled={values.slotKey === 'flower' || values.slotKey === 'plume'}>
					{artifactSlotInfo[values.slotKey].stats.map((key) => (
						<Option key={key} value={key}>
							{statName[key]}
						</Option>
					))}
				</SelectField>
			</Grid>
			<Grid xs={3}>
				<SelectField
					name='rarity'
					label='Rarity'
					onChange={(_, rarity) => {
						setFieldValue('level', (rarity as number) * 4);
					}}>
					{[artifactSet.rarity, artifactSet.rarity - 1].map((rarity) => (
						<Option key={rarity} value={rarity}>
							{rarity}*
						</Option>
					))}
				</SelectField>
			</Grid>
			<Grid xs={3}>
				<InputField
					name='level'
					label='Level'
					type='number'
					onChange={({ target }) => {
						setFieldValue(
							'level',
							clamp(+target.value, { min: 0, max: artifactSet.rarity * 4 }),
						);
					}}
				/>
			</Grid>
			<Grid xs='auto' display='flex' alignItems='center'>
				<ArtifactImage artifact={values} />
			</Grid>
			<Grid xs>
				{[...Array(Math.min(values.substats.length + 1, 4))].map((_, index) => (
					<SelectField
						key={index}
						name={`substats.${index}.key`}
						size='sm'
						placeholder={`SubStat ${index + 1}`}
						onChange={(_, subStat) => {
							const substats = [...values.substats];
							if (!subStat) substats.splice(index, 1);
							else substats[index] = { key: subStat as StatKey, value: 0 };
							setFieldValue('substats', substats);
							return false;
						}}>
						<Option value=''>None</Option>
						{subStats.map((subStat) => (
							<Option key={subStat} value={subStat}>
								{statName[subStat]}
							</Option>
						))}
					</SelectField>
				))}
			</Grid>
			<Grid xs>
				{[...Array(values.substats.length)].map((_, index) => (
					<InputField
						key={index}
						name={`substats.${index}.value`}
						size='sm'
						type='number'
						onChange={({ target }) => {
							const substats = [...values.substats];
							const { key } = values.substats[index];
							substats[index] = {
								key,
								value: clamp(+target.value, { min: 0, max: statsMax[key][values.rarity] }),
							};
							setFieldValue('substats', substats);
							return false;
						}}
					/>
				))}
			</Grid>
			<Grid xs={12}>
				<Button onClick={(e) => handleSubmit(e as any)}>Save</Button>
			</Grid>
		</Grid>
	);
}
