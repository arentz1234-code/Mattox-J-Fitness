import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { dateTime: 'asc' },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { clientName, email, phone, reason, dateTime } = await request.json();

    if (!clientName || !email || !phone || !reason || !dateTime) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const bookingDate = new Date(dateTime);

    // Check if slot is already booked
    const existingBooking = await prisma.booking.findFirst({
      where: { dateTime: bookingDate },
    });

    if (existingBooking) {
      return NextResponse.json({ error: 'This time slot is already booked' }, { status: 409 });
    }

    // Check if slot is blocked
    const blockedTime = await prisma.blockedTime.findFirst({
      where: {
        AND: [
          { startTime: { lte: bookingDate } },
          { endTime: { gt: bookingDate } },
        ],
      },
    });

    if (blockedTime) {
      return NextResponse.json({ error: 'This time slot is unavailable' }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        clientName,
        email,
        phone,
        reason,
        dateTime: bookingDate,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
