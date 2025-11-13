import { Backdrop, CircularProgress } from '@mui/material';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import useLoading from '../../hooks/useLoading';

export default function dynamicModal(route: () => Promise<any>) {
	return dynamic(route, {
		loading: function LoadingModal() {
			const [isLoading, setIsLoading] = useState(false);

			useEffect(() => {
				setIsLoading(true);
			}, []);

			const loading = useLoading(isLoading);

			return (
				<Backdrop open={loading} sx={{ zIndex: ({ zIndex }) => zIndex.modal + 1 }}>
					<CircularProgress />
				</Backdrop>
			);
		},
	});
}
