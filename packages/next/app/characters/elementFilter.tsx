import { elementsInfo } from '@/api/elements';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import Image from 'next/image';

export default function ElementFilter({
	element,
	setElement,
}: {
	element: string;
	setElement: (element: string) => void;
}) {
	return (
		<ToggleButtonGroup
			exclusive
			value={element ?? 'none'}
			onChange={(e, newElement) => setElement(newElement === 'none' ? null : newElement)}>
			<ToggleButton value='none'>All</ToggleButton>
			{Object.entries(elementsInfo).map(([key, image]) => (
				<ToggleButton key={key} value={key} sx={{ p: 0.5 }}>
					<Image alt={key} src={image} width={40} height={40} />
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
