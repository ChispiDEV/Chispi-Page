#!/bin/bash

# Script de deploy para producción
echo "🚀 Iniciando deploy..."

# Construir para producción
echo "📦 Construyendo para producción..."
export JEKYLL_ENV=production
npm run production

# Verificar que la build fue exitosa
if [ $? -eq 0 ]; then
    echo "✅ Build completada exitosamente"
    
    # Aquí puedes agregar comandos de deploy
    # Por ejemplo, para GitHub Pages:
    # git add .
    # git commit -m "Deploy: $(date)"
    # git push origin main
    
    echo "🎉 Listo para deploy"
else
    echo "❌ Error en la build"
    exit 1
fi