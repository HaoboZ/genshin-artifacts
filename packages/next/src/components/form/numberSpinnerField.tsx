import { FormControl, FormLabel } from '@mui/material';
import { type FieldPath, type FieldValues, useController, useFormContext } from 'react-hook-form';
import NumberSpinner, { type NumberSpinnerProps } from '../numberSpinner';

export default function NumberSpinnerField<TFieldValues extends FieldValues = FieldValues>({
	name,
	label,
	...props
}: { name: FieldPath<TFieldValues>; label?: string } & NumberSpinnerProps) {
	const { control, setValue } = useFormContext<TFieldValues>();
	const { field } = useController({ name, control });

	return (
		<FormControl>
			<FormLabel>{label}</FormLabel>
			<NumberSpinner
				size='small'
				min={0}
				{...field}
				{...props}
				onValueChange={(amount) => setValue<FieldPath<TFieldValues>>(name, +amount as any)}
			/>
		</FormControl>
	);
}
