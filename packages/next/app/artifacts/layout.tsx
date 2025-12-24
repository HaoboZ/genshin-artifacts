import PageContainer from '@/components/page/container';
import PageTitle from '@/components/page/title';
import Script from 'next/script';
import { type ReactNode } from 'react';
import ArtifactSetFilter from './artifactSetFilter';

export default function ArtifactLayout({ children }: { children: ReactNode }) {
	return (
		<PageContainer>
			<PageTitle>Artifacts</PageTitle>
			<Script src='https://docs.opencv.org/4.x/opencv.js' />
			<ArtifactSetFilter />
			{children}
		</PageContainer>
	);
}
