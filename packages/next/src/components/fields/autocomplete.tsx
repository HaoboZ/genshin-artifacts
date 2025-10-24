'use client';
import type { AutocompleteProps, ChipTypeMap } from '@mui/material';
import { Autocomplete } from '@mui/material';
import { useField } from 'formik';
import type { ElementType } from 'react';

export default function AutocompleteField<
	Value,
	Multiple extends boolean | undefined,
	DisableClearable extends boolean | undefined,
	FreeSolo extends boolean | undefined,
	ChipComponent extends ElementType = ChipTypeMap['defaultComponent'],
>({
	name,
	...props
}: { name: string; label?: string } & AutocompleteProps<
	Value,
	Multiple,
	DisableClearable,
	FreeSolo,
	ChipComponent
>) {
	const [field, , helpers] = useField(name);

	return (
		<Autocomplete
			{...field}
			{...props}
			onChange={(e, value, reason, details) => {
				// @ts-expect-error onChange return
				if (props.onChange?.(e, value, reason, details) !== false) helpers.setValue(value);
			}}
		/>
	);
}
