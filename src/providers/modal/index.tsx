import { CircularProgress } from '@mui/material';
import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import type { ComponentType, ReactNode } from 'react';
import { createContext, Suspense, useContext, useState } from 'react';

type ModalStatus<T> = {
	id: string;
	open: boolean;
	Component: ComponentType<T>;
	props: T;
	controls: ModalControlsType;
};

type ModalType = {
	showModal: <T>(Component: ComponentType<T>, args?: { id?: string; props?: T }) => string;
	closeModal: (id?: string) => void;
	modalStatus: (id: string) => Promise<ModalStatus<any>>;
};

const ModalContext = createContext<ModalType>({
	showModal: () => null,
	closeModal: () => null,
	modalStatus: () => null,
});
ModalContext.displayName = 'Modal';

export type ModalControlsType = {
	modalStatus: ModalStatus<any>;
	closeModal: (...args) => void;
	events: EventEmitter;
};

const ModalControlsContext = createContext<ModalControlsType>({
	modalStatus: null,
	closeModal: () => null,
	events: null,
});
ModalControlsContext.displayName = 'ModalControls';

export default function ModalProvider({ children }: { children: ReactNode }) {
	const [modals, setModals] = useState<ModalStatus<any>[]>([]);

	function controls(id: string): ModalControlsType {
		return {
			modalStatus: null,
			closeModal: (...args) =>
				setModals((modals) => {
					const index = modals.findIndex((modal) => modal.id === id);
					if (index === -1) return modals;
					const newModals = [...modals];
					newModals[index] = {
						...newModals[index],
						open: false,
					};
					newModals[index].controls.events.emit('close', ...args);
					setTimeout(
						() => setModals((modals) => modals.filter((modal) => modal.id !== id)),
						250,
					);
					return newModals;
				}),
			events: new EventEmitter(),
		};
	}

	return (
		<ModalContext.Provider
			value={{
				showModal: (Component, { id = nanoid(), props } = {}) => {
					setModals((modals) => {
						const index = modals.findIndex((modal) => modal.id === id);
						const newModals = [...modals];
						if (index === -1) {
							newModals.push({
								id,
								open: false,
								Component,
								props,
								controls: controls(id),
							});
						} else {
							// found modal with same id
							newModals[index] = {
								...newModals[index],
								props,
							};
							if (newModals[index].open) return newModals;
						}
						setTimeout(
							() =>
								setModals((modals) => {
									const index = modals.findIndex((modal) => modal.id === id);
									if (index === -1) return modals;
									const newModals = [...modals];
									newModals[index].controls.events.emit('open');
									newModals[index] = {
										...newModals[index],
										open: true,
									};
									return newModals;
								}),
							0,
						);
						return newModals;
					});
					return id;
				},
				closeModal: (id) => {
					if (!id) return modals.forEach((modal) => modal.controls.closeModal());
					const modal = modals.find((modal) => modal.id === id);
					modal?.controls.closeModal();
				},
				modalStatus: async (id) =>
					await new Promise((resolve) =>
						setModals((modals) => {
							resolve(modals.find((modal) => modal.id === id));
							return modals;
						}),
					),
			}}>
			{children}
			{modals.map((modal) => (
				<ModalControlsContext.Provider
					key={modal.id}
					value={{
						...modal.controls,
						modalStatus: modal,
					}}>
					<Suspense fallback={<CircularProgress />}>
						<modal.Component {...modal.props} />
					</Suspense>
				</ModalControlsContext.Provider>
			))}
		</ModalContext.Provider>
	);
}

export function useModal() {
	return useContext(ModalContext);
}

export function withModal(Component) {
	return (props) => (
		<ModalContext.Consumer>
			{(modal) => <Component modal={modal} {...props} />}
		</ModalContext.Consumer>
	);
}

export function useModalControls() {
	return useContext(ModalControlsContext);
}
