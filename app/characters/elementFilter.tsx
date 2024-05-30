import { elementsInfo } from '@/api/elements';
import { Button, ToggleButtonGroup } from '@mui/joy';
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
			value={element ?? 'none'}
			onChange={(e, newElement) => setElement(newElement === 'none' ? null : newElement)}>
			<Button value='none'>All</Button>
			{Object.entries(elementsInfo).map(([key, image]) => (
				<Button key={key} value={key} sx={{ p: 0.5 }}>
					<Image alt={key} src={image} width={40} height={40} />
				</Button>
			))}
		</ToggleButtonGroup>
	);
}
