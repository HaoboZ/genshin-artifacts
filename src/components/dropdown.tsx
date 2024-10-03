'use client';
import type { ButtonProps } from '@mui/material';
import { Button, Menu } from '@mui/material';
import type { ReactNode } from 'react';
import { forwardRef, Fragment, useState } from 'react';

const Dropdown = forwardRef<
	HTMLButtonElement,
	{
		button: ReactNode;
		children: ReactNode | ((closeMenu: () => void) => ReactNode);
	} & Omit<ButtonProps, 'children'>
>(function ({ button, children, ...props }, ref) {
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
});

export default Dropdown;
