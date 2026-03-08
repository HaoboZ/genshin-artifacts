import { Autocomplete, type AutocompleteProps, type ChipTypeMap } from '@mui/material';
import { type ElementType } from 'react';
import { type FieldPath, type FieldValues, useController, useFormContext } from 'react-hook-form';

export default function AutocompleteField<
	TFieldValues extends FieldValues = FieldValues,
	Value = unknown,
	Multiple extends boolean | undefined = undefined,
	DisableClearable extends boolean | undefined = undefined,
	FreeSolo extends boolean | undefined = undefined,
	ChipComponent extends ElementType = ChipTypeMap['defaultComponent'],
>({
	name,
	...props
}: { name: FieldPath<TFieldValues>; label?: string } & AutocompleteProps<
	Value,
	Multiple,
	DisableClearable,
	FreeSolo,
	ChipComponent
>) {
	const { control, setValue } = useFormContext<TFieldValues>();
	const { field } = useController({ name, control });

	return (
		<Autocomplete
			{...field}
			{...props}
			onChange={(e, value, reason, details) => {
				// @ts-expect-error onChange return
				if (props.onChange?.(e, value, reason, details) !== false) setValue(name, value);
			}}
		/>
	);
}
