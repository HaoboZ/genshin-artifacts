import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import SortableItem from './sortableItem';

export default function SortableContainer({ id, items, renderItems, renderItem }) {
	const { setNodeRef } = useDroppable({ id });

	return (
		<SortableContext key={id} id={id} items={items}>
			{renderItems(
				items.map(({ id, item }) => (
					<SortableItem key={id} id={id} item={item} renderItem={renderItem} />
				)),
				setNodeRef,
				+id,
			)}
		</SortableContext>
	);
}
