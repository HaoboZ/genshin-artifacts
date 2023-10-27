import { configureStore } from '@reduxjs/toolkit';
import { debounce } from '../helpers/delay';
import { loadState, saveState } from './persist';
import good from './reducers/goodReducer';
import main from './reducers/mainReducer';

export const store = configureStore({
	reducer: { main, good },
	devTools: process.env.NODE_ENV === 'development',
	preloadedState: loadState(),
});

store.subscribe(debounce(() => saveState(store.getState()), 500));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
