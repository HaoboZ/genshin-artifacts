'use client';

import { Google } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { Fragment, useEffect, useState } from 'react';

import { saveAuthToken } from '@/app/settings/authActions';
import type { InitialAccount } from '@/app/settings/getInitialAccount';
import AsyncButton from '@/components/loaders/asyncButton';
import { auth, googleProvider } from '@/firebase';
import reportError from '@/helpers/reportError';

export default function AccountSignIn({
	initialAccount,
}: {
	initialAccount: InitialAccount | null;
}) {
	const { enqueueSnackbar } = useSnackbar();
	const router = useRouter();

	const [user, setUser] = useState(auth.currentUser);
	const [account, setAccount] = useState(initialAccount);

	useEffect(
		() =>
			onAuthStateChanged(auth, async (nextUser) => {
				setUser(nextUser);
				if (!nextUser) {
					setAccount(null);
					await saveAuthToken(null);
					router.refresh();
					return;
				}
				try {
					const token = await nextUser.getIdToken();
					await saveAuthToken(token);
					const response = await fetch(`${process.env.NEXT_PUBLIC_ROUTE_URL}/auth`, {
						headers: { Authorization: `Bearer ${token}` },
					});
					if (!response.ok) {
						const body = await response.text();
						let detail = body;
						try {
							const parsed = JSON.parse(body);
							if (typeof parsed.error === 'string') detail = parsed.error;
						} catch {
							// Use the response body when it is not JSON.
						}
						throw new Error(
							`Route server account check failed (${response.status}): ${detail || response.statusText}. Deploy the latest routes-worker and check NEXT_PUBLIC_ROUTE_URL.`,
						);
					}
					const account = await response.json();
					setAccount(account);
					router.refresh();
				} catch (error) {
					reportError(error, enqueueSnackbar);
				}
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const signInError = (error: unknown) => {
		const code =
			typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
		if (code === 'auth/configuration-not-found' || code === 'auth/operation-not-allowed') {
			return reportError(
				'Google sign-in is not enabled for this Firebase project. In Firebase Console, open Authentication → Sign-in method and enable Google.',
				enqueueSnackbar,
				'warning',
			);
		}
		if (code === 'auth/unauthorized-domain') {
			return reportError(
				'This site’s domain is not authorized. Add it under Firebase Authentication → Settings → Authorized domains.',
				enqueueSnackbar,
				'warning',
			);
		}
		return reportError(error, enqueueSnackbar);
	};

	return account ? (
		<Fragment>
			<Typography>
				Signed in as {user?.email ?? account.email}
				{account.admin ? ' : Admin' : ''}
			</Typography>
			<AsyncButton
				sx={{ width: 'fit-content' }}
				disabled={!user}
				variant='outlined'
				onClick={async () => {
					try {
						await signOut(auth);
					} catch (error) {
						signInError(error);
					}
				}}>
				Sign out
			</AsyncButton>
		</Fragment>
	) : (
		<AsyncButton
			sx={{ width: 'fit-content' }}
			variant='contained'
			startIcon={<Google />}
			onClick={async () => {
				try {
					await signInWithPopup(auth, googleProvider);
				} catch (error) {
					signInError(error);
				}
			}}>
			Sign in with Google
		</AsyncButton>
	);
}
