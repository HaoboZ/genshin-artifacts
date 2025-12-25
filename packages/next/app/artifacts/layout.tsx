import PageTitle from '@/components/page/title';
import { Container } from '@mui/material';
import Script from 'next/script';
import { type ReactNode } from 'react';
import ArtifactSetFilter from './artifactSetFilter';

export default function ArtifactLayout({ children }: { children: ReactNode }) {
	return (
		<Container>
			<PageTitle>Artifacts</PageTitle>
			<Script src='https://docs.opencv.org/4.x/opencv.js' />
			<ArtifactSetFilter />
			{children}
		</Container>
	);
}
