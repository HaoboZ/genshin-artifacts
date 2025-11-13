import type { MenuItemProps } from '@mui/material';
import { MenuItem } from '@mui/material';
import useAsyncLoading from './useAsyncLoading';

export default function AsyncMenuItem({ onClick, ...props }: MenuItemProps) {
	const [loading, onClickLoading] = useAsyncLoading();

	return <MenuItem disabled={loading} onClick={onClickLoading(onClick)} {...props} />;
}
