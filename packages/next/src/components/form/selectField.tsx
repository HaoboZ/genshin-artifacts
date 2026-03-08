import { FormControl, FormLabel, Select, type SelectProps } from '@mui/material';
import { type FieldPath, type FieldValues, useController, useFormContext } from 'react-hook-form';

export default function SelectField<TFieldValues extends FieldValues = FieldValues>({
	name,
	label,
	...props
}: { name: FieldPath<TFieldValues>; label?: string } & SelectProps) {
	const { control } = useFormContext<TFieldValues>();
	const { field } = useController({ name, control });

	return (
		<FormControl size='small'>
			<FormLabel>{label}</FormLabel>
			<Select {...field} {...props} />
		</FormControl>
	);
}
