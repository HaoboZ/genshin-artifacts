'use client';
import useParamState from '@/src/hooks/useParamState';
import type { SlotKey } from '@/src/types/good';
import { Fragment } from 'react';
import ArtifactList from '../[artifactSet]/artifactList';
import SlotFilter from '../[artifactSet]/slotFilter';

export default function ArtifactSet() {
	const [slot, setSlot] = useParamState<SlotKey>('slot', null);

	return (
		<Fragment>
			<SlotFilter slot={slot} setSlot={setSlot} />
			<ArtifactList slot={slot} />
		</Fragment>
	);
}
