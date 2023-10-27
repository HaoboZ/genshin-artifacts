import type { Active } from '@dnd-kit/core';
import {
	defaultDropAnimationSideEffects,
	DndContext,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { nanoid } from 'nanoid';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { mapValues } from 'remeda';
import pget from '../../helpers/pget';
import SortableContainer from './sortableContainer';
import SortableItem from './sortableItem';
import { moveBetweenContainers } from './utils';

export default function MultiSortable<Item>({
	groups,
	setGroups,
	renderItems,
	renderItem,
	children = (lists) => Object.values(lists),
}: {
	groups: Record<string, Item[]>;
	setGroups: (groups: Record<string, Item[]>) => void;
	renderItems: (items: ReactNode, ref, group: string) => ReactNode;
	renderItem: (item: Item, containerProps, handleProps) => ReactNode;
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
		setGroups(mapValues(lists, (list) => list.map(pget('item'))));
	}, [lists]);

	useEffect(() => {
		if (skipB) return setSkipB(false);
		setLists(mapValues(groups, (items) => items.map((item) => ({ id: nanoid(), item }))));
	}, [groups]);

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

					return moveBetweenContainers(
						items,
						activeContainer,
						activeId,
						overContainer,
						overIndex,
					);
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
			{children(
				mapValues(lists, (list, group) => (
					<SortableContainer
						key={group}
						id={group}
						items={list}
						renderItems={renderItems}
						renderItem={renderItem}
					/>
				)),
			)}
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
