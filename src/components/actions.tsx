'use client';
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import type { ButtonProps, MenuItemProps } from '@mui/joy';
import { ButtonGroup, Dropdown, Menu, MenuButton } from '@mui/joy';
import type { MouseEventHandler, ReactNode } from 'react';
import { forwardRef, useMemo } from 'react';
import AsyncButton from './loaders/asyncButton';
import AsyncMenuItem from './loaders/asyncMenuItem';

export type ActionProps = {
	name: ReactNode;
	onClick?: MouseEventHandler;
	buttonProps?: ButtonProps;
	menuItemProps?: MenuItemProps;
};

export default function Actions({ items, max }: { items: ActionProps[]; max?: number }) {
	const [buttons, menu] = useMemo(() => {
		const filtered = items.filter(Boolean);
		if (!max || filtered.length <= max) return [filtered, []];

		const buttons = filtered.slice(0, max - 1);
		const menu = filtered.slice(max - 1);
		return [buttons, menu];
	}, [items, max]);

	const buttonElements = buttons.map(({ name, onClick, buttonProps, ...props }, index) => (
		<AsyncButton key={index} onClick={onClick} {...buttonProps} {...props}>
			{name}
		</AsyncButton>
	));

	if (menu.length) buttonElements.push(<ButtonMenu key={-1} menu={menu} />);

	return <ButtonGroup>{buttonElements}</ButtonGroup>;
}

const ButtonMenu = forwardRef<HTMLButtonElement, { menu: ActionProps[] }>(function ({ menu }, ref) {
	return (
		<Dropdown>
			<MenuButton ref={ref} data-last-child>
				<MoreHorizIcon />
			</MenuButton>
			<Menu>
				{menu.map(({ name, onClick, menuItemProps, ...props }, index) => (
					<AsyncMenuItem key={index} onClick={onClick} {...menuItemProps} {...props}>
						{name}
					</AsyncMenuItem>
				))}
			</Menu>
		</Dropdown>
	);
});
