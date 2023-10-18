import type { ContainerProps } from '@mui/material';
import { Container } from '@mui/material';
import useIsMobile from '../../hooks/useIsMobile';
import ScrollTop from '../scrollTop';

export default function PageContainer({ children, ...props }: ContainerProps) {
	return (
		<Container disableGutters={useIsMobile()} {...props}>
			<ScrollTop />
			{children}
		</Container>
	);
}
