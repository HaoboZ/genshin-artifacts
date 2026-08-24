import { normalizeImageUrl } from './normalizeImageUrl';
import { required } from './required';

export function getImageUrl(image: HTMLImageElement | null | undefined, description: string) {
	const element = required(image, description);
	return normalizeImageUrl(
		element.getAttribute('data-src') ?? element.getAttribute('src'),
		description,
	);
}
