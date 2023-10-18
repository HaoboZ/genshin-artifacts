import { EventEmitter } from 'events';
import type { ComponentType, ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

const EventsContext = createContext<EventEmitter>(null);
EventsContext.displayName = 'Events';

export default function EventsProvider({ children }: { children: ReactNode }) {
	const [events] = useState(() => new EventEmitter());

	return <EventsContext.Provider value={events}>{children}</EventsContext.Provider>;
}

export function useEvents() {
	return useContext(EventsContext);
}

export function withEvents<P>(Component: ComponentType<P>) {
	return (props: P) => (
		<EventsContext.Consumer>
			{(events) => <Component events={events} {...props} />}
		</EventsContext.Consumer>
	);
}
