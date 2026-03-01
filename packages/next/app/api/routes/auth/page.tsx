import { redirect } from 'next/navigation';

export default function RouteAuthPage() {
	redirect('/api/maps/auth');
}
