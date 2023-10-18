import Image from '@/components/image';
import data from '@/public/data.json';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

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
			value={element}
			onChange={(e, newElement) => setElement(newElement ?? '')}>
			<ToggleButton value=''>All</ToggleButton>
			{Object.values(data.elements).map((element) => (
				<ToggleButton key={element.key} value={element.key}>
					<Image alt={element.key} src={element.image} width={30} height={30} />
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}
