import PageContainer from '@/components/page/container';
import PageTitle from '@/components/page/title';
import type { ReactNode } from 'react';
import ArtifactSetFilter from './artifactSetFilter';

export default function ArtifactLayout({ children }: { children: ReactNode }) {
	return (
		<PageContainer>
			<PageTitle>Artifacts</PageTitle>
			<ArtifactSetFilter />
			{children}
		</PageContainer>
	);
}
