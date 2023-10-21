import type { InputProps } from '@mui/joy';
import { FormControl, FormLabel, Input } from '@mui/joy';
import { useField } from 'formik';

export default function InputField({
	name,
	label,
	...props
}: { name: string; label?: string } & InputProps) {
	const [field] = useField(name);

	return (
		<FormControl>
			<FormLabel>{label}</FormLabel>
			<Input {...field} {...props} />
		</FormControl>
	);
}
