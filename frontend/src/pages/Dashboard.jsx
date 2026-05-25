import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  CircleDollarSign,
  RefreshCcw,
  Scissors,
  Sparkles,
  UserRoundCheck,
  Play,
  CheckCheck
} from 'lucide-react';
import api from '../lib/api';

const defaultServices = [
  { id: 1, name: 'Signature Glow Facial', duration_minutes: 60, price: 225000 },
  { id: 2, name: 'Aromatherapy Body Massage', duration_minutes: 90, price: 350000 },
  { id: 3, name: 'Hair Spa Repair Ritual', duration_minutes: 75, price: 275000 }
];

const defaultTherapists = [
  { id: 1, name: 'Mira', specialization: 'Aromatherapy' },
  { id: 2, name: 'Nadia', specialization: 'Facial Treatment' },
  { id: 3, name: 'Salsa', specialization: 'Hair Spa' }
];

const formatRupiah = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
};

const formatTime = (datetime) => {
  const date = new Date(datetime);
  return date.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
};

const formatDate = (datetime) => {
  const date = new Date(datetime);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [queue, setQueue] = useState([]);
  const [services, setServices] = useState(defaultServices);
  const [therapists, setTherapists] = useState(defaultTherapists);
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState('Dashboard siap. Data akan dimuat otomatis.');
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeCount = bookings.filter((booking) => booking.status !== 'Done').length;
  const paidEstimate = bookings.length * 225000;

  const fetchTodayBookings = async () => {
    try {
      const response = await api.get('/bookings/today');
      setTodayBookings(response.data);
    } catch (error) {
      console.error('Error fetching today bookings:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [bookingRes, queueRes, serviceRes, therapistRes, roomRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/bookings/queue'),
        api.get('/services'),
        api.get('/therapists'),
        api.get('/rooms')
      ]);

      setBookings(bookingRes.data);
      setQueue(queueRes.data.live_queue || []);
      if (serviceRes.data.length > 0) setServices(serviceRes.data);
      if (therapistRes.data.length > 0) setTherapists(therapistRes.data);
      setRooms(roomRes.data);
      
      await fetchTodayBookings();
      
      setMessage('✅ Data berhasil dimuat dari backend.');
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('⚠️ Mode demo aktif. Backend belum terhubung atau data belum tersedia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = window.setInterval(() => {
      loadDashboardData();
    }, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const handleStartBooking = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/start`);
      setMessage(`✅ Booking #${bookingId} dimulai!`);
      await loadDashboardData();
      setTimeout(() => setMessage('Dashboard siap.'), 3000);
    } catch (error) {
      console.error('Error starting booking:', error);
      setMessage('❌ Gagal memulai booking: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleFinishBooking = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/finish`);
      setMessage(`✅ Booking #${bookingId} selesai!`);
      await loadDashboardData();
      setTimeout(() => setMessage('Dashboard siap.'), 3000);
    } catch (error) {
      console.error('Error finishing booking:', error);
      setMessage('❌ Gagal menyelesaikan booking: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 text-sm font-semibold text-teal-700">
              <Sparkles size={18} />
              Spa & Salon
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
              Receptionist Operations Hub
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Monitor booking dari mobile app, kelola live queue, dan update status layanan.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDashboardData}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800"
          >
            <RefreshCcw size={17} />
            {loading ? 'Memuat' : 'Refresh'}
          </button>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-5 md:grid-cols-4">
        <Metric icon={<CalendarDays size={20} />} label="Total Booking" value={bookings.length} tone="teal" />
        <Metric icon={<Clock3 size={20} />} label="Live Queue" value={queue.length} tone="rose" />
        <Metric icon={<UserRoundCheck size={20} />} label="Sesi Aktif" value={activeCount} tone="amber" />
        <Metric icon={<CircleDollarSign size={20} />} label="Est. Revenue" value={formatRupiah(paidEstimate)} tone="slate" />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8">
        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="text-rose-700" size={22} />
            <h2 className="text-lg font-black text-slate-950">Live Queue Firestore</h2>
          </div>
          {queue.length === 0 ? (
            <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
              Tidak ada antrean aktif. Semua terapis siap melayani.
            </p>
          ) : (
            <div className="space-y-2">
              {queue.map((item, index) => (
                <div key={`${item?.id || index}`} className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">
                  {typeof item === 'object' ? `Booking #${item.id} - ${item.message || 'Processing'}` : item}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 rounded-md bg-teal-50 p-3 text-sm text-teal-900">
            {message}
          </div>
        </div>

        <div className="space-y-5">
          <Panel title="📅 Jadwal Booking Hari Ini" icon={<CalendarDays size={20} className="text-teal-700" />}>
            {todayBookings.length === 0 ? (
              <p className="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
                Belum ada booking untuk hari ini. Booking akan muncul dari mobile app.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                      <th className="p-3">ID</th>
                      <th className="p-3">Waktu</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Terapis</th>
                      <th className="p-3">Layanan</th>
                      <th className="p-3">Ruangan</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {todayBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50">
                        <td className="p-3 font-black text-teal-700">#{booking.id}</td>
                        <td className="p-3 text-xs text-slate-700">{formatTime(booking.booking_time)}</td>
                        <td className="p-3">{booking.User?.name || 'N/A'}</td>
                        <td className="p-3">{booking.Therapist?.name || 'N/A'}</td>
                        <td className="p-3 text-xs text-slate-600">{booking.Service?.name || 'N/A'}</td>
                        <td className="p-3 font-semibold">{booking.Room?.room_number || 'N/A'}</td>
                        <td className="p-3">
                          {booking.status === 'Pending' && (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-black text-yellow-800">
                              ⏳ Menunggu
                            </span>
                          )}
                          {booking.status === 'In_Progress' && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-black text-green-800">
                              🟢 Proses
                            </span>
                          )}
                          {booking.status === 'Done' && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-black text-blue-800">
                              ✅ Selesai
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {booking.status === 'Pending' && (
                            <button
                              onClick={() => handleStartBooking(booking.id)}
                              className="inline-flex h-9 items-center gap-2 rounded-md bg-teal-600 px-3 text-xs font-bold text-white hover:bg-teal-700"
                            >
                              <Play size={14} />
                              Mulai
                            </button>
                          )}
                          {booking.status === 'In_Progress' && (
                            <button
                              onClick={() => handleFinishBooking(booking.id)}
                              className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700"
                            >
                              <CheckCheck size={14} />
                              Selesai
                            </button>
                          )}
                          {booking.status === 'Done' && (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel title="💆 Katalog Layanan" icon={<Scissors size={20} className="text-teal-700" />}>
              <div className="space-y-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                    <div>
                      <p className="font-bold text-slate-900">{service.name}</p>
                      <p className="text-xs text-slate-500">{service.duration_minutes} menit</p>
                    </div>
                    <span className="text-sm font-black text-teal-700">{formatRupiah(service.price)}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="🏠 Inventori Ruangan" icon={<Sparkles size={20} className="text-amber-600" />}>
              <div className="grid gap-3 sm:grid-cols-3">
                {(rooms.length > 0 ? rooms : [
                  { id: 1, room_number: 'A-01', type: 'Spa' },
                  { id: 2, room_number: 'B-02', type: 'Salon' },
                  { id: 3, room_number: 'C-03', type: 'Facial' }
                ]).map((room) => (
                  <div key={room.id} className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs font-bold uppercase text-slate-500">Room {room.id}</p>
                    <p className="text-lg font-black text-slate-950">{room.room_number}</p>
                    <p className="text-sm text-slate-600">{room.type}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, tone }) {
  const tones = {
    teal: 'bg-teal-50 text-teal-800 border-teal-100',
    rose: 'bg-rose-50 text-rose-800 border-rose-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-100',
    slate: 'bg-slate-100 text-slate-900 border-slate-200'
  };

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-black tracking-normal">{value}</p>
    </div>
  );
}

function Panel({ title, icon, children }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
      </div>
      {children}
    </div>
  );
}
