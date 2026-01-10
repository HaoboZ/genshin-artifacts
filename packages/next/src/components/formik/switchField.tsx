import { FormControl, FormLabel, Switch, type SwitchProps } from '@mui/material';
import { useField } from 'formik';

export default function SwitchField({
	name,
	label,
	...props
}: { name: string; label?: string } & SwitchProps) {
	const [field, , helpers] = useField(name);

	return (
		<FormControl>
			<FormLabel>{label}</FormLabel>
			<Switch
				{...field}
				checked={field.value}
				{...props}
				onChange={(e, checked) => {
					// @ts-expect-error onChange return
					if (props.onChange?.(e, checked) !== false) helpers.setValue(checked);
				}}
			/>
		</FormControl>
	);
}
