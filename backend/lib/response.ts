import { NextResponse } from 'next/server';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const successResponse = <T>(data: T, message?: string, status: number = 200): NextResponse => {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as ApiResponse<T>,
    { status }
  );
};

export const errorResponse = (error: string, status: number = 400): NextResponse => {
  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiResponse,
    { status }
  );
};

export const handleApiError = (error: unknown): NextResponse => {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return errorResponse(error.message, 500);
  }
  
  return errorResponse('Internal server error', 500);
};
