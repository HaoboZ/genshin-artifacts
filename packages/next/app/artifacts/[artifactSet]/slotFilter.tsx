import { artifactSlotImages, artifactSlotOrder } from '@/api/artifacts';
import { type SlotKey } from '@/types/good';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import Image from 'next/image';

export default function SlotFilter({
	slot,
	setSlot,
}: {
	slot: SlotKey;
	setSlot: (slot: SlotKey) => void;
}) {
	return (
		<ToggleButtonGroup
			exclusive
			value={slot ?? 'none'}
			onChange={(_, newSlot) => setSlot(newSlot === 'none' ? null : newSlot)}>
			<ToggleButton value='none'>All</ToggleButton>
			{artifactSlotOrder.map((slot) => (
				<ToggleButton key={slot} value={slot} sx={{ p: 0.5 }}>
					<Image alt={slot} src={artifactSlotImages[slot]} width={40} height={40} />
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
