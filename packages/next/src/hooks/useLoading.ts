import { useDebounce } from '@uidotdev/usehooks';

export default function useLoading(isLoading?: boolean, delay = 250) {
	const isLoadingDebounced = useDebounce(isLoading, delay);
	return isLoading && isLoadingDebounced;
}
