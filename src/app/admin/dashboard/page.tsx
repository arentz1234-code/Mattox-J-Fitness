'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminDashboard from '@/components/AdminDashboard';

interface Booking {
  id: number;
  clientName: string;
  email: string;
  phone: string;
  reason: string;
  dateTime: string;
  createdAt: string;
}

interface BlockedTime {
  id: number;
  startTime: string;
  endTime: string;
  reason: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bookingsRes, blockedRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/blocked-time'),
        ]);

        const bookingsData = await bookingsRes.json();
        const blockedData = await blockedRes.json();

        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setBlockedTimes(Array.isArray(blockedData) ? blockedData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100">
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
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
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
