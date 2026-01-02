import { useWindowEventListener } from 'rooks';

// paste image directly to the window
export default function usePasteImage(listener: (items: DataTransferItem[]) => void) {
	return useWindowEventListener('paste', ({ clipboardData }: ClipboardEvent) => {
		const items = Array.from(clipboardData.items).filter(({ type }) => /^image\//.test(type));
		if (!items.length) return;
		listener(items);
	});
}
