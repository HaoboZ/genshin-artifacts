import { Button, type ButtonProps } from '@mui/material';
import useAsyncLoading from './useAsyncLoading';

export default function AsyncButton({ onClick, ...props }: ButtonProps) {
	const [loading, onClickLoading] = useAsyncLoading();

	return <Button loading={loading} onClick={onClickLoading(onClick)} {...props} />;
}
