export function required<T>(value: T | null | undefined, description: string): T {
	if (value === null || value === undefined) throw new Error(`Missing ${description}`);
	return value;
}

export function requiredText(value: Node | null | undefined, description: string) {
	const text = required(value, description).textContent?.trim();
	if (!text) throw new Error(`Missing text for ${description}`);
	return text;
}

export function requiredMatch(
	value: string | null | undefined,
	regex: RegExp,
	description: string,
) {
	const match = value?.match(regex);
	if (!match) throw new Error(`Could not parse ${description}`);
	return match;
}

export function normalizeImageUrl(url: string | null | undefined, description: string) {
	if (!url) throw new Error(`Missing image URL for ${description}`);
	return url.replace(/(\.(?:png|jpg|jpeg|webp)).*$/i, '$1');
}

export function getImageUrl(image: HTMLImageElement | null | undefined, description: string) {
	const element = required(image, description);
	return normalizeImageUrl(
		element.getAttribute('data-src') ?? element.getAttribute('src'),
		description,
	);
}
