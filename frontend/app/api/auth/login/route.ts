import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shree_saree_secret_key';
const JWT_EXPIRES_IN = '7d';

// Hardcoded admin credentials — replace with DB lookup in production
const ADMIN_CREDENTIALS = [
  { mobile: '9999999999', password: 'admin123', name: 'Admin', role: 'admin' },
];

export async function POST(req: NextRequest) {
  try {
    const { mobile, password } = await req.json();

    if (!mobile || !password) {
      return NextResponse.json(
        { message: 'Mobile number and password are required.' },
        { status: 400 }
      );
    }

    const user = ADMIN_CREDENTIALS.find(
      (u) => u.mobile === mobile && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid mobile number or password.' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { mobile: user.mobile, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return NextResponse.json({
      token,
      user: { mobile: user.mobile, name: user.name, role: user.role },
    });
  } catch {
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
