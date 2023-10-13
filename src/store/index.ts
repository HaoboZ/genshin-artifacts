import { configureStore } from '@reduxjs/toolkit';
import {
	createMigrate,
	FLUSH,
	PAUSE,
	PERSIST,
	persistReducer,
	persistStore,
	PURGE,
	REGISTER,
	REHYDRATE,
} from 'redux-persist';
import createCompressor from 'redux-persist-transform-compress';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import storage from 'redux-persist/lib/storage';
import { rootReducer } from './reducers';

export type RootState = ReturnType<typeof rootReducer>;

const migrations: Record<string, (state) => any> = {};

const persistedReducer = persistReducer<RootState>(
	{
		key: 'root',
		version: 1,
		storage,
		stateReconciler: autoMergeLevel2,
		migrate: createMigrate(migrations, { debug: false }),
		transforms: [createCompressor()],
	},
	rootReducer,
);

export const store = configureStore<RootState>({
	reducer: persistedReducer,
	devTools: process.env.NODE_ENV === 'development',
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}) as any,
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
