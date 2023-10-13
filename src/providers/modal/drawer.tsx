import AsyncButton from '@/components/loaders/asyncButton';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import type { DialogContentProps, SwipeableDrawerProps } from '@mui/material';
import { DialogContent, IconButton, SwipeableDrawer, Toolbar, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useModalControls } from './index';

export default function ModalDrawer({
	autoSize,
	title,
	children,
	contentProps,
	onSave,
	...props
}: {
	autoSize?: boolean;
	title?: ReactNode;
	children: ReactNode;
	contentProps?: DialogContentProps;
	onSave?: () => void;
} & Partial<Omit<SwipeableDrawerProps, 'title'>>) {
	const { modalStatus, closeModal } = useModalControls();

	return (
		<SwipeableDrawer
			disableSwipeToOpen
			disablePortal
			closeAfterTransition
			open={modalStatus.open}
			anchor='bottom'
			sx={{ display: 'flex', justifyContent: 'center' }}
			PaperProps={{
				sx: {
					maxWidth: '100%',
					maxHeight: 'calc(100vh - env(safe-area-inset-top) - 32px)',
					height: autoSize ? 'auto' : '100%',
					left: 'auto',
					right: 'auto',
					borderTopLeftRadius: 12,
					borderTopRightRadius: 12,
					width: ({ breakpoints }) => breakpoints.values.md,
				},
			}}
			onOpen={() => null}
			onClose={() => closeModal()}
			{...props}>
			<Toolbar>
				<IconButton edge='start' color='inherit' onClick={closeModal}>
					<ArrowBackIcon />
				</IconButton>
				<Typography variant='h3' flexGrow={1}>
					{title}
				</Typography>
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
			</Toolbar>
			<DialogContent onTouchStart={(e) => e.stopPropagation()} {...contentProps}>
				{children}
			</DialogContent>
		</SwipeableDrawer>
	);
}
