import { required } from './required';

export function requiredText(value: Node | null | undefined, description: string) {
	const text = required(value, description).textContent?.trim();
	if (!text) throw new Error(`Missing text for ${description}`);
	return text;
}
