import { FormControl, FormLabel, Switch, type SwitchProps } from '@mui/material';
import { type FieldPath, type FieldValues, useController, useFormContext } from 'react-hook-form';

export default function SwitchField<TFieldValues extends FieldValues = FieldValues>({
	name,
	label,
	...props
}: { name: FieldPath<TFieldValues>; label?: string } & SwitchProps) {
	const { control, setValue } = useFormContext<TFieldValues>();
	const { field } = useController({ name, control });

	return (
		<FormControl>
			<FormLabel>{label}</FormLabel>
			<Switch
				{...field}
				checked={field.value}
				{...props}
				onChange={(e, checked) => {
					// @ts-expect-error onChange return
					if (props.onChange?.(e, checked) !== false) setValue(name, checked);
				}}
			/>
		</FormControl>
	);
}
