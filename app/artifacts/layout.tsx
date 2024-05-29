import PageContainer from '@/components/page/container';
import PageTitle from '@/components/page/title';
import { ReactNode } from 'react';
import ArtifactSetFilter from './artifactSetFilter';

export default function ArtifactLayout({ children }: { children: ReactNode }) {
	return (
		<PageContainer noSsr>
			<PageTitle>Artifacts</PageTitle>
			<ArtifactSetFilter />
			{children}
		</PageContainer>
	);
}
