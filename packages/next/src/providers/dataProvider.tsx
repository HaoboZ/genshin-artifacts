import { createContext, type ReactNode, useContext } from 'react';

const DataContext = createContext<any>(null);
DataContext.displayName = 'Data';

export default function DataProvider({ children, data }: { children: ReactNode; data: any }) {
	return <DataContext value={data}>{children}</DataContext>;
}

export function useData<T = any>() {
	return useContext<T>(DataContext);
}
