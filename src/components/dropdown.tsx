'use client';
import { Button, Menu } from '@mui/material';
import type { ReactNode } from 'react';
import { forwardRef, Fragment, useState } from 'react';

const Dropdown = forwardRef<HTMLButtonElement, { button: ReactNode; children: ReactNode }>(
	function ({ button, children }, ref) {
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
					}}>
					{button}
				</Button>
				<Menu anchorEl={anchorEl} open={open} onClose={() => setOpen(false)}>
					{children}
				</Menu>
			</Fragment>
		);
	},
);

export default Dropdown;
