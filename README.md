# Barcoder

A barcode scanner web app for collaborative grocery shopping.

**Live:** [barcoder-one.vercel.app](https://barcoder-one.vercel.app/)

## What it does

When two people shop together but only one has the store's handheld scanner, the other person collects items without scanning them. At checkout, every item needs to be individually lifted and scanned. Barcoder solves this by letting the second person scan barcodes with their phone camera during shopping. When they meet up, the app displays each barcode on screen one at a time for the store's handheld scanner to read — no need to dig through the basket.

## Features

- Scan EAN-13/EAN-8/UPC-A barcodes via phone camera
- Store scanned items in lists with quantity tracking
- Sync mode: display barcodes one at a time for store scanner readback
- Mark items as defect for manual scanning
- Product name and image lookup via Open Food Facts API
- Dark mode with system preference detection
- Fully offline-capable data (localStorage)

## Tech

- React + TypeScript + Vite
- [html5-qrcode](https://github.com/nicedoc/html5-qrcode) for camera scanning
- [react-barcode](https://github.com/kciter/react-barcode) (JsBarcode) for rendering barcodes
- [Open Food Facts API](https://world.openfoodfacts.org/data) for product lookup
- All data stored in localStorage — no backend, no account required
- Product lookup results cached in localStorage for offline access
- Deployed on Vercel
