import { useCharacters } from '@/api/characters';
import { talentsInfo } from '@/api/talents';
import Dropdown from '@/components/dropdown';
import PageSection from '@/components/page/section';
import {
	Box,
	Checkbox,
	FormControlLabel,
	MenuItem,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import CharacterImage from '../characters/characterImage';

const farmableDays = ['All', 'Mon/Thu', 'Tue/Fri', 'Wed/Sat'];
const levelFilters = ['All', '<9', '9-10', '10'];

export default function TalentBooks() {
	const characters = useCharacters({});

	const [owned, setOwned] = useState(false);
	const [farmable, setFarmable] = useState(() => {
		const day: number = dayjs().day();
		return (day > 3 ? day - 3 : day) % 4;
	});
	const [lvl, setLvl] = useState(1);

	return (
		<PageSection title='Talent Books'>
			<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
				<FormControlLabel
					control={
						<Checkbox checked={owned} onChange={({ target }) => setOwned(target.checked)} />
					}
					label='Owned'
				/>
				<Dropdown button={`Farmable (${farmableDays[farmable]})`}>
					{farmableDays.map((day, index) => (
						<MenuItem key={day} onClick={() => setFarmable(index)}>
							{day}
						</MenuItem>
					))}
				</Dropdown>
				<Dropdown button={`Levels (${levelFilters[lvl]})`}>
					{levelFilters.map((lvl, index) => (
						<MenuItem key={lvl} onClick={() => setLvl(index)}>
							{lvl}
						</MenuItem>
					))}
				</Dropdown>
			</Stack>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell sx={{ width: 200 }}>Talent</TableCell>
							<TableCell>Characters</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{talentsInfo
							.filter(({ day }) => (farmable ? day === farmable : true))
							.map(({ name, image }) => (
								<TableRow key={name}>
									<TableCell>
										<Box
											sx={{
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
											}}>
											<Image alt={name} src={image} width={50} height={50} />
											{name}
										</Box>
									</TableCell>
									<TableCell>
										<Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
											{characters
												.filter(({ level, talentMaterial, talent }) => {
													if (talentMaterial !== name || (owned && !level))
														return false;
													if (lvl) {
														const minTalent = Math.min(
															talent?.auto ?? 0,
															talent?.skill ?? 0,
															talent?.burst ?? 0,
														);
														switch (lvl) {
															case 1:
																if (minTalent >= 9) return false;
																break;
															case 2:
																if (minTalent !== 9) return false;
																break;
															case 3:
																if (minTalent !== 10) return false;
														}
													}
													return true;
												})
												.map((character) => (
													<Box
														key={character.key}
														component={Link}
														href={`/characters/${character.key}`}
														sx={{ color: 'inherit', textDecoration: 'none', mr: 1 }}>
														<CharacterImage
															character={character}
															size={75}
															sx={{
																border: character.level ? 0 : 2,
																borderColor: 'red',
															}}
														/>
														<Box
															sx={{
																display: 'flex',
																justifyContent: 'space-evenly',
															}}>
															<Typography>{character.talent?.auto ?? 0}</Typography>
															<Typography>{character.talent?.skill ?? 0}</Typography>
															<Typography>{character.talent?.burst ?? 0}</Typography>
														</Box>
													</Box>
												))}
										</Box>
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</TableContainer>
		</PageSection>
	);
}
