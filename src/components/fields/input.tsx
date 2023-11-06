'use client';
import type { InputProps } from '@mui/joy';
import { FormControl, FormLabel } from '@mui/joy';
import { useField } from 'formik';
import FormattedInput from '../formattedInput';

export default function InputField({
	name,
	label,
	...props
}: { name: string; label?: string } & InputProps) {
	const [field] = useField(name);

	return (
		<FormControl>
			<FormLabel>{label}</FormLabel>
			<FormattedInput {...field} {...props} />
		</FormControl>
	);
}
