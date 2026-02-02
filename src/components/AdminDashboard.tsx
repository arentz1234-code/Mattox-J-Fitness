'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: number;
  clientName: string;
  email: string;
  phone: string;
  reason: string;
  dateTime: string;
  notes: string | null;
  createdAt: string;
}

interface BlockedTime {
  id: number;
  startTime: string;
  endTime: string;
  reason: string | null;
  createdAt: string;
}

interface AdminDashboardProps {
  bookings: Booking[];
  blockedTimes: BlockedTime[];
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

export default function AdminDashboard({ bookings, blockedTimes }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'calendar' | 'bookings' | 'timeoff'>('calendar');
  const [weekOffset, setWeekOffset] = useState(0);
  const maxWeekOffset = 2; // Only show 2 weeks in advance
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockForm, setBlockForm] = useState({
    startDate: '',
    startTime: '08:00',
    endDate: '',
    endTime: '17:00',
    reason: '',
    blockType: 'single',
  });
  const [loading, setLoading] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const upcomingBookings = bookings.filter((b) => new Date(b.dateTime) >= new Date());
  const pastBookings = bookings.filter((b) => new Date(b.dateTime) < new Date());

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

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${ampm}`;
  };

  const getBookingForSlot = (date: Date, hour: number) => {
    const slotTime = new Date(date);
    slotTime.setHours(hour, 0, 0, 0);
    return bookings.find((b) => {
      const bookingDate = new Date(b.dateTime);
      return bookingDate.getTime() === slotTime.getTime();
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

  const handleCancelBooking = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedBooking(null);
        router.refresh();
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async (id: number) => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/bookings/${id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editingNotes }),
      });
      if (res.ok) {
        const updatedBooking = await res.json();
        if (selectedBooking) {
          setSelectedBooking({ ...selectedBooking, notes: updatedBooking.notes });
        }
        router.refresh();
        alert('Notes saved and email sent to client!');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteBlockedTime = async (id: number) => {
    if (!confirm('Are you sure you want to remove this blocked time?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/blocked-time/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting blocked time:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockTime = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let startTime: Date;
      let endTime: Date;

      if (blockForm.blockType === 'day') {
        startTime = new Date(`${blockForm.startDate}T08:00:00`);
        endTime = new Date(`${blockForm.startDate}T17:00:00`);
      } else if (blockForm.blockType === 'week') {
        const start = new Date(blockForm.startDate);
        const dayOfWeek = start.getDay();
        const startOfWeek = new Date(start);
        startOfWeek.setDate(start.getDate() - dayOfWeek);
        startOfWeek.setHours(8, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(17, 0, 0, 0);

        startTime = startOfWeek;
        endTime = endOfWeek;
      } else {
        startTime = new Date(`${blockForm.startDate}T${blockForm.startTime}:00`);
        endTime = new Date(`${blockForm.endDate || blockForm.startDate}T${blockForm.endTime}:00`);
      }

      const res = await fetch('/api/blocked-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          reason: blockForm.reason,
        }),
      });

      if (res.ok) {
        setShowBlockForm(false);
        setBlockForm({
          startDate: '',
          startTime: '08:00',
          endDate: '',
          endTime: '17:00',
          reason: '',
          blockType: 'single',
        });
        router.refresh();
      }
    } catch (error) {
      console.error('Error blocking time:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-primary">{upcomingBookings.length}</div>
          <div className="text-gray-600">Upcoming Bookings</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-gray-900">{pastBookings.length}</div>
          <div className="text-gray-600">Past Bookings</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-red-600">{blockedTimes.length}</div>
          <div className="text-gray-600">Blocked Times</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'calendar'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Calendar View
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'bookings'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          All Bookings
        </button>
        <button
          onClick={() => setActiveTab('timeoff')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'timeoff'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Time Off
        </button>
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Week Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              disabled={weekOffset <= 0}
              className={`btn-secondary text-sm ${weekOffset <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              &larr; Previous
            </button>
            <span className="font-semibold">
              {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              disabled={weekOffset >= maxWeekOffset}
              className={`btn-secondary text-sm ${weekOffset >= maxWeekOffset ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next &rarr;
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
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
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
                  <div className="p-3 text-sm text-gray-500 text-right border-r border-gray-200 bg-gray-50">
                    {formatHour(hour)}
                  </div>
                  {weekDates.map((date, dayIndex) => {
                    const booking = getBookingForSlot(date, hour);
                    const blocked = isSlotBlocked(date, hour);

                    return (
                      <div
                        key={`${hour}-${dayIndex}`}
                        className={`p-2 min-h-[60px] border-r border-gray-100 last:border-r-0 ${
                          booking ? 'bg-primary/10 cursor-pointer hover:bg-primary/20' : ''
                        } ${blocked && !booking ? 'bg-red-50' : ''}`}
                        onClick={() => {
                          if (booking) {
                            setSelectedBooking(booking);
                            setEditingNotes(booking.notes || '');
                          }
                        }}
                      >
                        {booking && (
                          <div className="text-xs">
                            <div className="font-semibold text-primary truncate">
                              {booking.clientName}
                            </div>
                            <div className="text-gray-500 truncate">{booking.phone}</div>
                          </div>
                        )}
                        {blocked && !booking && (
                          <div className="text-xs text-red-700 font-medium">Blocked</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-lg">All Bookings</h2>
          </div>
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No bookings yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.map((booking) => {
                const isPast = new Date(booking.dateTime) < new Date();
                return (
                  <div
                    key={booking.id}
                    className={`p-4 ${isPast ? 'bg-gray-50 opacity-60' : ''}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-lg">{booking.clientName}</span>
                          {isPast && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                              Past
                            </span>
                          )}
                          {!isPast && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              Upcoming
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <p>
                            <span className="text-gray-400 font-medium">Date/Time:</span>{' '}
                            <span className="text-gray-700">{formatDateTime(booking.dateTime)}</span>
                          </p>
                          <p>
                            <span className="text-gray-400 font-medium">Email:</span>{' '}
                            <a href={`mailto:${booking.email}`} className="text-primary hover:underline">
                              {booking.email}
                            </a>
                          </p>
                          <p>
                            <span className="text-gray-400 font-medium">Phone:</span>{' '}
                            <a href={`tel:${booking.phone}`} className="text-primary hover:underline">
                              {booking.phone}
                            </a>
                          </p>
                          <p>
                            <span className="text-gray-400 font-medium">Booked:</span>{' '}
                            <span className="text-gray-700">
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-400 font-medium text-xs mb-1">Reason for Contact:</p>
                          <p className="text-gray-700 text-sm">{booking.reason}</p>
                        </div>
                      </div>
                      {!isPast && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={loading}
                          className="btn-danger text-sm whitespace-nowrap"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Time Off Tab */}
      {activeTab === 'timeoff' && (
        <div className="space-y-6">
          <button onClick={() => setShowBlockForm(true)} className="btn-primary">
            + Block Time
          </button>

          {/* Block Form Modal */}
          {showBlockForm && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowBlockForm(false)}
            >
              <div
                className="bg-white rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4">Block Time Off</h3>
                <form onSubmit={handleBlockTime} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Block Type</label>
                    <select
                      value={blockForm.blockType}
                      onChange={(e) => setBlockForm({ ...blockForm, blockType: e.target.value })}
                      className="input"
                    >
                      <option value="single">Specific Time Slot</option>
                      <option value="day">Entire Day</option>
                      <option value="week">Entire Week</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {blockForm.blockType === 'week' ? 'Week of' : 'Date'}
                    </label>
                    <input
                      type="date"
                      value={blockForm.startDate}
                      onChange={(e) => setBlockForm({ ...blockForm, startDate: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  {blockForm.blockType === 'single' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Start Time</label>
                          <select
                            value={blockForm.startTime}
                            onChange={(e) =>
                              setBlockForm({ ...blockForm, startTime: e.target.value })
                            }
                            className="input"
                          >
                            {Array.from({ length: 10 }, (_, i) => i + 8).map((h) => (
                              <option key={h} value={`${h.toString().padStart(2, '0')}:00`}>
                                {h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">End Time</label>
                          <select
                            value={blockForm.endTime}
                            onChange={(e) =>
                              setBlockForm({ ...blockForm, endTime: e.target.value })
                            }
                            className="input"
                          >
                            {Array.from({ length: 10 }, (_, i) => i + 9).map((h) => (
                              <option key={h} value={`${h.toString().padStart(2, '0')}:00`}>
                                {h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">End Date (optional)</label>
                        <input
                          type="date"
                          value={blockForm.endDate}
                          onChange={(e) => setBlockForm({ ...blockForm, endDate: e.target.value })}
                          className="input"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">Reason (internal)</label>
                    <input
                      type="text"
                      value={blockForm.reason}
                      onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                      className="input"
                      placeholder="e.g., Vacation, Personal"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" disabled={loading} className="btn-primary flex-1">
                      {loading ? 'Saving...' : 'Block Time'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBlockForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Blocked Times List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-lg">Blocked Times</h2>
            </div>
            {blockedTimes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No blocked times</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {blockedTimes.map((bt) => (
                  <div key={bt.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {formatDateTime(bt.startTime)} - {formatDateTime(bt.endTime)}
                      </p>
                      {bt.reason && <p className="text-sm text-gray-500">{bt.reason}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteBlockedTime(bt.id)}
                      disabled={loading}
                      className="btn-danger text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Booking Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Client Name</p>
                <p className="font-semibold text-lg">{selectedBooking.clientName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Date & Time</p>
                <p className="font-medium">{formatDateTime(selectedBooking.dateTime)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <a href={`mailto:${selectedBooking.email}`} className="text-primary hover:underline">
                  {selectedBooking.email}
                </a>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <a href={`tel:${selectedBooking.phone}`} className="text-primary hover:underline">
                  {selectedBooking.phone}
                </a>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Reason for Contact</p>
                <p className="bg-gray-50 p-3 rounded-lg">{selectedBooking.reason}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Notes (sends email to client when saved)</p>
                <textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  className="input w-full h-24 resize-none"
                  placeholder="Add notes for this client..."
                />
                <button
                  onClick={() => handleSaveNotes(selectedBooking.id)}
                  disabled={savingNotes}
                  className="btn-primary w-full mt-2"
                >
                  {savingNotes ? 'Saving & Sending Email...' : 'Save Notes & Email Client'}
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              {new Date(selectedBooking.dateTime) >= new Date() && (
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  disabled={loading}
                  className="btn-danger flex-1"
                >
                  Cancel Booking
                </button>
              )}
              <button onClick={() => setSelectedBooking(null)} className="btn-secondary flex-1">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
