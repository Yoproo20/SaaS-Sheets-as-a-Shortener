# SaaS: Sheets as a Shortener

**SaaS** (Sheets as a Shortener) is a lightweight, serverless URL shortening service. It leverages **Cloudflare Workers** for global edge delivery and uses **Google Sheets** as a free, user-friendly database (CMS).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Cloudflare%20Workers-orange)
![Database](https://img.shields.io/badge/database-Google%20Sheets-green)

## ✨ Features

* **Zero Cost**: Runs entirely on free tiers of Cloudflare and Google.
* **High Performance**: Deployed on Cloudflare's global edge network.
* **Easy Management**: Add or edit links directly in Google Sheets—no coding required for daily use.
* **Smart Caching**: Implements a "Stale-While-Revalidate" strategy. It serves cached data for speed but forces a refresh if a short link is not found (handling new links instantly).

## 🚀 How It Works

1.  The user visits `https://your-shortener.com/meet`.
2.  Cloudflare Worker checks its local cache.
3.  If the link is new or the cache is expired, it fetches the latest data from Google Sheets.
4.  The user is redirected to the destination URL (e.g., your Google Meet link).


## 🛠️ Installation & Setup

### Step 1: Prepare Google Sheets (The Database)

1.  Create a new [Google Sheet](https://sheets.google.com).
2.  Rename the first sheet (tab) if you like, or keep it default.
3.  Set up two columns:
    * **Column A**: Short Code (e.g., `fb`, `ig`, `blog`)
    * **Column B**: Target URL (e.g., `https://facebook.com`)
4. If you want, you can add the **Column C**: for convenience to copy and paste. Add `="https://your-shortener.com/"&A2`

![alt text](/pic/image.png)

### Step 2: Deploy Google Apps Script (The API)

We need to turn your spreadsheet into a JSON API so the Worker can read it.

1.  In your Google Sheet, go to **Extensions** > **Apps Script**.
2.  Delete any existing code and paste the following:

    ```javascript
    function doGet(e) {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("$$your-sheet-name$$");// remember to replace $$your-sheet-name$$
        const data = sheet.getDataRange().getValues(); 
        const result = {};
        for (let i = 1; i < data.length; i++) {
            const code = data[i][0];
            const url = data[i][1];
            if (code && url) result[code] = url;
        }
        return ContentService
            .createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
    }

    ```

3.  Click **Deploy** > **New deployment**.
4.  Click the "Select type" (gear icon) and choose **Web app**.
5.  **Crucial Settings**:
    * **Description**: `SaaS API`
    * **Execute as**: `Me` (your email)
    * **Who has access**: `Anyone` (This allows Cloudflare to fetch the data)
6.  Click **Deploy** and copy the **Web App URL**. You will need this later.
![alt text](/pic/image2.png)

### Step 3: Deploy Cloudflare Worker (The Frontend)

1.  Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Workers & Pages**.
2.  Create a generic "Hello World" Worker.
3.  Click **Edit Code**.
4.  Copy the content of `index.js` (from this repo) and paste it into the editor.
5.  Update the `SHEET_API` variable at the top of the file with your **Web App URL** from Step 2.

    ```javascript
    const SHEET_API = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
    ```
6.  Click **Deploy**.

![alt text](/pic/image3.png)

### Step 4: Configure Custom Domain (Routes)

To use your own domain (e.g., `go.sunz.tw/meet`) instead of the long `*.workers.dev` subdomain:

1.  Go to your Worker's dashboard.
2.  Navigate to **Settings** > **Domains & Routes**.
3.  Click **+ Add** under "Routes".
4.  Enter your desired route pattern. For example: `go.yourdomain.com/*`.
    * *Note: Make sure the domain `yourdomain.com` is already active on Cloudflare.*
5.  Select the **Zone** corresponding to your domain.
6.  Click **Add Route**.

Now, all traffic to `go.yourdomain.com/xyz` will be handled by your Worker!

![alt text](/pic/image4.png)

## ⚙️ Configuration

You can adjust the caching behavior in `index.js`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `SHEET_API` | The endpoint of your Google Apps Script. | (Required) |
| `CACHE_TTL` | How long (in ms) to keep the data before refreshing. | `60000` (1 min) |



## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.