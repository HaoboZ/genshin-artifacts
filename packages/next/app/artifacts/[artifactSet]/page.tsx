import type { ArtifactSetKey } from '@/src/types/good';
import ArtifactSet from '.';

export default async function ArtifactSetPage({
	params,
}: {
	params: Promise<{ artifactSet: ArtifactSetKey }>;
}) {
	return <ArtifactSet artifactSet={(await params).artifactSet} />;
}
