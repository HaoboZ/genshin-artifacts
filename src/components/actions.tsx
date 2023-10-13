import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import type { ButtonProps, MenuItemProps } from '@mui/material';
import { ButtonGroup, MenuList } from '@mui/material';
import type { MouseEventHandler, ReactNode } from 'react';
import { useMemo } from 'react';
import ButtonMenu from './buttonMenu';
import AsyncButton from './loaders/asyncButton';
import AsyncMenuItem from './loaders/asyncMenuItem';

export type ActionProps = {
	name: ReactNode;
	onClick?: MouseEventHandler;
	buttonProps?: ButtonProps<any>;
	menuItemProps?: MenuItemProps<any>;
} & Record<string, any>;

export default function Actions({
	items,
	max,
}: {
	items: ActionProps[];
	// max number of buttons displayed
	max?: number;
}) {
	const [buttons, menu] = useMemo(() => {
		const filtered = items.filter(Boolean);
		if (!max || filtered.length <= max) return [filtered, []];

		const buttons = filtered.slice(0, max);
		const menu = filtered.slice(max);
		return [buttons, menu];
	}, [items, max]);

	return (
		<ButtonGroup>
			{buttons.map(({ name, onClick, buttonProps, ...props }, index) => (
				<AsyncButton
					key={index}
					variant='outlined'
					onClick={onClick}
					{...buttonProps}
					{...props}>
					{name}
				</AsyncButton>
			))}
			{Boolean(menu.length) && (
				<ButtonMenu
					variant='outlined'
					renderMenu={(closeMenu) => (
						<MenuList>
							{menu.map(({ name, onClick, menuItemProps, ...props }, index) => (
								<AsyncMenuItem
									key={index}
									onClick={async (e) => {
										await onClick(e);
										closeMenu();
									}}
									{...menuItemProps}
									{...props}>
									{name}
								</AsyncMenuItem>
							))}
						</MenuList>
					)}>
					<MoreHorizIcon />
				</ButtonMenu>
			)}
		</ButtonGroup>
	);
}
