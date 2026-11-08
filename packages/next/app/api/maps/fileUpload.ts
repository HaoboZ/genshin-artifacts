export async function uploadMapFile(id: string, file: File | FormData) {
	const token = document.cookie
		.split('; ')
		.find((cookie) => cookie.startsWith('AUTH_TOKEN='))
		?.slice('AUTH_TOKEN='.length);
	if (!token) throw new Error('Authentication token is missing. Set it on the auth page first.');

	const response = await fetch(`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${id}`, {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${decodeURIComponent(token)}`,
			...(file instanceof File ? { 'Content-Type': file.type } : {}),
		},
		body: file,
	});
	if (!response.ok) {
		const body = await response.text();
		let message = body;
		try {
			const parsed: unknown = JSON.parse(body);
			if (
				typeof parsed === 'object' &&
				parsed !== null &&
				'error' in parsed &&
				typeof parsed.error === 'string'
			) {
				message = parsed.error;
			}
		} catch {
			// Keep the raw response body when it is not JSON.
		}
		throw new Error(message || `Upload failed (${response.status})`);
	}
}
