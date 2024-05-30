import { useCharacters } from '@/api/characters';
import { weeklyInfo, weeklyRequirement } from '@/api/talents';
import FormattedInput from '@/components/formattedInput';
import PageSection from '@/components/page/section';
import pget from '@/src/helpers/pget';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { mainActions } from '@/src/store/reducers/mainReducer';
import { Box, Table } from '@mui/joy';
import Image from 'next/image';
import { filter, flat, groupBy, map, pipe, reduce } from 'remeda';

export default function TalentsWeekly() {
	const dispatch = useAppDispatch();
	const currentMaterials = useAppSelector(pget('main.weekly'));
	const characters = useCharacters({});

	const charactersWeekly = groupBy(characters, pget('weeklyMaterial'));

	return (
		<PageSection title='Weekly Boss Materials'>
			<Table>
				<thead>
					<tr>
						<th style={{ width: 200 }}>Boss</th>
						<th colSpan={3} style={{ width: 300 }}>
							Materials
						</th>
						<th>Wanted</th>
						<th>Owned</th>
						<th>Needs</th>
					</tr>
				</thead>
				<tbody>
					{weeklyInfo.map(({ name, items }) => {
						const wanted = pipe(
							items,
							map(({ name }) => charactersWeekly[name]),
							flat(2),
							filter<any>(Boolean),
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
							<tr key={name}>
								<td>{name}</td>
								{items.map(({ name, image }) => (
									<td key={name}>
										<Box display='flex' flexDirection='column'>
											<Image
												alt={name}
												src={image}
												width={50}
												height={50}
												style={{ alignSelf: 'center' }}
											/>
											<FormattedInput
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
									</td>
								))}
								<td>Wanted: {wanted}</td>
								<td>Owned: {owned}</td>
								<td>Needs: {Math.max(0, wanted - owned)}</td>
							</tr>
						);
					})}
				</tbody>
			</Table>
		</PageSection>
	);
}
