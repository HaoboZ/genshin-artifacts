import { Button, ToggleButtonGroup } from '@mui/joy';
import Image from 'next/image';
import { elementsInfo } from './element';

export default function ElementFilter({
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
				<Button key={element.key} value={element.key}>
					<Image alt={element.key} src={element.image} width={30} height={30} />
				</Button>
			))}
		</ToggleButtonGroup>
	);
}
