import { useDebouncedValue } from 'rooks';

export default function useLoading(isLoading?: boolean, delay = 250) {
	const [isLoadingDebounced] = useDebouncedValue(isLoading, delay);
	return isLoading && isLoadingDebounced;
}
