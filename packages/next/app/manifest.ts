import { type MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Genshin Artifacts',
		short_name: 'GenshinArtifacts',
		description: 'A site that tracks your characters, artifacts, and levels.',
		categories: ['Genshin Impact'],
		scope: '/',
		start_url: '/',
		display: 'standalone',
		orientation: 'portrait',
		theme_color: '#ffffff',
		background_color: '#ffffff',
	};
}
