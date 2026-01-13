import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { registerSchema } from '@/lib/validations/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          ...(validatedData.phone ? [{ phone: validatedData.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      return errorResponse('Email hoặc số điện thoại đã được sử dụng', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        fullname: validatedData.fullname,
        phone: validatedData.phone,
        birthday: validatedData.birthday ? new Date(validatedData.birthday) : null,
        gender: validatedData.gender,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        phone: true,
        avatar: true,
        birthday: true,
        gender: true,
        role: true,
        createdAt: true,
      },
    });

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

    return successResponse(
      {
        user,
        accessToken,
        refreshToken,
      },
      'Đăng ký thành công',
      201
    );
  } catch (error: any) {
    if (error.name === 'ZodError' && error.errors?.length > 0) {
      return errorResponse(error.errors[0].message, 400);
    }
    return handleApiError(error);
  }
}
