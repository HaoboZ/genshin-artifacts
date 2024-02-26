'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import useEventListener from '@/src/hooks/useEventListener';
import useParamState from '@/src/hooks/useParamState';
import { useModal } from '@/src/providers/modal';
import { useAppSelector } from '@/src/store/hooks';
import type { Tier } from '@/src/types/data';
import type { ArtifactSetKey, SlotKey, StatKey } from '@/src/types/good';
import { useMemo } from 'react';
import { filter, groupBy, map, pipe, reduce, sortBy, take } from 'remeda';
import { charactersTier } from '../../characters/characterData';
import { missingArtifactSets } from '../artifactData';
import AddArtifactModal from '../artifactForm/addArtifactModal';
import ArtifactSetFilter from '../artifactSetFilter';
import ArtifactList from './artifactList';
import BestInSlot from './bestInSlot';
import SlotFilter from './slotFilter';

export default function ArtifactSet({ params }: { params: { artifactSet: ArtifactSetKey } }) {
	const { modalStates, showModal } = useModal();
	const priority = useAppSelector(pget('main.priority'));

	const [slot, setSlot] = useParamState<SlotKey>('slot', null);

	useEventListener(
		typeof window !== 'undefined' ? window : null,
		'paste',
		({ clipboardData }: ClipboardEvent) => {
			if (modalStates.length) return;
			const item = Array.from(clipboardData.items).find(({ type }) => /^image\//.test(type));
			if (!item) return;
			showModal(AddArtifactModal, {
				props: { setKey: params.artifactSet, file: item.getAsFile() },
			});
		},
	);

	const [characters, charactersSets] = useMemo(() => {
		const priorityIndex = Object.values(priority).flat();

		const characters = pipe(
			charactersTier,
			Object.values<Tier>,
			filter(({ artifact }) => makeArray(artifact[0])[0] === params.artifactSet),
			sortBy(({ key }) => {
				const index = priorityIndex.indexOf(key);
				return index === -1 ? Infinity : index;
			}),
		);
		return [
			characters,
			characters.length ? characters : [missingArtifactSets[params.artifactSet]].filter(Boolean),
		];
	}, [params.artifactSet, priority]);

	const mainStats = useMemo(
		() =>
			charactersSets.reduce(
				(acc, tier) => {
					const sandStat = makeArray(tier.mainStat.sands)[0];
					for (const stat of makeArray(sandStat)) {
						acc.sands[stat] = (acc.sands[stat] ?? 0) + 1;
					}
					const gobletStat = makeArray(tier.mainStat.goblet)[0];
					for (const stat of makeArray(gobletStat)) {
						acc.goblet[stat] = (acc.goblet[stat] ?? 0) + 1;
					}
					const circletStat = makeArray(tier.mainStat.circlet)[0];
					for (const stat of makeArray(circletStat)) {
						acc.circlet[stat] = (acc.circlet[stat] ?? 0) + 1;
					}
					return acc;
				},
				{ sands: {}, goblet: {}, circlet: {} },
			),
		[charactersSets],
	);

	const subStatArr = useMemo(
		() =>
			pipe(
				charactersSets,
				reduce(
					(res, { subStat }) => {
						subStat.forEach((statArr, index) =>
							makeArray(statArr).forEach((stat) => {
								if (!(stat in res) || res[stat] > index) res[stat] = index;
							}),
						);
						return res;
					},
					{} as Record<StatKey, number>,
				),
				Object.entries<number>,
				groupBy(pget('1')),
				Object.values<[string, number][]>,
				map((stat) => stat.flatMap(pget('0'))),
				take(3),
			),
		[charactersSets],
	);

	return (
		<PageContainer noSsr>
			<PageTitle>Artifacts</PageTitle>
			<ArtifactSetFilter artifactSet={params.artifactSet} />
			<SlotFilter slot={slot} setSlot={setSlot} />
			<PageSection
				title='Best in Slot'
				actions={[
					{
						name: 'Paste or Add',
						onClick: () => {
							showModal(AddArtifactModal, { props: { setKey: params.artifactSet } });
						},
					},
				]}>
				<BestInSlot
					characters={characters}
					mainStats={mainStats}
					subStatArr={subStatArr}
					slot={slot}
				/>
			</PageSection>
			<ArtifactList
				artifactSet={params.artifactSet}
				slot={slot}
				mainStats={mainStats}
				subStatArr={subStatArr}
			/>
		</PageContainer>
	);
}
