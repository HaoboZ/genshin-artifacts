import { type ArtifactSetKey } from '@/types/good';
import ArtifactSet from './index';

export default async function ArtifactSetPage({
	params,
}: {
	params: Promise<{ artifactSet: ArtifactSetKey }>;
}) {
	const { artifactSet } = await params;
	return <ArtifactSet artifactSet={artifactSet} />;
}
