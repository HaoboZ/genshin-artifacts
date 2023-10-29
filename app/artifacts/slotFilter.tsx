import type { SlotKey } from '@/src/types/good';
import { Button, ToggleButtonGroup } from '@mui/joy';
import Image from 'next/image';
import { artifactSlotImages, artifactSlotOrder } from './artifactData';

export default function SlotFilter({
	slot,
	setSlot,
}: {
	slot: SlotKey;
	setSlot: (slot: SlotKey) => void;
}) {
	return (
		<ToggleButtonGroup value={slot} onChange={(e, newSlot) => setSlot(newSlot)}>
			<Button value={null}>All</Button>
			{artifactSlotOrder.map((slot) => (
				<Button key={slot} value={slot} sx={{ p: 0.5 }}>
					<Image alt={slot} src={artifactSlotImages[slot]} width={40} height={40} />
				</Button>
			))}
		</ToggleButtonGroup>
	);
}
