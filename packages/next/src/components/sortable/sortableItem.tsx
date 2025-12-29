import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react';

export default function SortableItem({ id, item, renderItem }) {
	const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
		id,
	});

	const trans = transform ?? { x: 0, y: 0, scaleX: 1, scaleY: 1 };
	return useMemo(() => {
		return renderItem(
			item,
			{
				ref: setNodeRef,
				style: {
					opacity: isDragging ? 0.4 : undefined,
					transform: CSS.Transform.toString(trans),
					transition,
				},
				...attributes,
			},
			listeners,
		);
		// eslint-disable-next-line react-hooks/use-memo, react-hooks/exhaustive-deps
	}, [item, renderItem, ...Object.values(trans)]);
}
