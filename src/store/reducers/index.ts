import { combineReducers } from '@reduxjs/toolkit';
import main from './mainReducer';

export const rootReducer = combineReducers({
	main,
});
