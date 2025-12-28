import { type ArtifactSetKey } from '@/types/good';
import ArtifactSet from './index';

export default async function ArtifactSetPage({
	params,
}: {
	params: Promise<{ artifactSet: ArtifactSetKey }>;
}) {
	return <ArtifactSet artifactSet={(await params).artifactSet} />;
}
