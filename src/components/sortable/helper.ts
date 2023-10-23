export function moveBetweenContainers(items, activeContainer, activeId, overContainer, overIndex) {
	const activeIndex = items[activeContainer].findIndex(({ id }) => id === activeId);
	if (activeIndex === -1) return items;
	const item = items[activeContainer][activeIndex];
	const newItems = [...items];
	newItems[activeContainer] = removeAtIndex(newItems[activeContainer], activeIndex);
	newItems[overContainer] = insertAtIndex(newItems[overContainer], overIndex, item);
	return newItems;
}

function removeAtIndex(array, index) {
	return [...array.slice(0, index), ...array.slice(index + 1)];
}

function insertAtIndex(array, index, item) {
	return [...array.slice(0, index), item, ...array.slice(index)];
}
