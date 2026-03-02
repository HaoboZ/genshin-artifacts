import captureMap from './src/captureMap';
import measureUnits from './src/measureUnits';
import processAndSave from './src/processAndSave';
import setupBrowser from './src/setupBrowser';
import stitchShots from './src/stitchShots';

const { browser, page } = await setupBrowser(1280, 720);
const { unitsPerPixelX, unitsPerPixelY } = await measureUnits(page);
const shots = await captureMap(page);
const image = await stitchShots(shots, unitsPerPixelX, unitsPerPixelY);
await processAndSave(image, 'output/teyvat.png');
await browser.close();
