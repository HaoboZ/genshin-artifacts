import { put } from '@vercel/blob';
import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';

const folderPath = process.argv[2];

if (!folderPath) {
	console.error('Please provide a folder path');
	process.exit(1);
}

await uploadFolder(`public/${folderPath}`);

async function uploadFolder(folderPath: string) {
	const files = await getAllFiles(folderPath);

	for (let i = 0; i < files.length; i++) {
		const filePath = files[i];
		const relativePath = relative('public', filePath).replace(/\\/g, '/');

		try {
			console.log(`[${i + 1}/${files.length}] Uploading: ${relativePath}`);

			const fileContent = await readFile(filePath);
			await put(relativePath, fileContent, { access: 'public' });
		} catch (error) {
			console.error(`Failed to upload ${relativePath}:`, error.message);
		}
	}
}

async function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
	const files = await readdir(dirPath);

	for (const file of files) {
		const fullPath = join(dirPath, file);
		const fileStat = await stat(fullPath);

		if (fileStat.isDirectory()) {
			arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles);
		} else {
			arrayOfFiles.push(fullPath);
		}
	}

	return arrayOfFiles;
}
