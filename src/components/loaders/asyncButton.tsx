'use client';
import type { ButtonProps } from '@mui/joy';
import { Button } from '@mui/joy';
import useAsyncLoading from './useAsyncLoading';

export default function AsyncButton({ onClick, ...props }: ButtonProps) {
	const [loading, onClickLoading] = useAsyncLoading();

	return <Button loading={loading} onClick={onClickLoading(onClick)} {...props} />;
}
