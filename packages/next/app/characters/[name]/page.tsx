import { charactersInfo } from '@/api/characters';
import { notFound } from 'next/navigation';
import Character from './index';

export default async function CharacterPage({ params }: { params: Promise<{ name: string }> }) {
	const { name } = await params;
	const characterData = charactersInfo[name];
	if (!characterData) notFound();

	return <Character characterData={characterData} />;
}
