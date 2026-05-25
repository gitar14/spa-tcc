import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  HeartHandshake,
  RefreshCcw,
  Scissors,
  Sparkles,
  Star,
  UserRoundCheck
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

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [queue, setQueue] = useState([]);
  const [services, setServices] = useState(defaultServices);
  const [therapists, setTherapists] = useState(defaultTherapists);
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState('Siap menerima booking hari ini.');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    user_id: '1',
    therapist_id: '1',
    service_id: '1',
    room_id: '1',
    booking_time: new Date().toISOString().slice(0, 16)
  });

  const activeCount = bookings.filter((booking) => booking.status !== 'Done').length;
  const paidEstimate = bookings.length * 225000;

  const selectedService = useMemo(
    () => services.find((service) => String(service.id) === String(form.service_id)),
    [form.service_id, services]
  );

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
      setMessage('Data SQL dan Redis berhasil diperbarui.');
    } catch (error) {
      setMessage('Mode demo aktif. Isi master data atau nyalakan backend untuk data live.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = window.setInterval(loadDashboardData, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const updateForm = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    try {
      await api.post('/bookings', {
        user_id: Number(form.user_id),
        therapist_id: Number(form.therapist_id),
        service_id: Number(form.service_id),
        room_id: Number(form.room_id),
        booking_time: new Date(form.booking_time).toISOString()
      });
      setMessage('Booking berhasil dibuat. Status terapis dikunci di Redis.');
      await loadDashboardData();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Booking gagal diproses.');
    }
  };

  const finishBooking = async (id) => {
    try {
      await api.put(`/bookings/${id}/finish`);
      setMessage(`Booking #${id} selesai. Terapis kembali tersedia.`);
      await loadDashboardData();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Gagal menyelesaikan booking.');
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
              Jadwal ruangan dari SQL, antrean terapis dari Redis, dan form booking pelanggan dalam satu layar kerja.
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
        <Metric icon={<CalendarDays size={20} />} label="Booking SQL" value={bookings.length} tone="teal" />
        <Metric icon={<Clock3 size={20} />} label="Antrean Redis" value={queue.length} tone="rose" />
        <Metric icon={<UserRoundCheck size={20} />} label="Sesi Aktif" value={activeCount} tone="amber" />
        <Metric icon={<CircleDollarSign size={20} />} label="Estimasi Revenue" value={formatRupiah(paidEstimate)} tone="slate" />
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-8 lg:grid-cols-[360px_1fr]">
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <HeartHandshake className="text-teal-700" size={22} />
              <h2 className="text-lg font-black text-slate-950">Booking Pelanggan</h2>
            </div>
            <form onSubmit={submitBooking} className="space-y-3">
              <Field label="ID Pelanggan" name="user_id" type="number" value={form.user_id} onChange={updateForm} />
              <SelectField label="Terapis Favorit" name="therapist_id" value={form.therapist_id} onChange={updateForm}>
                {therapists.map((therapist) => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.name} - {therapist.specialization}
                  </option>
                ))}
              </SelectField>
              <SelectField label="Layanan" name="service_id" value={form.service_id} onChange={updateForm}>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </SelectField>
              <Field label="ID Ruangan" name="room_id" type="number" value={form.room_id} onChange={updateForm} />
              <Field label="Jam Booking" name="booking_time" type="datetime-local" value={form.booking_time} onChange={updateForm} />
              <button className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-teal-700 text-sm font-black text-white hover:bg-teal-800">
                <CheckCircle2 size={18} />
                Kunci Slot Terapis
              </button>
            </form>
            <div className="mt-4 rounded-md bg-teal-50 p-3 text-sm text-teal-900">
              {message}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-black text-slate-950">Mobile Client Preview</h2>
            <div className="rounded-[28px] border-8 border-slate-900 bg-slate-950 p-3 text-white">
              <div className="rounded-[20px] bg-white p-4 text-slate-950">
                <p className="text-xs font-bold uppercase text-teal-700">Pilihan Layanan</p>
                <h3 className="mt-1 text-xl font-black">{selectedService?.name || 'Layanan Spa'}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {selectedService?.duration_minutes || 60} menit, mulai {formatRupiah(selectedService?.price || 0)}
                </p>
                <div className="mt-4 flex items-center justify-between rounded-md bg-slate-100 p-3 text-sm">
                  <span>Terapis</span>
                  <strong>#{form.therapist_id}</strong>
                </div>
                <button className="mt-4 h-10 w-full rounded-md bg-slate-950 text-sm font-bold text-white">
                  Booking Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-2">
            <Panel title="Live Queue Redis" icon={<Clock3 size={20} className="text-rose-700" />}>
              {queue.length === 0 ? (
                <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">
                  Tidak ada antrean aktif. Terapis siap menerima pelanggan berikutnya.
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
            </Panel>

            <Panel title="Katalog Layanan SQL" icon={<Scissors size={20} className="text-teal-700" />}>
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
          </div>

          <Panel title="Jadwal Ruangan Spa SQL" icon={<CalendarDays size={20} className="text-slate-700" />}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                    <th className="p-3">Booking</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Terapis</th>
                    <th className="p-3">Ruangan</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-slate-500">
                        Belum ada data booking dari SQL.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50">
                        <td className="p-3 font-black">#{booking.id}</td>
                        <td className="p-3">{booking.User?.name || `User-${booking.user_id}`}</td>
                        <td className="p-3">{booking.Therapist?.name || `Terapis-${booking.therapist_id}`}</td>
                        <td className="p-3">{booking.Room?.room_number || `Room-${booking.room_id}`}</td>
                        <td className="p-3">
                          <span className="rounded bg-amber-100 px-2 py-1 text-xs font-black text-amber-800">
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => finishBooking(booking.id)}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-xs font-bold hover:bg-slate-100"
                          >
                            <Star size={14} />
                            Selesai
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Inventori Ruangan" icon={<Sparkles size={20} className="text-amber-600" />}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(rooms.length > 0 ? rooms : [{ id: 1, room_number: 'A-01', type: 'Spa' }, { id: 2, room_number: 'B-02', type: 'Salon' }]).map((room) => (
                <div key={room.id} className="rounded-md border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Room {room.id}</p>
                  <p className="text-lg font-black text-slate-950">{room.room_number}</p>
                  <p className="text-sm text-slate-600">{room.type}</p>
                </div>
              ))}
            </div>
          </Panel>
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

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase text-slate-500">{label}</span>
      <input
        {...props}
        className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-700"
        required
      />
    </label>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase text-slate-500">{label}</span>
      <select
        {...props}
        className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-700"
        required
      >
        {children}
      </select>
    </label>
  );
}
