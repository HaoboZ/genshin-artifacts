import { Button, type ButtonProps, Menu } from '@mui/material';
import { Fragment, type ReactNode, useState } from 'react';

export default function Dropdown({
	ref,
	button,
	children,
	...props
}: {
	button: ReactNode;
	children: ReactNode | ((closeMenu: () => void) => ReactNode);
} & Omit<ButtonProps, 'children'>) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [open, setOpen] = useState<boolean>(false);

	return (
		<Fragment>
			<Button
				ref={ref}
				variant='contained'
				onClick={(e) => {
					setAnchorEl(e.currentTarget);
					setOpen(true);
				}}
				{...props}>
				{button}
			</Button>
			<Menu anchorEl={anchorEl} open={open} onClose={() => setOpen(false)}>
				{typeof children === 'function' ? children(() => setOpen(false)) : children}
			</Menu>
		</Fragment>
	);
}
