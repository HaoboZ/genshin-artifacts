'use client';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

const DataContext = createContext<any>(null);
DataContext.displayName = 'Data';

export default function DataProvider({ children, data }: { children: ReactNode; data: any }) {
	return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useData<T = any>() {
	return useContext<T>(DataContext);
}

export function withData(Component) {
	return (props) => (
		<DataContext.Consumer>{(data) => <Component data={data} {...props} />}</DataContext.Consumer>
	);
}
