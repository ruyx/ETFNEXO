/**
 * Endpoint temporal para asignar rol admin
 * DELETE después de usarlo
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const USER_ID = 'bccda4b6-4de4-4137-aa4f-882f5f70489d';
const USER_EMAIL = 'ruy.dejesus4@gmail.com';

export async function POST() {
  try {
    const supabase = createAdminClient();

    console.log('🔍 Verificando perfil de usuario...');

    // 1. Verificar si existe el perfil
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id' as any, USER_ID as any)  // ✅ Cambio: usar 'id' en lugar de 'user_id'
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error al buscar perfil:', fetchError);
      return NextResponse.json(
        { error: 'Error al buscar perfil', details: fetchError },
        { status: 500 }
      );
    }

    if (existingProfile && !fetchError) {
      console.log('✅ Perfil existente encontrado:', existingProfile);

      if ((existingProfile as any).role === 'admin') {
        return NextResponse.json({
          success: true,
          message: 'El usuario YA tiene rol admin',
          profile: existingProfile
        });
      }

      console.log(`Actualizando de "${(existingProfile as any).role || 'null'}" a "admin"...`);

      const { data: updated, error: updateError } = await supabase
        .from('user_profiles')
        .update({ role: 'admin' } as any)
        .eq('id' as any, USER_ID as any)  // ✅ Cambio: usar 'id' en lugar de 'user_id'
        .select()
        .single();

      if (updateError) {
        console.error('Error al actualizar rol:', updateError);
        return NextResponse.json(
          { error: 'Error al actualizar rol', details: updateError },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Rol actualizado exitosamente',
        profile: updated
      });
    }

    // 2. Si no existe, crear el perfil
    console.log('⚠️  No se encontró perfil. Creando nuevo perfil con rol admin...');

    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: USER_ID,  // ✅ Cambio: usar 'id' en lugar de 'user_id'
          role: 'admin',
          full_name: 'Ruy De Jesus'
        }
      ] as any)
      .select()
      .single();

    if (insertError) {
      console.error('Error al crear perfil:', insertError);
      return NextResponse.json(
        { error: 'Error al crear perfil', details: insertError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil creado exitosamente con rol admin',
      profile: newProfile
    });

  } catch (error: any) {
    console.error('Error inesperado:', error);
    return NextResponse.json(
      { error: 'Error inesperado', message: error.message },
      { status: 500 }
    );
  }
}
