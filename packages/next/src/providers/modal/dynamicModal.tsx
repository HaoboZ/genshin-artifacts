import { Backdrop, CircularProgress } from '@mui/material';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useDebouncedValue } from 'rooks';

export default function dynamicModal(route: () => Promise<any>) {
	return dynamic(route, {
		loading: function LoadingModal() {
			const [isLoading, setIsLoading] = useState(false);

			useEffect(() => {
				setIsLoading(true);
			}, []);

			const [loading] = useDebouncedValue(isLoading, 250);

			return (
				<Backdrop open={loading} sx={{ zIndex: 'tooltip' }}>
					<CircularProgress />
				</Backdrop>
			);
		},
	});
}
