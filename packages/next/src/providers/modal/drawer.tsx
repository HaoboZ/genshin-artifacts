'use client';
import type { DrawerProps } from '@mui/material';
import { Drawer } from '@mui/material';
import { useModalControls } from './index';

export default function DrawerWrapper(props: Omit<DrawerProps, 'open'>) {
	const { modalState, closeModal } = useModalControls();

	return <Drawer open={modalState.open} onClose={closeModal} {...props} />;
}
