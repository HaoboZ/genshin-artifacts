import type { SwitchProps } from '@mui/material';
import { FormControl, FormLabel, Switch } from '@mui/material';
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
				onChange={(e) => {
					// @ts-ignore
					if (props.onChange?.(e) !== false) helpers.setValue(e.target.checked);
				}}
			/>
		</FormControl>
	);
}
