import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import makeArray from '@/src/helpers/makeArray';
import { useModalControls } from '@/src/providers/modal';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Tier } from '@/src/types/data';
import type { IArtifact, SlotKey } from '@/src/types/good';
import {
	DialogTitle,
	FormControl,
	FormLabel,
	Grid,
	ModalClose,
	ModalDialog,
	Switch,
} from '@mui/joy';
import { capitalize, orderBy } from 'lodash';
import { Fragment, useMemo, useState } from 'react';
import ArtifactActions from '../../artifacts/artifactActions';
import ArtifactCard from '../../artifacts/artifactCard';
import getArtifactTier from '../../artifacts/getArtifactTier';
import { charactersInfo } from '../characterData';
import QuadBars from './quadBars';

export default function CharacterArtifactModal(
	{
		tier,
		slot,
		artifact,
	}: {
		tier: Tier;
		slot: SlotKey;
		artifact: IArtifact;
	},
	ref,
) {
	const artifacts = useAppSelector(({ good }) => good.artifacts);
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const [checked, setChecked] = useState(false);

	const artifactsResult = useMemo(() => {
		const mainStat = tier.mainStat[slot] && makeArray(tier.mainStat[slot]);

		const artifactsFiltered = artifacts.filter(({ slotKey, setKey, mainStatKey }) => {
			if (checked) return arrDeepIndex(tier.artifact, setKey) === 0;
			return (
				slotKey === slot &&
				(mainStat ? mainStat.includes(mainStatKey) : true) &&
				arrDeepIndex(tier.artifact, setKey) !== -1
			);
		});

		return orderBy(
			artifactsFiltered.map((artifact) => ({
				artifact,
				artifactTier: getArtifactTier(tier, artifact),
			})),
			['artifactTier.rating', 'artifactTier.subStat'],
			['desc', 'desc'],
		);
	}, [checked]);

	return (
		<ModalDialog ref={ref} minWidth='md'>
			<DialogTitle>
				{capitalize(slot)} for {charactersInfo[tier.key].name}
			</DialogTitle>
			<ModalClose variant='outlined' />
			{artifact && (
				<Fragment>
					<ArtifactActions artifact={artifact} />
					<ArtifactCard hideCharacter artifact={artifact}>
						<QuadBars artifactTier={getArtifactTier(tier, artifact)} />
					</ArtifactCard>
				</Fragment>
			)}
			<FormControl orientation='horizontal'>
				<FormLabel>All in Best Set</FormLabel>
				<Switch
					size='lg'
					sx={{ ml: 0 }}
					checked={checked}
					onChange={({ target }) => setChecked(target.checked)}
				/>
			</FormControl>
			<Grid container spacing={1} sx={{ overflowY: 'scroll' }}>
				{artifactsResult.map(({ artifact, artifactTier }, index) => (
					<Grid key={index} xs={6} md={4}>
						<ArtifactCard
							artifact={artifact}
							sx={{ ':hover': { cursor: 'pointer' } }}
							onClick={() => {
								if (!confirm(`Give this artifact to ${charactersInfo[tier.key].name}?`))
									return;
								dispatch(goodActions.giveArtifact([tier.key, artifact]));
								closeModal();
							}}>
							<QuadBars artifactTier={artifactTier} />
						</ArtifactCard>
					</Grid>
				))}
			</Grid>
		</ModalDialog>
	);
}
