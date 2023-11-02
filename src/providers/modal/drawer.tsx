import type { DrawerProps } from '@mui/joy';
import { Drawer } from '@mui/joy';
import { useModalControls } from './index';

export default function DrawerWrapper(props: Omit<DrawerProps, 'open'>) {
	const { modalState, closeModal } = useModalControls();

	return <Drawer open={modalState.open} onClose={closeModal} {...props} />;
}
