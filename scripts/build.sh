#!/usr/bin/env bash
# =====================================================
# Build Script: Bundles React into static assets
# and prepares the deployment package for OVH.
# =====================================================
set -euo pipefail

echo "==> Installing Node.js dependencies..."
npm install

echo "==> Building React production bundle..."
# Vite outputs JS/CSS to api/public/assets/ (configured in vite.config.js)
npm run build

# Copy index.html to the public directory so PHP can serve it as the SPA entry point
cp index.html api/public/index.html

echo "==> Verifying build output..."
if [ ! -d "api/public/assets" ]; then
    echo "ERROR: Build output directory not found. Check vite.config.js."
    exit 1
fi
if [ ! -f "api/public/index.html" ]; then
    echo "ERROR: index.html not copied. Check the build script."
    exit 1
fi

echo "==> Build complete!"
echo ""
echo "Static assets generated in: api/public/assets/"
echo ""
echo "Files:"
ls -la api/public/assets/
echo ""
echo "Next steps:"
echo "  1. Upload everything to your OVH www/ directory via FTP/SFTP"
echo "  2. Import sql/schema.sql into your OVH MySQL database (phpMyAdmin)"
echo "  3. Edit api/config/config.php or create a .env file with your DB credentials"
echo "  4. See DEPLOYMENT.md for detailed instructions"
