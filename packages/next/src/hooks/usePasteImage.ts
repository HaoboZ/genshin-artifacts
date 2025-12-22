import useEventListener from './useEventListener';

// paste image directly to the window
export default function usePasteImage(listener: (items: DataTransferItem[]) => void) {
	return useEventListener(
		typeof window !== 'undefined' ? window : null,
		'paste',
		({ clipboardData }: ClipboardEvent) => {
			const items = Array.from(clipboardData.items).filter(({ type }) => /^image\//.test(type));
			if (!items.length) return;
			listener(items);
		},
	);
}
