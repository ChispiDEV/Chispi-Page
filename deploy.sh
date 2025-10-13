#!/bin/bash

echo "🚀 Iniciando deploy con Node.js..."

# Build producción
echo "📦 Construyendo para producción..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completada exitosamente"
    echo ""
    echo "📋 Pasos para deploy:"
    echo "1. La carpeta 'dist/' está lista para deploy"
    echo "2. Opciones:"
    echo "   a) GitHub Pages: Sube manualmente la carpeta dist/"
    echo "   b) Netlify: Arrastra la carpeta dist/ a netlify.com"
    echo "   c) Vercel: Usa 'npx vercel --prod'"
    echo ""
    echo "🎉 Build lista en: $(pwd)/dist"
else
    echo "❌ Error en la build"
    exit 1
fi