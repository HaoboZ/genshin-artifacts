import { Drawer, type DrawerProps } from '@mui/material';
import useModalControls from './useModalControls';

export default function DrawerWrapper(props: Omit<DrawerProps, 'open'>) {
	const { modalState, closeModal } = useModalControls();

	return <Drawer open={modalState.open} onClose={closeModal} {...props} />;
}
