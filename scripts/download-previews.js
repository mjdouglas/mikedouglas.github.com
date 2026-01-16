// Script to scrape Spotify preview URLs and download MP3 files
// Run with: node scripts/download-previews.js

import { chromium } from 'playwright';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { pipeline } from 'stream/promises';
import path from 'path';

const tracks = {
  classic: '2WfaOiMkCvy7F5fcp2zZ8L',    // Take On Me
  miami: '1eyzqe2QqGZUmfcPZtrIyt',       // Midnight City
  synthwave: '0U0ldCRmgCqhVvD6ksG63j',   // Nightcall
  neonTokyo: '2uXlHiOE4o5xHOCiob8DKn',   // Flyday Chinatown
  sunset: '3WRQUvzRvBDr4AxMWhXc5E',      // Sunset Lover
  ocean: '5626KdflSKfeDK7RJQfSrE',       // Says
  aurora: '07eGxuz8bL6QMsRqEe1Adu',      // Svefn-g-englar
  candy: '3TGRqZ0a2l1LRblBkJoaDx',       // Call Me Maybe
  fire: '6nnacTL5on2aVsRhVDNUSo',        // Through the Fire and Flames
  ice: '5VfEuwErhx6X4eaPbyBfyu',         // Intro
  forest: '35KiiILklye1JRRctaLUb4',      // Holocene
  galaxy: '72Z17vmmeQKAg8bptWvpVG',      // Space Oddity
};

const audioDir = path.join(process.cwd(), 'audio');

async function downloadFile(url, filePath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download: ${response.status}`);
  await pipeline(response.body, createWriteStream(filePath));
}

async function scrapePreviewUrl(page, trackId) {
  const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;

  // Intercept network requests to find the preview URL
  let previewUrl = null;

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('p.scdn.co/mp3-preview') || url.includes('audio-ak-spotify')) {
      previewUrl = url;
    }
  });

  await page.goto(embedUrl, { waitUntil: 'networkidle' });

  // Also try to extract from page content/scripts
  if (!previewUrl) {
    const content = await page.content();
    const match = content.match(/https:\/\/p\.scdn\.co\/mp3-preview\/[^"'\s]+/);
    if (match) {
      previewUrl = match[0];
    }
  }

  // Try clicking play to trigger the audio request
  if (!previewUrl) {
    try {
      await page.click('[data-testid="play-button"], button[aria-label*="Play"]', { timeout: 3000 });
      await page.waitForTimeout(2000);
    } catch (e) {
      // Play button might not be available
    }
  }

  return previewUrl;
}

async function main() {
  // Create audio directory
  await mkdir(audioDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {};

  for (const [name, trackId] of Object.entries(tracks)) {
    console.log(`\nProcessing ${name} (${trackId})...`);

    try {
      const previewUrl = await scrapePreviewUrl(page, trackId);

      if (previewUrl) {
        console.log(`  Found preview URL: ${previewUrl.substring(0, 60)}...`);

        const filePath = path.join(audioDir, `${name}.mp3`);
        await downloadFile(previewUrl, filePath);
        console.log(`  Downloaded to: ${filePath}`);
        results[name] = { success: true, file: `audio/${name}.mp3` };
      } else {
        console.log(`  No preview URL found`);
        results[name] = { success: false, error: 'No preview URL found' };
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`);
      results[name] = { success: false, error: error.message };
    }
  }

  await browser.close();

  console.log('\n=== Results ===');
  console.log(JSON.stringify(results, null, 2));

  const successful = Object.values(results).filter(r => r.success).length;
  console.log(`\nDownloaded ${successful}/${Object.keys(tracks).length} tracks`);
}

main().catch(console.error);
