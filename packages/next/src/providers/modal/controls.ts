import { EventEmitter } from 'events';
import { createContext, useContext } from 'react';
import { ModalState } from '.';

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

export function useModalControls() {
	return useContext(ModalControlsContext);
}
