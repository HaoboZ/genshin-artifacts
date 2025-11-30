import { NumberField as BaseNumberField } from '@base-ui-components/react';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';

export default function NumberSpinner({
	error,
	size = 'medium',
	...baseProps
}: BaseNumberField.Root.Props & {
	size?: 'small' | 'medium';
	error?: boolean;
}) {
	return (
		<BaseNumberField.Root
			{...baseProps}
			render={(props, state) => (
				<FormControl
					size={size}
					ref={props.ref}
					disabled={state.disabled}
					required={state.required}
					error={error}
					variant='outlined'
					sx={{
						'& .MuiButton-root': {
							'borderColor': 'divider',
							'minWidth': 0,
							'bgcolor': 'action.hover',
							'&:not(.Mui-disabled)': { color: 'text.primary' },
						},
					}}>
					{props.children}
				</FormControl>
			)}>
			<Box sx={{ display: 'flex' }}>
				<BaseNumberField.Decrement
					render={
						<Button
							variant='outlined'
							aria-label='Decrease'
							size={size}
							sx={{
								'p': 0.5,
								'borderTopRightRadius': 0,
								'borderBottomRightRadius': 0,
								'borderRight': 0,
								'&.Mui-disabled': { borderRight: 0 },
							}}
						/>
					}>
					<RemoveIcon fontSize={size} />
				</BaseNumberField.Decrement>
				<BaseNumberField.Input
					render={(props, state) => (
						<OutlinedInput
							inputRef={props.ref}
							value={state.inputValue}
							onBlur={props.onBlur}
							onChange={props.onChange}
							onKeyUp={props.onKeyUp}
							onKeyDown={props.onKeyDown}
							onFocus={props.onFocus}
							slotProps={{ input: { ...props, sx: { textAlign: 'center', p: 1 } } }}
							sx={{ pr: 0, borderRadius: 0, flex: 1, width: 50 }}
						/>
					)}
				/>
				<BaseNumberField.Increment
					render={
						<Button
							variant='outlined'
							aria-label='Increase'
							size={size}
							sx={{
								'p': 0.5,
								'borderTopLeftRadius': 0,
								'borderBottomLeftRadius': 0,
								'borderLeft': 0,
								'&.Mui-disabled': { borderLeft: 0 },
							}}
						/>
					}>
					<AddIcon fontSize={size} />
				</BaseNumberField.Increment>
			</Box>
		</BaseNumberField.Root>
	);
}
