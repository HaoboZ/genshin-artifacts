import {
	type Active,
	defaultDropAnimationSideEffects,
	DndContext,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { nanoid } from 'nanoid';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { mapValues, prop } from 'remeda';
import SortableContainer from './sortableContainer';
import SortableItem from './sortableItem';

export default function MultiSortable<Item>({
	groups,
	setGroups,
	renderItems,
	renderItem,
	dependencies = [],
	children = (lists) => Object.values(lists),
}: {
	groups: Record<string, Item[]>;
	setGroups: (groups: Record<string, Item[]>) => void;
	renderItems: (items: ReactNode, ref, group: string) => ReactNode;
	renderItem: (item: Item, containerProps, handleProps) => ReactNode;
	dependencies?: any[];
	children?: (lists: Record<string, ReactNode>) => ReactNode;
}) {
	const [setA, setSetA] = useState(false);
	const [skipB, setSkipB] = useState(true);
	const [lists, setLists] = useState<Record<string, { id: string; item: Item }[]>>(() =>
		mapValues(groups, (items) => items.map((item) => ({ id: nanoid(), item }))),
	);
	const [active, setActive] = useState<Active>(null);

	const activeItem = useMemo(() => {
		if (!active) return null;
		for (const list of Object.values(lists))
			for (const item of list) if (item.id === active?.id) return item;
	}, [active, lists]);

	useEffect(() => {
		if (!setA) return;
		setSetA(false);
		setSkipB(true);
		// @ts-expect-error NoInfer
		setGroups(mapValues(lists, (list) => list.map(prop('item'))));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lists]);

	useEffect(() => {
		if (skipB) {
			setSkipB(false);
			return;
		}
		setLists(
			mapValues(groups, (items, group) =>
				items.map((item, index) => ({ id: lists[group][index]?.id ?? nanoid(), item })),
			),
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [groups]);

	const containers = useMemo(() => {
		return children(
			mapValues(lists, (list, group) => (
				<SortableContainer
					key={group}
					id={group}
					items={list}
					renderItems={renderItems}
					renderItem={renderItem}
				/>
			)),
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lists, ...dependencies]);

	return (
		<DndContext
			sensors={useSensors(useSensor(PointerSensor))}
			onDragStart={({ active }) => setActive(active)}
			onDragOver={({ active, over }) => {
				const overId = over?.id;
				if (!overId) return;

				const activeContainer = active.data.current.sortable?.containerId;
				const overContainer = over.data.current?.sortable.containerId ?? overId;
				if (!activeContainer || !overContainer || activeContainer === overContainer) return;

				setLists((items) => {
					const activeId = active.id;
					const overIndex = over.data.current?.sortable.index ?? 0;

					const activeIndex = items[activeContainer].findIndex(({ id }) => id === activeId);
					if (activeIndex === -1) return items;
					const item = items[activeContainer][activeIndex];
					const newItems = { ...items };
					newItems[activeContainer] = newItems[activeContainer].toSpliced(activeIndex, 1);
					newItems[overContainer] = newItems[overContainer].toSpliced(overIndex, 0, item);
					return newItems;
				});
			}}
			onDragEnd={({ active, over }) => {
				setSetA(true);
				if (!over || active.id === over.id) return;

				const activeContainer = active.data.current.sortable?.containerId;
				if (!activeContainer) return;

				setLists((lists) => {
					const newLists = { ...lists };
					const list = newLists[activeContainer];
					const activeIndex = list.findIndex(({ id }) => id === active.id);
					const overIndex = list.findIndex(({ id }) => id === over.id);
					newLists[activeContainer] = arrayMove(list, activeIndex, overIndex);
					return newLists;
				});
				setActive(null);
			}}
			onDragCancel={() => setActive(null)}>
			{containers}
			<DragOverlay
				dropAnimation={{
					sideEffects: defaultDropAnimationSideEffects({
						styles: { active: { opacity: '0.4' } },
					}),
				}}>
				{activeItem && (
					<SortableItem id={activeItem.id} item={activeItem.item} renderItem={renderItem} />
				)}
			</DragOverlay>
		</DndContext>
	);
}
