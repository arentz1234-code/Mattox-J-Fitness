import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import AdminDashboard from '@/components/AdminDashboard';

async function getData() {
  const bookings = await prisma.booking.findMany({
    orderBy: { dateTime: 'asc' },
  });

  const blockedTimes = await prisma.blockedTime.findMany({
    orderBy: { startTime: 'asc' },
  });

  return {
    bookings: bookings.map((b) => ({
      ...b,
      dateTime: b.dateTime.toISOString(),
      createdAt: b.createdAt.toISOString(),
    })),
    blockedTimes: blockedTimes.map((bt) => ({
      ...bt,
      startTime: bt.startTime.toISOString(),
      endTime: bt.endTime.toISOString(),
      createdAt: bt.createdAt.toISOString(),
    })),
  };
}

export default async function DashboardPage() {
  const { bookings, blockedTimes } = await getData();

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-gray-900">
              MATTOX <span className="text-primary">J</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">Admin Dashboard</span>
          </div>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Back to Site
          </Link>
        </div>
      </header>

      <AdminDashboard bookings={bookings} blockedTimes={blockedTimes} />
    </main>
  );
}
