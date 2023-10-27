export function moveBetweenContainers<T extends { id }>(
	items: Record<string, T[]>,
	activeContainer: string,
	activeId: string | number,
	overContainer: string,
	overIndex: number,
) {
	const activeIndex = items[activeContainer].findIndex(({ id }) => id === activeId);
	if (activeIndex === -1) return items;
	const item = items[activeContainer][activeIndex];
	const newItems = { ...items };
	newItems[activeContainer] = newItems[activeContainer].toSpliced(activeIndex, 1);
	newItems[overContainer] = newItems[overContainer].toSpliced(overIndex, 0, item);
	return newItems;
}
