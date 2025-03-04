'use client';
import type { TextFieldProps } from '@mui/material';
import { FormControl, FormLabel } from '@mui/material';
import { useField } from 'formik';
import FormattedTextField from '../formattedTextField';

export default function InputField({
	name,
	label,
	...props
}: { name: string; label?: string } & TextFieldProps) {
	const [field] = useField(name);

	return (
		<FormControl>
			<FormLabel>{label}</FormLabel>
			<FormattedTextField {...field} {...props} />
		</FormControl>
	);
}
