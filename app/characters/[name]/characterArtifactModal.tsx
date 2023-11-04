import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import { useModalControls } from '@/src/providers/modal';
import ModalWrapper from '@/src/providers/modal/dialog';
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
import { capitalCase } from 'change-case';
import { Fragment, useMemo, useState } from 'react';
import { map, pipe, reverse, sortBy } from 'remeda';
import ArtifactActions from '../../artifacts/artifactActions';
import ArtifactCard from '../../artifacts/artifactCard';
import getArtifactTier from '../../artifacts/getArtifactTier';
import { charactersInfo } from '../characterData';
import QuadBars from './quadBars';

export default function CharacterArtifactModal({
	tier,
	slot,
	artifact,
}: {
	tier: Tier;
	slot: SlotKey;
	artifact: IArtifact;
}) {
	const artifacts = useAppSelector(pget('good.artifacts'));
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const [checked, setChecked] = useState(false);

	const artifactsSorted = useMemo(() => {
		const mainStat = tier.mainStat[slot] && makeArray(tier.mainStat[slot]);

		const artifactsFiltered = artifacts.filter(({ slotKey, setKey, mainStatKey }) => {
			if (checked) return slotKey === slot && arrDeepIndex(tier.artifact, setKey) === 0;

			return (
				slotKey === slot &&
				(mainStat ? mainStat.includes(mainStatKey) : true) &&
				arrDeepIndex(tier.artifact, setKey) !== -1
			);
		});

		return pipe(
			artifactsFiltered,
			map((artifact) => ({ artifact, ...getArtifactTier(tier, artifact) })),
			sortBy(pget('subStat')),
			sortBy(pget('rating')),
			reverse(),
		);
	}, [artifacts, checked, slot, tier]);

	return (
		<ModalWrapper>
			<ModalDialog minWidth='md'>
				<DialogTitle>
					{capitalCase(slot)} for {charactersInfo[tier.key].name}
				</DialogTitle>
				<ModalClose variant='outlined' />
				{artifact && (
					<Fragment>
						<ArtifactActions cropBox artifact={artifact} />
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
				<Grid container spacing={1} sx={{ overflowY: 'auto' }}>
					{artifactsSorted.map(({ artifact, ...artifactTier }, index) => (
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
								<QuadBars artifactTier={artifactTier as any} />
							</ArtifactCard>
						</Grid>
					))}
				</Grid>
			</ModalDialog>
		</ModalWrapper>
	);
}
