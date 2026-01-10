import { prop } from 'remeda';
import sharp from 'sharp';
import { type Shot } from './types';

export default async function stitchShots(
	shots: Shot[],
	unitsPerPixelX: number,
	unitsPerPixelY: number,
) {
	if (shots.length === 0) throw Error('No shots provided');

	// get dimensions of a single shot
	const firstShot = await sharp(shots[0].buffer).metadata();
	const shotWidth = firstShot.width!;
	const shotHeight = firstShot.height!;

	// find the coordinate bounds
	const minX = Math.min(...shots.map(prop('centerX')));
	const maxX = Math.max(...shots.map(prop('centerX')));
	const minY = Math.min(...shots.map(prop('centerY')));
	const maxY = Math.max(...shots.map(prop('centerY')));

	// calculate the coordinate extent including shot dimensions
	const halfShotWidthInCoords = (shotWidth / 2) * unitsPerPixelX;
	const halfShotHeightInCoords = (shotHeight / 2) * unitsPerPixelY;

	const refX = minX - halfShotWidthInCoords;
	const refY = minY - halfShotHeightInCoords;

	const coordWidth = maxX + halfShotWidthInCoords - (minX - halfShotWidthInCoords);
	const coordHeight = maxY + halfShotHeightInCoords - (minY - halfShotHeightInCoords);

	const canvasWidth = Math.ceil(coordWidth / unitsPerPixelX);
	const canvasHeight = Math.ceil(coordHeight / unitsPerPixelY);

	console.info(`Canvas size: ${canvasWidth}x${canvasHeight}`);

	// create composites array - position each shot based on its actual coordinates
	const composites = shots.map(({ buffer, centerX, centerY }) => {
		// calculate pixel offset from reference point (refX, refY)
		const left = Math.round((centerX - refX) / unitsPerPixelX - shotWidth / 2);
		const top = Math.round((centerY - refY) / unitsPerPixelY - shotHeight / 2);

		return { input: buffer, top: top, left: left };
	});

	// create base canvas and composite all shots
	return await sharp({
		create: {
			width: canvasWidth,
			height: canvasHeight,
			channels: 4,
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		},
	})
		.composite(composites)
		.png()
		.toBuffer();
}
