export function normalizeImageUrl(url: string | null | undefined, description: string) {
	if (!url) throw new Error(`Missing image URL for ${description}`);
	return url.replace(/(\.(?:png|jpg|jpeg|webp)).*$/i, '$1');
}
