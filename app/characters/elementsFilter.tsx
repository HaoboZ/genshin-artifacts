import { Button, ToggleButtonGroup } from '@mui/joy';
import Image from 'next/image';
import { elementsInfo } from './characterData';

export default function ElementsFilter({
	element,
	setElement,
}: {
	element: string;
	setElement: (element: string) => void;
}) {
	return (
		<ToggleButtonGroup value={element} onChange={(e, newElement) => setElement(newElement)}>
			<Button value={null}>All</Button>
			{Object.values(elementsInfo).map((element) => (
				<Button key={element.key} value={element.key} sx={{ p: 0.5 }}>
					<Image alt={element.key} src={element.image} width={40} height={40} />
				</Button>
			))}
		</ToggleButtonGroup>
	);
}
