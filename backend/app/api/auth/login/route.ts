import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/password';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { loginSchema } from '@/lib/validations/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return errorResponse('Email hoặc mật khẩu không đúng', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(validatedData.password, user.password);

    if (!isPasswordValid) {
      return errorResponse('Email hoặc mật khẩu không đúng', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return successResponse(
      {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
      'Đăng nhập thành công'
    );
  } catch (error: any) {
    if (error.name === 'ZodError' && error.errors?.length > 0) {
      return errorResponse(error.errors[0].message, 400);
    }
    return handleApiError(error);
  }
}
