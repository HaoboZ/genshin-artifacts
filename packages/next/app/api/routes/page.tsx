import axios from 'axios';
import RouteList from './index';

export default async function RouteListPage() {
	const { data } = await axios.get(`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes.json`);

	return <RouteList items={data} />;
}
