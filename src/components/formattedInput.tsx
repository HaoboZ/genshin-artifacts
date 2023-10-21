import type { InputProps } from '@mui/joy';
import { Input } from '@mui/joy';
import { useEffect, useState } from 'react';

export default function FormattedInput(props: InputProps) {
	const [text, setText] = useState(props.value);
	const [focused, setFocused] = useState(false);

	useEffect(() => {
		if (!focused) setText(props.value);
	}, [focused, props.value]);

	return (
		<Input
			{...props}
			value={text}
			onFocus={(e) => {
				setFocused(true);
				props.onFocus?.(e);
			}}
			onChange={(e) => {
				setText(e.target.value);
				props.onChange?.(e);
			}}
			onBlur={(e) => {
				setText(props.value);
				setFocused(false);
				props.onBlur?.(e);
			}}
		/>
	);
}
