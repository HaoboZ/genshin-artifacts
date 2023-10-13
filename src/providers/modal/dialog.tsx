import AsyncButton from '@/components/loaders/asyncButton';
import type { DialogContentProps, DialogProps } from '@mui/material';
import {
	Button,
	Dialog,
	DialogActions,
	dialogClasses,
	DialogContent,
	DialogTitle,
	Grow,
} from '@mui/material';
import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { useModalControls } from './index';

export default function ModalDialog({
	autoSize,
	title,
	children,
	contentProps,
	actions,
	onSave,
	...props
}: {
	autoSize?: boolean;
	title?: ReactNode;
	children: ReactNode;
	contentProps?: DialogContentProps;
	actions?: ReactNode;
	onSave?: () => void;
} & Partial<DialogProps>) {
	const { modalStatus, closeModal } = useModalControls();

	return (
		<Dialog
			disablePortal
			closeAfterTransition
			fullWidth={!autoSize}
			open={modalStatus.open}
			maxWidth='md'
			TransitionComponent={Grow}
			sx={{
				[`.${dialogClasses.paper}`]: {
					ml: 'env(safe-area-inset-left)',
					mr: 'env(safe-area-inset-right)',
					mt: 'env(safe-area-inset-top)',
					mb: 'env(safe-area-inset-bottom)',
				},
			}}
			onClose={() => closeModal()}
			{...props}>
			{title && <DialogTitle>{title}</DialogTitle>}
			<DialogContent {...contentProps}>{children}</DialogContent>
			<DialogActions>
				{actions || (
					<Fragment>
						{onSave ? (
							<AsyncButton
								variant='contained'
								onClick={async () => {
									await onSave();
									closeModal();
								}}>
								Save
							</AsyncButton>
						) : undefined}
						<Button variant='contained' color='error' onClick={closeModal}>
							{onSave ? 'Cancel' : 'Close'}
						</Button>
					</Fragment>
				)}
			</DialogActions>
		</Dialog>
	);
}
