import type { SelectProps } from '@mui/joy';
import { FormControl, FormLabel, Select } from '@mui/joy';
import { useField } from 'formik';

export default function SelectField<DefaultValue>({
	name,
	label,
	...props
}: { name: string; label?: string } & SelectProps<DefaultValue>) {
	const [field, , helpers] = useField(name);

	return (
		<FormControl>
			<FormLabel>{label}</FormLabel>
			<Select
				{...field}
				{...props}
				onChange={(e, value) => {
					if (props.onChange?.(e, value) !== false) helpers.setValue(value);
				}}
			/>
		</FormControl>
	);
}
