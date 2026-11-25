'use client';

import { onAuthStateChanged } from 'firebase/auth';
import Script from 'next/script';
import { useEffect } from 'react';

import { auth } from '@/firebase';

let oneSignalInit: Promise<void> | undefined;

export default function OneSignalUserSync() {
	useEffect(
		() =>
			onAuthStateChanged(auth, (user) => {
				window.OneSignalDeferred = window.OneSignalDeferred || [];
				window.OneSignalDeferred.push(async (OneSignal) => {
					try {
						oneSignalInit ??= OneSignal.init({
							appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
						});
						await oneSignalInit;
						if (user) await OneSignal.login(user.uid);
						else await OneSignal.logout();
					} catch (error) {
						console.warn('OneSignal account linking failed', error);
					}
				});
			}),
		[],
	);

	return <Script src='https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js' />;
}
