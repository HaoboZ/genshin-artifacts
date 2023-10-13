import type { ContainerProps } from '@mui/material';
import { Container } from '@mui/material';
import useWideMedia from '../../hooks/useWideMedia';
import ScrollTop from '../scrollTop';

export default function PageContainer({ children, ...props }: ContainerProps) {
	return (
		<Container disableGutters={!useWideMedia()} {...props}>
			<ScrollTop />
			{children}
		</Container>
	);
}
