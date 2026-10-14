# Orang Sweet Plazza: Website + Admin Portal

Orange and white sweet-shop website with a Diwali welcome section and an admin portal
to edit everything. No `npm install` needed (uses only built-in Node.js).

## Run
1. Install Node.js 18+ (https://nodejs.org)
2. In this folder:
   - Mac/Linux: `ADMIN_PASSWORD="your-strong-password" node server.js`
   - Windows (PowerShell): `$env:ADMIN_PASSWORD="your-strong-password"; node server.js`
3. Website: http://localhost:3000   Admin: http://localhost:3000/admin/
   (If you do not set ADMIN_PASSWORD, the default is `admin123`. Change it before going live.)

## What you can edit in /admin
General (name, phone, WhatsApp, colour, announcement, popup, coupon), Welcome/Hero (title, buttons,
background video upload or YouTube link, photo, fireworks on/off), Categories, Products (add, edit,
delete, reorder, duplicate, photo, price, hide), Trust badges, Promo banners, Our Story,
Corporate gifting, Outlets, Footer links, Media library (upload/delete photos and videos).
Click "Save changes" to publish. The previous version is kept in data/site.backup.json.

## Folder structure
    server.js            Node server, API, uploads, login
    data/site.json       ALL website content (edited by admin)
    uploads/             Photos and videos you upload
    public/index.html    Website page
    public/css/          base.css, layout.css, sections.css
    public/js/           util.js, fx.js (fireworks), render.js, cart.js, app.js
    public/admin/        Admin portal (index.html, admin.css, admin.js)

## Going live
You need a host that runs Node.js (VPS, Render, Railway, etc.) with a persistent disk for
data/ and uploads/. Static hosts such as GitHub Pages will not work. Use HTTPS, keep the
admin password secret, and back up data/ and uploads/ regularly.

## Good to know
- Checkout sends the cart to your WhatsApp. There is no online payment or customer login.
- Videos: MP4/WebM up to 100 MB. Keep the hero video under about 10 MB for fast loading.
