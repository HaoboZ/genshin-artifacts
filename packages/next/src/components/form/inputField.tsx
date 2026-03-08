import { FormControl, FormLabel, type TextFieldProps } from '@mui/material';
import { type FieldPath, type FieldValues, useController, useFormContext } from 'react-hook-form';
import FormattedTextField from '../formattedTextField';

export default function InputField<TFieldValues extends FieldValues = FieldValues>({
	name,
	label,
	...props
}: { name: FieldPath<TFieldValues>; label?: string } & TextFieldProps) {
	const { control } = useFormContext<TFieldValues>();
	const { field } = useController({ name, control });

	return (
		<FormControl>
			<FormLabel>{label}</FormLabel>
			<FormattedTextField {...field} {...props} />
		</FormControl>
	);
}
