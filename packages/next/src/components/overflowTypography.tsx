import type { TooltipProps, TypographyProps } from '@mui/material';
import { Tooltip, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { useOnWindowResize } from 'rooks';

export default function OverflowTypography({
	tooltipProps,
	...props
}: { tooltipProps?: TooltipProps } & TypographyProps) {
	const contentRef = useRef<HTMLElement>(null);

	const [overFlowed, setOverFlowed] = useState(false);

	useOnWindowResize(() => {
		setOverFlowed(contentRef.current.scrollWidth > contentRef.current.clientWidth);
	});

	return (
		<Tooltip
			arrow
			title={props.children ?? ''}
			disableHoverListener={!overFlowed}
			{...tooltipProps}>
			<Typography ref={contentRef} noWrap {...props} />
		</Tooltip>
	);
}
