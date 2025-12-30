'use server';
import { type Point } from '@/components/imageRoute/types';
import fs from 'fs';
import path from 'path';

export async function savePointsServer(points: Point[], name: string) {
	const parts = name.split('/');
	const fileName = `${parts.pop()}.json`;
	const folderPath = path.join(process.cwd(), 'public/points', ...parts);

	// create folder if it doesn't exist
	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, { recursive: true });
	}

	fs.writeFileSync(path.join(folderPath, fileName), JSON.stringify(points, null, 2));
}
