# 🚀 Sehatkor Fast Indexing Guide

Google ko aapke pages index karne mein waqt lag raha hai kyunke aapki site React SPA hai. Iska hal **Google Indexing API** hai jo pages ko 24 ghanton ke andar index kara deta hai.

## Step-by-Step Setup

### 1. Google Cloud Console (API Enable karein)
*   [Google Cloud Console](https://console.cloud.google.com/) par jayen.
*   Naya project banayen (naam: `Sehatkor-Indexing`).
*   **APIs & Services** > **Library** mein jayen aur **"Indexing API"** search karke **Enable** karein.

### 2. Service Account Banayen
*   **IAM & Admin** > **Service Accounts** mein jayen.
*   **Create Service Account** par click karein.
*   Naam rakhein `indexer-bot` aur **Create and Continue** karein.
*   Role chunein: **Owner** ya **Project Editor**.
*   Ban'ne ke baad us account par click karein aur **Keys** tab mein jayen.
*   **Add Key** > **Create New Key** > **JSON** select karein.
*   File download ho jayegi. Is file ka naam badal kar `service-account.json` rakhein.

### 3. Key File Ko Server Mein Rakhein
*   Jo file download ki hai (`service-account.json`), usse `server/` folder ke andar paste kar dein.

### 4. Search Console mein Access Dein
*   Apne Service Account ki email copy karein (maslan: `indexer-bot@...iam.gserviceaccount.com`).
*   [Google Search Console](https://search.google.com/search-console) mein jayen.
*   **Settings** > **Users and Permissions** > **Add User** par click karein.
*   Service Account ki email dalein aur permission **"Owner"** rakhein (ye zaroori hai).

## Indexing Shuru Karein

Ab aap terminal mein `server/` directory mein jayen aur ye command run karein:

```bash
node utils/google-indexing.js
```

Yeh script aapke sitemap se saare URLs uthayega aur Google ko notify karega.

## Kya is se site kharab hogi?
**Nahi!** Yeh Google ka official tareeqa hai content submit karne ka. Is se aapki site ki speed ya functionality par koi asar nahi padega, sirf Google ko signal milega ke naya content ready hai.
