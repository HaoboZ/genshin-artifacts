import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const app = getApps().length
	? getApp()
	: initializeApp({
			apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
			authDomain: 'genshin-artifacts.firebaseapp.com',
			projectId: 'genshin-artifacts',
			storageBucket: 'genshin-artifacts.firebasestorage.app',
			messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
			appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
			measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
		});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
