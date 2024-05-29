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
			{Object.values(elementsInfo).map((element) => (
				<Button key={element.key} value={element.key} sx={{ p: 0.5 }}>
					<Image alt={element.key} src={element.image} width={40} height={40} />
				</Button>
			))}
		</ToggleButtonGroup>
	);
}
