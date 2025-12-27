import { type EventEmitter } from 'events';
import { createContext, useContext } from 'react';
import { type ModalState } from './index';

export type UseModalControls = {
	modalState: ModalState;
	closeModal: (...args: any[]) => void;
	events: EventEmitter;
};

export const ModalControlsContext = createContext<UseModalControls>({
	modalState: null,
	closeModal: () => null,
	events: null,
});
ModalControlsContext.displayName = 'ModalControls';

export default function useModalControls() {
	return useContext(ModalControlsContext);
}
