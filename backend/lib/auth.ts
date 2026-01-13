import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from './jwt';

export interface AuthRequest extends NextRequest {
  user?: JWTPayload;
}

export const authenticate = async (request: NextRequest): Promise<{
  authenticated: boolean;
  user?: JWTPayload;
  response?: NextResponse;
}> => {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { success: false, error: 'Unauthorized - No token provided' },
          { status: 401 }
        ),
      };
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { success: false, error: 'Unauthorized - Invalid token' },
          { status: 401 }
        ),
      };
    }

    return {
      authenticated: true,
      user: decoded,
    };
  } catch (error) {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      ),
    };
  }
};

export const requireAdmin = async (request: NextRequest): Promise<{
  authorized: boolean;
  user?: JWTPayload;
  response?: NextResponse;
}> => {
  const authResult = await authenticate(request);

  if (!authResult.authenticated) {
    return {
      authorized: false,
      response: authResult.response,
    };
  }

  if (authResult.user?.role !== 'ADMIN') {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: authResult.user,
  };
};
