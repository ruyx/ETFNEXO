#!/bin/bash
# Generar imagen hero para artículo "Qué son los ETFs"

# Crear directorio si no existe
mkdir -p public/images/academia

# Descargar imagen de Pexels relacionada con ETFs/inversión
# Query: "stock market graph" o "investment chart"
curl -H "Authorization: ${PEXELS_API_KEY}" \
  "https://api.pexels.com/v1/search?query=stock%20market%20investment&per_page=1&orientation=landscape" \
  | jq -r '.photos[0].src.large2x' \
  | xargs curl -o public/images/academia/que-son-los-etf-hero.jpg

echo "✅ Imagen generada: public/images/academia/que-son-los-etf-hero.jpg"
