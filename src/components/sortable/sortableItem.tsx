import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableItem({ id, item, renderItem }) {
	const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
		id,
	});

	return renderItem(item, {
		ref: setNodeRef,
		style: {
			opacity: isDragging ? 0.4 : undefined,
			transform: CSS.Transform.toString(transform),
			transition,
		},
		...attributes,
		...listeners,
	});
}
