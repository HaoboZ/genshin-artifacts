import { routesInfo } from '@/api/routes';
import { MenuItem, Select, type SelectProps } from '@mui/material';

export default function RouteSelect(props: SelectProps<number>) {
	return (
		<Select size='small' {...props}>
			{routesInfo.map(({ spots, mora, exp }, index) => (
				<MenuItem key={index} value={index}>
					Spots: {spots}, Mora: {mora}, Exp: {exp}
				</MenuItem>
			))}
		</Select>
	);
}
