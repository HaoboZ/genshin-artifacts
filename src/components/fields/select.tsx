'use client';
import type { SelectProps } from '@mui/joy';
import { FormControl, FormLabel, Select } from '@mui/joy';
import { useField } from 'formik';

export default function SelectField<OptionValue extends {}, Multiple extends boolean>({
	name,
	label,
	...props
}: { name: string; label?: string } & SelectProps<OptionValue, Multiple>) {
	const [field, , helpers] = useField(name);

	return (
		<FormControl>
			<FormLabel>{label}</FormLabel>
			<Select
				{...field}
				{...props}
				onChange={(e, value) => {
					// @ts-ignore
					if (props.onChange?.(e, value) !== false) helpers.setValue(value);
				}}
			/>
		</FormControl>
	);
}
