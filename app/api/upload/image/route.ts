import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { denyUnlessRole } from '@/lib/auth/check-admin';
import { MAX_UPLOAD_BYTES } from '@/lib/upload-image';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Extensión según el tipo validado, no según el nombre que envía el cliente
const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(request: NextRequest) {
  const denied = await denyUnlessRole(['admin', 'redactor']);
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha recibido ninguna imagen' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!Object.prototype.hasOwnProperty.call(EXTENSION_BY_TYPE, file.type)) {
      return NextResponse.json(
        { error: 'Formato no admitido. Usa JPG, PNG, WebP o GIF.' },
        { status: 400 }
      );
    }

    // Vercel corta las peticiones de más de 4,5 MB antes de llegar aquí;
    // el cliente (lib/upload-image.ts) reduce las fotos por debajo de este límite
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'La imagen es demasiado pesada. El máximo es 4 MB.' },
        { status: 400 }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const ext = EXTENSION_BY_TYPE[file.type];
    const filename = `articles/featured-${timestamp}-${randomString}.${ext}`;

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('public')
      .upload(filename, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('public')
      .getPublicUrl(filename);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filename,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
