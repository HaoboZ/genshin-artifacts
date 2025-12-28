'use client';
import { EventEmitter } from 'events';
import { createContext, type ReactNode, useContext, useState } from 'react';

const EventsContext = createContext<EventEmitter>(null);
EventsContext.displayName = 'Events';

export default function EventsProvider({ children }: { children: ReactNode }) {
	const [events] = useState(() => new EventEmitter());

	return <EventsContext value={events}>{children}</EventsContext>;
}

export function useEvents() {
	return useContext(EventsContext);
}
