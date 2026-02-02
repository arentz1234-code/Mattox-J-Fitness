import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const blockedTimes = await prisma.blockedTime.findMany({
      orderBy: { startTime: 'asc' },
    });
    return NextResponse.json(blockedTimes);
  } catch (error) {
    console.error('Error fetching blocked times:', error);
    return NextResponse.json({ error: 'Failed to fetch blocked times' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check admin auth
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startTime, endTime, reason } = await request.json();

    if (!startTime || !endTime) {
      return NextResponse.json({ error: 'Start and end times are required' }, { status: 400 });
    }

    const blockedTime = await prisma.blockedTime.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        reason: reason || null,
      },
    });

    return NextResponse.json(blockedTime, { status: 201 });
  } catch (error) {
    console.error('Error creating blocked time:', error);
    return NextResponse.json({ error: 'Failed to create blocked time' }, { status: 500 });
  }
}
