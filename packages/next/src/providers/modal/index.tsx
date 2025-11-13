'use client';
import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import type { ComponentType, ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import { ModalControlsContext, UseModalControls } from './controls';

export type ModalState<T = any> = {
	id: string;
	open: boolean;
	Component: ComponentType<T>;
	props: T;
	controls: UseModalControls;
};

type ShowModalOptions<T> = {
	id?: string;
	props?: T;
};

type UseModal = {
	modalStates: ModalState[];
	showModal: <T>(Component: ComponentType<T>, args?: ShowModalOptions<T>) => string;
	closeModal: (id?: string) => void;
};

const ModalContext = createContext<UseModal>({
	modalStates: [],
	showModal: () => null,
	closeModal: () => null,
});
ModalContext.displayName = 'Modal';

export default function ModalProvider({ children }: { children: ReactNode }) {
	const [modalStates, setModalStates] = useState<ModalState[]>([]);

	const createControls = (id: string): UseModalControls => ({
		modalState: null,
		closeModal: (...args) => {
			setModalStates((modals) => {
				const index = modals.findIndex((modal) => modal.id === id);
				if (index === -1) return modals;
				const newModals = [...modals];
				const modal = newModals[index];
				newModals[index] = { ...modal, open: false };
				modal.controls.events.emit('close', ...args);
				setTimeout(() => {
					modal.controls.events.removeAllListeners();
					setModalStates((modals) => modals.filter((modal) => modal.id !== id));
				}, 250);
				return newModals;
			});
		},
		events: new EventEmitter(),
	});

	return (
		<ModalContext.Provider
			value={{
				modalStates,
				showModal: (Component, { id = nanoid(), props } = {}) => {
					setModalStates((modals) => {
						const index = modals.findIndex((modal) => modal.id === id);
						const newModals = [...modals];
						if (index === -1) {
							newModals.push({
								id,
								open: false,
								Component,
								props,
								controls: createControls(id),
							});
						} else {
							newModals[index] = { ...newModals[index], props };
							if (newModals[index].open) return newModals;
						}
						setTimeout(() => {
							setModalStates((modals) => {
								const index = modals.findIndex((modal) => modal.id === id);
								if (index === -1) return modals;
								const newModals = [...modals];
								newModals[index].controls.events.emit('open');
								newModals[index] = { ...newModals[index], open: true };
								return newModals;
							});
						}, 0);
						return newModals;
					});
					return id;
				},
				closeModal: (id) => {
					if (!id) return modalStates.forEach((modal) => modal.controls.closeModal());
					const modal = modalStates.find((modal) => modal.id === id);
					modal?.controls.closeModal();
				},
			}}>
			{children}
			{modalStates.map((modalState) => (
				<ModalControlsContext.Provider
					key={modalState.id}
					value={{ ...modalState.controls, modalState }}>
					<modalState.Component {...modalState.props} />
				</ModalControlsContext.Provider>
			))}
		</ModalContext.Provider>
	);
}

export function useModal() {
	return useContext(ModalContext);
}

export function withModal<P>(Component: ComponentType<P & { modal: UseModal }>) {
	return (props: P) => (
		<ModalContext.Consumer>
			{(modal) => <Component modal={modal} {...props} />}
		</ModalContext.Consumer>
	);
}
