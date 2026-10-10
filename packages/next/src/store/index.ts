import { combineReducers, configureStore, type UnknownAction } from '@reduxjs/toolkit';
import { debounce } from '@/helpers/delay';
import { saveState } from './persist';
import good from './reducers/goodReducer';
import main from './reducers/mainReducer';

const combinedReducer = combineReducers({ main, good });

export type RootState = ReturnType<typeof combinedReducer>;

export const initialState = combinedReducer(undefined, { type: '@@store/INIT' });

const REHYDRATE = 'persist/rehydrate';

function rootReducer(state: RootState | undefined, action: UnknownAction): RootState {
	if (action.type === REHYDRATE && action.payload) {
		return action.payload as RootState;
	}
	return combinedReducer(state, action);
}

export const store = configureStore({
	reducer: rootReducer,
	devTools: process.env.NODE_ENV === 'development',
});

store.subscribe(debounce(() => saveState(store.getState()), 500));

export type AppDispatch = typeof store.dispatch;

export function rehydrateStore(state: RootState) {
	store.dispatch({ type: REHYDRATE, payload: state });
}
