import { Box, Menu } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';

export default function ContextMenu({
	menuContent,
	children,
}: {
	menuContent: ReactNode[] | ((closeMenu: () => void) => ReactNode[]);
	children: ReactNode;
}) {
	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
	} | null>(null);

	const handleClose = () => {
		setContextMenu(null);
	};

	return (
		<Box
			sx={{ cursor: 'context-menu' }}
			onContextMenu={(e) => {
				e.preventDefault();
				setContextMenu(
					contextMenu === null ? { mouseX: e.clientX + 2, mouseY: e.clientY - 6 } : null,
				);
			}}>
			{children}
			<Menu
				autoFocus={false}
				open={contextMenu !== null}
				anchorReference='anchorPosition'
				anchorPosition={
					contextMenu !== null
						? { top: contextMenu.mouseY, left: contextMenu.mouseX }
						: undefined
				}
				onClose={handleClose}>
				{typeof menuContent === 'function'
					? menuContent(() => setContextMenu(null))
					: menuContent}
			</Menu>
		</Box>
	);
}
