import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'GenshinArtifacts',
		short_name: 'GenshinArtifacts',
		description: 'Genshin Artifacts',
		categories: ['Genshin Impact'],
		scope: '/',
		start_url: '/',
		display: 'standalone',
		orientation: 'portrait',
		theme_color: '#ffffff',
		background_color: '#ffffff',
	};
}
