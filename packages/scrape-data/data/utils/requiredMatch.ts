export function requiredMatch(
	value: string | null | undefined,
	regex: RegExp,
	description: string,
) {
	const match = value?.match(regex);
	if (!match) throw new Error(`Could not parse ${description}`);
	return match;
}
