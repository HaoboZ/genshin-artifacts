import type { AutocompleteProps } from '@mui/joy';
import { Autocomplete, FormControl, FormLabel } from '@mui/joy';
import { useField } from 'formik';

export default function AutocompleteField<
	T,
	Multiple extends boolean | undefined = undefined,
	DisableClearable extends boolean | undefined = undefined,
	FreeSolo extends boolean | undefined = undefined,
>({
	name,
	label,
	...props
}: { name: string; label?: string } & AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>) {
	const [field, , helpers] = useField(name);

	return (
		<FormControl>
			<FormLabel>{label}</FormLabel>
			<Autocomplete
				{...field}
				{...props}
				onChange={(e, value, reason, details) => {
					if (props.onChange?.(e, value, reason, details) !== false) helpers.setValue(value);
				}}
			/>
		</FormControl>
	);
}
