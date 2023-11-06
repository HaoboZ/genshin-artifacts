'use client';
import type { ModalProps } from '@mui/joy';
import { Modal } from '@mui/joy';
import { useModalControls } from './index';

export default function ModalWrapper(props: Omit<ModalProps, 'open'>) {
	const { modalState, closeModal } = useModalControls();

	return <Modal open={modalState.open} onClose={closeModal} {...props} />;
}
