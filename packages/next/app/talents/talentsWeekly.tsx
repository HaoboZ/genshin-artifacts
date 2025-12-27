'use client';
import { useCharacters } from '@/api/characters';
import { weeklyInfo, weeklyRequirement } from '@/api/talents';
import NumberSpinner from '@/components/numberSpinner';
import PageSection from '@/components/page/pageSection';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
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
import { filter, flat, groupBy, map, pipe, prop, sumBy } from 'remeda';

export default function TalentsWeekly() {
	const dispatch = useAppDispatch();
	const currentMaterials = useAppSelector(prop('good', 'materials'));
	const characters = useCharacters();

	const charactersWeekly = groupBy(characters, prop('weeklyMaterial'));

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
								map(({ key }) => charactersWeekly[key]),
								flat(2),
								filter(Boolean),
								sumBy(
									({ talent }) =>
										weeklyRequirement[talent?.auto] +
										weeklyRequirement[talent?.skill] +
										weeklyRequirement[talent?.burst],
								),
							);
							const owned = sumBy(items, ({ key }) => currentMaterials[key] ?? 0);

							return (
								<TableRow key={name}>
									<TableCell>{name}</TableCell>
									{items.map(({ key, name, image }) => (
										<TableCell key={key}>
											<Box sx={{ display: 'flex', flexDirection: 'column' }}>
												<Image
													alt={name}
													src={image}
													width={50}
													height={50}
													style={{ alignSelf: 'center' }}
												/>
												<NumberSpinner
													size='small'
													min={0}
													value={currentMaterials[key] ?? 0}
													onValueChange={(amount) => {
														dispatch(goodActions.setWeeklyMaterial({ key, amount }));
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
