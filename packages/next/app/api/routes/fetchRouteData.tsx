import axios from 'axios';

export async function fetchRouteData<T>(key: string) {
	console.log(`${process.env.NEXT_PUBLIC_ROUTE_URL}/${key}`);
	const { data } = await axios.get<T>(`${process.env.NEXT_PUBLIC_ROUTE_URL}/${key}`);
	return data;
}
