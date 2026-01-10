import captureMap from './captureMap';
import measureUnits from './measureUnits';
import processAndSave from './processAndSave';
import setupBrowser from './setupBrowser';
import stitchShots from './stitchShots';

const { browser, page } = await setupBrowser(1280, 720);
const { unitsPerPixelX, unitsPerPixelY } = await measureUnits(page);
const shots = await captureMap(page);
const buffer = await stitchShots(shots, unitsPerPixelX, unitsPerPixelY);
await processAndSave(buffer, '../next/public/images/teyvat.png');
await browser.close();
