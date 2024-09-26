'use client';
import { MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import type { ButtonProps, MenuItemProps } from '@mui/material';
import { ButtonGroup } from '@mui/material';
import type { MouseEventHandler, ReactNode } from 'react';
import { useMemo } from 'react';
import Dropdown from './dropdown';
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

	if (menu.length)
		buttonElements.push(
			<Dropdown key={-1} button={<MoreHorizIcon />}>
				{menu.map(({ name, onClick, menuItemProps, ...props }, index) => (
					<AsyncMenuItem key={index} onClick={onClick} {...menuItemProps} {...props}>
						{name}
					</AsyncMenuItem>
				))}
			</Dropdown>,
		);

	return <ButtonGroup>{buttonElements}</ButtonGroup>;
}
