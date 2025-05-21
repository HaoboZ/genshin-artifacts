import { useCharacters } from '@/api/characters';
import { weeklyInfo, weeklyRequirement } from '@/api/talents';
import FormattedTextField from '@/components/formattedTextField';
import PageSection from '@/components/page/section';
import pget from '@/src/helpers/pget';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { mainActions } from '@/src/store/reducers/mainReducer';
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';
import Image from 'next/image';
import { filter, flat, groupBy, map, pipe, reduce } from 'remeda';

export default function TalentsWeekly() {
	const dispatch = useAppDispatch();
	const currentMaterials = useAppSelector(pget('main.weekly'));
	const characters = useCharacters();

	const charactersWeekly = groupBy(characters, pget('weeklyMaterial'));

	return (
		<PageSection title='Weekly Boss Materials'>
			<TableContainer>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell sx={{ width: 200 }}>Boss</TableCell>
							<TableCell colSpan={3} sx={{ width: 300 }}>
								Materials
							</TableCell>
							<TableCell sx={{ width: 200 }}>Wanted</TableCell>
							<TableCell sx={{ width: 200 }}>Owned</TableCell>
							<TableCell sx={{ width: 200 }}>Needs</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{weeklyInfo.map(({ name, items }) => {
							const wanted = pipe(
								items,
								map(({ name }) => charactersWeekly[name]),
								flat(2),
								filter(Boolean),
								reduce(
									(total, { talent }) =>
										total +
										weeklyRequirement[talent?.auto] +
										weeklyRequirement[talent?.skill] +
										weeklyRequirement[talent?.burst],
									0,
								),
							);
							const owned = items.reduce(
								(total, { name }) => total + (currentMaterials[name] ?? 0),
								0,
							);

							return (
								<TableRow key={name}>
									<TableCell>{name}</TableCell>
									{items.map(({ name, image }) => (
										<TableCell key={name}>
											<Box sx={{ display: 'flex', flexDirection: 'column' }}>
												<Image
													alt={name}
													src={image}
													width={50}
													height={50}
													style={{ alignSelf: 'center' }}
												/>
												<FormattedTextField
													value={currentMaterials[name] ?? 0}
													onChange={({ target }) => {
														dispatch(
															mainActions.setWeeklyMaterial({
																name,
																amount: +target.value,
															}),
														);
													}}
												/>
											</Box>
										</TableCell>
									))}
									<TableCell>Wanted: {wanted}</TableCell>
									<TableCell>Owned: {owned}</TableCell>
									<TableCell>Needs: {Math.max(0, wanted - owned)}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>
		</PageSection>
	);
}
