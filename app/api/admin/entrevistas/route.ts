import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // draft, published, archived
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;
    const supabase = createAdminClient();

    // Build query (bypasses RLS with admin client)
    // @ts-ignore - Supabase type instantiation depth limit with interviews_with_metadata view
    let query = supabase
      .from('interviews_with_metadata')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filters
    if (status) {
      query = query.eq('status' as any, status as any);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching interviews (admin):', error);
      return NextResponse.json(
        { error: 'Error al obtener entrevistas' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: {
        interviews: data || [],
        pagination: {
          currentPage: page,
          totalPages,
          totalCount: count || 0,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado' },
      { status: 500 }
    );
  }
}
