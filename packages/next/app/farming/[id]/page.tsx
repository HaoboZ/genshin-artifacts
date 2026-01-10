import axios from 'axios';
import FarmingRoute from './index';

export default async function FarmingRoutePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const { data } = await axios.get(`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes/${id}.json`);

	return <FarmingRoute routeData={data} />;
}
