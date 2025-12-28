import axios from 'axios';

export default async function fetcher(url: string) {
	const { data } = await axios.get(url);
	return data;
}
