import axios from 'axios';
import Route from './index';

export default async function RoutePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const { data } = await axios.get(`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes/${id}.json`);

	return <Route routeData={data} />;
}
