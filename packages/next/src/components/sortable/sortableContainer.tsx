import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { useMemo } from 'react';
import SortableItem from './sortableItem';

export default function SortableContainer({ id, items, renderItems, renderItem }) {
	const { setNodeRef } = useDroppable({ id });

	const list = useMemo(
		() =>
			renderItems(
				items.map(({ id, item }) => (
					<SortableItem key={id} id={id} item={item} renderItem={renderItem} />
				)),
				setNodeRef,
				id,
			),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[items, id, renderItems, renderItem],
	);

	return (
		<SortableContext key={id} id={id} items={items}>
			{list}
		</SortableContext>
	);
}
