import type { ButtonProps, MenuProps } from '@mui/material';
import { Button, Menu } from '@mui/material';
import type { ReactNode } from 'react';
import { Fragment, useState } from 'react';

export default function ButtonMenu({
	onClick,
	menuProps,
	renderMenu,
	...props
}: {
	renderMenu: (closeMenu: () => void) => ReactNode;
	menuProps?: MenuProps;
} & ButtonProps) {
	const [anchorEl, setAnchorEl] = useState(null);

	return (
		<Fragment>
			<Button
				{...props}
				onClick={(e) => {
					e.stopPropagation();
					setAnchorEl(e.currentTarget);
					onClick?.(e);
				}}
			/>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => setAnchorEl(null)}
				{...menuProps}>
				{renderMenu(() => setAnchorEl(null))}
			</Menu>
		</Fragment>
	);
}
