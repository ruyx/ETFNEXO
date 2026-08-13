/**
 * API Response Utilities
 * Helpers para manejar respuestas de API de forma consistente
 */

import { NextResponse } from 'next/server';
import { AuthError } from './check-admin';

export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST';

export interface ApiErrorResponse {
  error: string;
  code: ApiErrorCode;
  details?: any;
}

export interface ApiSuccessResponse<T = any> {
  data: T;
  message?: string;
}

/**
 * Crea una respuesta de error consistente
 */
export function errorResponse(
  message: string,
  code: ApiErrorCode,
  status: number,
  details?: any
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      error: message,
      code,
      details
    },
    { status }
  );
}

/**
 * Crea una respuesta de éxito consistente
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      data,
      ...(message && { message })
    },
    { status }
  );
}

/**
 * Maneja errores de autenticación de forma consistente
 */
export function handleAuthError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof AuthError) {
    switch (error.code) {
      case 'UNAUTHENTICATED':
        return errorResponse(
          error.message,
          'UNAUTHENTICATED',
          401
        );
      case 'FORBIDDEN':
        return errorResponse(
          error.message,
          'FORBIDDEN',
          403
        );
      case 'NOT_FOUND':
        return errorResponse(
          error.message,
          'NOT_FOUND',
          404
        );
    }
  }

  // Error desconocido
  console.error('Error desconocido:', error);
  return errorResponse(
    'Error interno del servidor',
    'INTERNAL_ERROR',
    500,
    process.env.NODE_ENV === 'development' ? error : undefined
  );
}

/**
 * Valida que los campos requeridos estén presentes en el body
 * @param body - Objeto a validar
 * @param requiredFields - Array de campos requeridos
 * @returns Array de campos faltantes (vacío si todo está OK)
 */
export function validateRequiredFields(
  body: Record<string, any>,
  requiredFields: string[]
): string[] {
  return requiredFields.filter(field => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });
}

/**
 * Crea una respuesta de validación fallida
 */
export function validationErrorResponse(
  missingFields: string[]
): NextResponse<ApiErrorResponse> {
  return errorResponse(
    'Campos requeridos faltantes',
    'VALIDATION_ERROR',
    400,
    { missingFields }
  );
}
