'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingCalendarProps {
  bookedSlots: string[];
  blockedTimes: { startTime: string; endTime: string }[];
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16]; // 8 AM to 4 PM (last slot ends at 5 PM)

export default function BookingCalendar({ bookedSlots, blockedTimes }: BookingCalendarProps) {
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    startOfWeek.setDate(today.getDate() - dayOfWeek + weekOffset * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  };

  const isSlotBooked = (date: Date, hour: number) => {
    const slotTime = new Date(date);
    slotTime.setHours(hour, 0, 0, 0);
    return bookedSlots.some((booked) => {
      const bookedDate = new Date(booked);
      return bookedDate.getTime() === slotTime.getTime();
    });
  };

  const isSlotBlocked = (date: Date, hour: number) => {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(date);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return blockedTimes.some((blocked) => {
      const blockStart = new Date(blocked.startTime);
      const blockEnd = new Date(blocked.endTime);
      return slotStart < blockEnd && slotEnd > blockStart;
    });
  };

  const isSlotPast = (date: Date, hour: number) => {
    const slotTime = new Date(date);
    slotTime.setHours(hour, 0, 0, 0);
    return slotTime < new Date();
  };

  const isSlotAvailable = (date: Date, hour: number) => {
    return !isSlotBooked(date, hour) && !isSlotBlocked(date, hour) && !isSlotPast(date, hour);
  };

  const handleSlotClick = (date: Date, hour: number) => {
    if (!isSlotAvailable(date, hour)) return;

    const slotTime = new Date(date);
    slotTime.setHours(hour, 0, 0, 0);
    setSelectedSlot(slotTime);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dateTime: selectedSlot.toISOString(),
        }),
      });

      if (res.ok) {
        router.push('/book/confirm');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to book. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedSlot(null);
    setFormData({ clientName: '', email: '', phone: '', reason: '' });
    setError('');
  };

  return (
    <div>
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
          disabled={weekOffset === 0}
          className="btn-secondary disabled:opacity-50"
        >
          &larr; Previous
        </button>
        <div className="text-center">
          <span className="font-semibold text-lg">
            {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
        <button
          onClick={() => setWeekOffset(Math.min(1, weekOffset + 1))}
          disabled={weekOffset >= 1}
          className="btn-secondary disabled:opacity-50"
        >
          Next &rarr;
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
          <div className="p-3 border-r border-gray-200"></div>
          {weekDates.map((date, i) => {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <div
                key={i}
                className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
                  isToday ? 'bg-primary/10' : ''
                }`}
              >
                <div className="text-xs text-gray-500">{dayNames[date.getDay()]}</div>
                <div className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Slots */}
        <div className="max-h-[500px] overflow-y-auto">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
              <div className="p-3 text-sm text-gray-500 text-right border-r border-gray-200 bg-gray-50">
                {formatHour(hour)}
              </div>
              {weekDates.map((date, dayIndex) => {
                const available = isSlotAvailable(date, hour);
                const booked = isSlotBooked(date, hour);
                const blocked = isSlotBlocked(date, hour);
                const past = isSlotPast(date, hour);

                return (
                  <div
                    key={`${hour}-${dayIndex}`}
                    onClick={() => available && handleSlotClick(date, hour)}
                    className={`
                      p-2 h-14 border-r border-gray-100 last:border-r-0 transition-colors text-xs
                      ${available ? 'cursor-pointer hover:bg-primary/10 bg-green-50' : ''}
                      ${booked ? 'bg-gray-200 cursor-not-allowed' : ''}
                      ${blocked ? 'bg-yellow-100 cursor-not-allowed' : ''}
                      ${past ? 'bg-gray-100 cursor-not-allowed' : ''}
                    `}
                  >
                    {booked && <span className="text-gray-500 font-medium">Booked</span>}
                    {blocked && !booked && <span className="text-yellow-700 font-medium">Unavailable</span>}
                    {available && <span className="text-green-600 font-medium">Available</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
          <span>Unavailable</span>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showForm && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={closeForm}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-2">Book Your Consultation</h2>
            <p className="text-gray-600 mb-6">
              {selectedSlot.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}{' '}
              at {formatHour(selectedSlot.getHours())}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="input"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason for Contact *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="input min-h-[100px]"
                  placeholder="e.g., Weight loss, Muscle building, General fitness goals..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Booking...' : 'Confirm Booking'}
                </button>
                <button type="button" onClick={closeForm} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
