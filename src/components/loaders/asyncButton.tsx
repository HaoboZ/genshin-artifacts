'use client';
import type { LoadingButtonProps } from '@mui/lab';
import { LoadingButton } from '@mui/lab';
import useAsyncLoading from './useAsyncLoading';

export default function AsyncButton({ onClick, ...props }: LoadingButtonProps) {
	const [loading, onClickLoading] = useAsyncLoading();

	return <LoadingButton loading={loading} onClick={onClickLoading(onClick)} {...props} />;
}
