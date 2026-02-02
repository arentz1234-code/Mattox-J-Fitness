import Link from 'next/link';
import BookingCalendar from '@/components/BookingCalendar';
import { prisma } from '@/lib/prisma';

async function getBookingsAndBlockedTimes() {
  try {
    const now = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    const bookings = await prisma.booking.findMany({
      where: {
        dateTime: {
          gte: now,
          lte: twoWeeksFromNow,
        },
      },
      select: {
        dateTime: true,
      },
    });

    const blockedTimes = await prisma.blockedTime.findMany({
      where: {
        OR: [
          {
            startTime: {
              gte: now,
              lte: twoWeeksFromNow,
            },
          },
          {
            endTime: {
              gte: now,
              lte: twoWeeksFromNow,
            },
          },
        ],
      },
    });

    return {
      bookedSlots: bookings.map((b) => b.dateTime.toISOString()),
      blockedTimes: blockedTimes.map((bt) => ({
        startTime: bt.startTime.toISOString(),
        endTime: bt.endTime.toISOString(),
      })),
    };
  } catch {
    return { bookedSlots: [], blockedTimes: [] };
  }
}

export default async function BookPage() {
  const { bookedSlots, blockedTimes } = await getBookingsAndBlockedTimes();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            MATTOX <span className="text-primary">J</span>
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Book Your Consultation
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select an available time slot below. Consultations are 1 hour and completely free.
            Available hours: 8:00 AM - 5:00 PM.
          </p>
        </div>

        <BookingCalendar bookedSlots={bookedSlots} blockedTimes={blockedTimes} />
      </div>
    </main>
  );
}
