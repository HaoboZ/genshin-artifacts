'use client';
import type { TextFieldProps } from '@mui/material';
import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';

export default function FormattedTextField(props: TextFieldProps) {
	const [text, setText] = useState(props.value);
	const [focused, setFocused] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		if (!focused) setText(props.value);
	}, [focused, props.value]);

	return (
		<TextField
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
