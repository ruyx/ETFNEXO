#!/usr/bin/env node

/**
 * Script para optimizar imágenes Open Graph
 * De 6.5 MB → ~900 KB total
 *
 * Requiere: npm install sharp
 * Uso: node scripts/optimize-og-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const images = [
  'og-image-home.png',
  'og-image-noticias.png',
  'og-image-entrevistas.png',
  'og-image-academia.png',
  'og-image-default-noticia.png',
  'og-image-default-entrevista.png',
  'og-image-default-academia.png',
];

async function optimizeImage(filename) {
  const inputPath = path.join(publicDir, filename);
  const outputPath = path.join(publicDir, filename.replace('.png', '-optimized.png'));

  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  Skipping ${filename} - not found`);
    return;
  }

  const statsBefore = fs.statSync(inputPath);
  const sizeBefore = statsBefore.size;

  try {
    await sharp(inputPath)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center'
      })
      .png({
        quality: 85,
        compressionLevel: 9,
        palette: true, // Use palette-based PNG for smaller size
      })
      .toFile(outputPath);

    const statsAfter = fs.statSync(outputPath);
    const sizeAfter = statsAfter.size;
    const reduction = ((sizeBefore - sizeAfter) / sizeBefore * 100).toFixed(1);

    console.log(`✅ ${filename}`);
    console.log(`   Before: ${(sizeBefore / 1024).toFixed(0)} KB`);
    console.log(`   After:  ${(sizeAfter / 1024).toFixed(0)} KB`);
    console.log(`   Saved:  ${reduction}%`);

    // Replace original with optimized
    fs.renameSync(outputPath, inputPath);
  } catch (error) {
    console.error(`❌ Error optimizing ${filename}:`, error.message);
  }
}

async function main() {
  console.log('🖼️  Optimizing Open Graph images...\n');

  for (const image of images) {
    await optimizeImage(image);
    console.log('');
  }

  console.log('✨ Done!');
}

main();
