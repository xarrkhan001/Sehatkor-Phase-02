/**
 * Sehatkor Instant Indexer
 * Uses Google Indexing API to notify Google about new/updated pages immediately.
 * 
 * SETUP:
 * 1. Create a project in Google Cloud Console.
 * 2. Enable "Indexing API".
 * 3. Create a Service Account and download the JSON key file.
 * 4. Add the service account email as an "Owner" in Google Search Console.
 * 5. Place the JSON key file in the server root as 'service-account.json'.
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const KEY_FILE = path.join(process.cwd(), 'service-account.json');
const SITEMAP_URL = 'https://sehatkor.pk/api/sitemap.xml';

async function indexUrls() {
    if (!fs.existsSync(KEY_FILE)) {
        console.error('❌ Error: service-account.json not found! Please follow the setup instructions.');
        return;
    }

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });

        const client = await auth.getClient();
        const indexing = google.indexing({ version: 'v3', auth: client as any });

        console.log('🔍 Fetching latest URLs from sitemap...');
        const response = await axios.get(SITEMAP_URL);
        const xml = response.data;

        // Simple regex to extract URLs from sitemap
        const urls = [];
        const matches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
        for (const match of matches) {
            urls.push(match[1]);
        }

        console.log(`🚀 Found ${urls.length} URLs. Starting indexing...`);

        for (const url of urls) {
            try {
                await indexing.urlNotifications.publish({
                    requestBody: {
                        url: url,
                        type: 'URL_UPDATED',
                    },
                });
                console.log(`✅ Submitted: ${url}`);
                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err: any) {
                console.error(`❌ Failed: ${url} - ${err.message}`);
            }
        }

        console.log('\n✨ All done! Google has been notified of your latest content.');
    } catch (error: any) {
        console.error('❌ Indexing failed:', error.message);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    indexUrls();
}

export default indexUrls;
