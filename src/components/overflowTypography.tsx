import type { TooltipProps, TypographyProps } from '@mui/joy';
import { Tooltip, Typography } from '@mui/joy';
import { useRef, useState } from 'react';
import useEventListener from '../hooks/useEventListener';

export default function OverflowTypography({
	tooltipProps,
	...props
}: { tooltipProps?: TooltipProps } & TypographyProps) {
	const contentRef = useRef<HTMLElement>();

	const [overFlowed, setOverFlowed] = useState(false);

	useEventListener(
		typeof window !== 'undefined' ? window : null,
		'resize',
		() => {
			if (!contentRef.current) return;
			setOverFlowed(contentRef.current.scrollWidth > contentRef.current.clientWidth);
		},
		true,
	);

	return (
		<Tooltip title={props.children ?? ''} disableHoverListener={!overFlowed} {...tooltipProps}>
			<Typography ref={contentRef} noWrap {...props} />
		</Tooltip>
	);
}
