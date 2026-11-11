# RANNU App

A responsive, installable family meal planner built as a lightweight static PWA. Menu and schedule data can be stored on the device or synced with Google Sheets through Apps Script.

## Features

- Responsive desktop and mobile navigation
- Recipe collection with grid and list views, search, and filters
- Pagination: 10 menus per grid page and 15 per list page
- Weekly meal picker covering carbohydrates, protein, vegetables, and fruit; dairy is optional
- Google Sheets and Drive integration through the Apps Script endpoint
- Local image compression and JSON backup / restore
- Offline app shell using a service worker

## Google Sheets and Drive

The deployed app has the Apps Script Web App URL configured. On a new device it tries to load menus and schedules from Sheets. In **Settings**, you can also load the sheet manually or upload the current device data. Loading replaces data on the current device; uploading replaces the rows in the connected `Menus` and `Schedules` tabs. Choose the source you want to keep before syncing.

The Apps Script source is in `google-apps-script/Code.gs`. It is configured for the spreadsheet and Drive folder supplied by the app owner. Run `setup()` once in Apps Script to create the `Menus` and `Schedules` tabs, then deploy or update a Web App deployment. The Web App URL used by the website must end in `/exec`.

Anyone who has the Web App URL may be able to read and replace the connected sheet data and upload images to the Drive folder. Keep the URL private and do not store sensitive information in this app.

## GitHub Pages

`.github/workflows/pages.yml` publishes the static app on pushes to `main`. In repository **Settings → Pages**, choose **GitHub Actions** as the source. Apps Script source is not included in the published Pages artifact.

## PWA installation

Open the website in Safari on iPhone, choose **Share → Add to Home Screen**, and confirm. Android browsers can install the app from the browser menu.

## Lightweight implementation

The app uses vanilla HTML, CSS, and JavaScript, with no runtime framework or external font requests. Images are resized to a maximum 900 px edge and encoded as WebP before saving. Menu data stays in browser storage for quick reads; sync happens only when a user loads or uploads Google Sheets data.
