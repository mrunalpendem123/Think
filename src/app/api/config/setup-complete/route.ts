import configManager from '@/lib/config';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const POST = async (req: NextRequest) => {
  try {
    configManager.markSetupComplete();
    
    // Set a cookie to persist setup completion across requests
    // This works on Vercel where filesystem is read-only
    const cookieStore = await cookies();
    cookieStore.set('setup-complete', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return NextResponse.json(
      {
        message: 'Setup marked as complete.',
      },
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error('Error marking setup as complete: ', err);
    // Even if filesystem write fails, set cookie to mark as complete
    const cookieStore = await cookies();
    cookieStore.set('setup-complete', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
    
    return NextResponse.json(
      { message: 'Setup marked as complete.' },
      { 
        status: 200,
      },
    );
  }
};
