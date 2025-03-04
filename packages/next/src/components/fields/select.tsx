'use client';
import type { SelectProps } from '@mui/material';
import { FormControl, FormLabel, Select } from '@mui/material';
import { useField } from 'formik';

export default function SelectField<Value = unknown>({
	name,
	label,
	...props
}: { name: string; label?: string } & SelectProps<Value>) {
	const [field, , helpers] = useField(name);

	return (
		<FormControl size='small'>
			<FormLabel>{label}</FormLabel>
			<Select
				{...field}
				{...props}
				onChange={(e) => {
					// @ts-ignore
					if (props.onChange?.(e) !== false) helpers.setValue(e.target.value);
				}}
			/>
		</FormControl>
	);
}
