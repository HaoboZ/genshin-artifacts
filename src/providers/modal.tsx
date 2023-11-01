import type { ModalProps } from '@mui/joy';
import { CircularProgress, Modal } from '@mui/joy';
import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import type { ComponentType, ReactNode } from 'react';
import { createContext, forwardRef, Suspense, useContext, useState } from 'react';

type ModalState<T> = {
	id: string;
	open: boolean;
	Component: ComponentType<T>;
	modalProps: ModalProps;
	props: T;
	controls: ModalControlsType;
};

type ModalType = {
	modalStates: ModalState<any>[];
	showModal: <T>(
		Component: ComponentType<T>,
		args?: { id?: string; modalProps?: ModalProps; props?: T },
	) => string;
	closeModal: (id?: string) => void;
};

const ModalContext = createContext<ModalType>({
	modalStates: [],
	showModal: () => null,
	closeModal: () => null,
});
ModalContext.displayName = 'Modal';

export type ModalControlsType = {
	modalState: ModalState<any>;
	closeModal: (...args) => void;
	events: EventEmitter;
};

const ModalControlsContext = createContext<ModalControlsType>({
	modalState: null,
	closeModal: () => null,
	events: null,
});
ModalControlsContext.displayName = 'ModalControls';

export default function ModalProvider({ children }: { children: ReactNode }) {
	const [modalStates, setModalStates] = useState<ModalState<any>[]>([]);

	function controls(id: string): ModalControlsType {
		return {
			modalState: null,
			closeModal: (...args) =>
				setModalStates((modals) => {
					const index = modals.findIndex((modal) => modal.id === id);
					if (index === -1) return modals;
					const newModals = [...modals];
					newModals[index] = { ...newModals[index], open: false };
					newModals[index].controls.events.emit('close', ...args);
					setTimeout(
						() => setModalStates((modals) => modals.filter((modal) => modal.id !== id)),
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
				modalStates,
				showModal: (Component, { id = nanoid(), modalProps, props } = {}) => {
					setModalStates((modals) => {
						const index = modals.findIndex((modal) => modal.id === id);
						const newModals = [...modals];
						if (index === -1) {
							newModals.push({
								id,
								open: false,
								Component: forwardRef(Component as any) as any,
								modalProps,
								props,
								controls: controls(id),
							});
						} else {
							newModals[index] = { ...newModals[index], props };
							if (newModals[index].open) return newModals;
						}
						setTimeout(
							() =>
								setModalStates((modals) => {
									const index = modals.findIndex((modal) => modal.id === id);
									if (index === -1) return modals;
									const newModals = [...modals];
									newModals[index].controls.events.emit('open');
									newModals[index] = { ...newModals[index], open: true };
									return newModals;
								}),
							0,
						);
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
					<Suspense fallback={<CircularProgress />}>
						<Modal
							open={modalState.open}
							onClose={modalState.controls.closeModal}
							{...modalState.modalProps}>
							<modalState.Component {...modalState.props} />
						</Modal>
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
