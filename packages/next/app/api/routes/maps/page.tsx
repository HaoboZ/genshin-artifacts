import axios from 'axios';
import MapList from './index';

export default async function MapListPage() {
	const { data } = await axios.get(`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps.json`);

	return <MapList items={data} />;
}
