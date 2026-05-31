import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, Clock3, CircleDollarSign, RefreshCcw,
  Scissors, Sparkles, UserRoundCheck, Play, CheckCheck,
  LogOut, Plus, Pencil, Trash2, X, Check
} from 'lucide-react';
import api from '../lib/api';

const formatRupiah = (value) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0
}).format(Number(value || 0));

const formatTime = (datetime) => new Date(datetime).toLocaleTimeString('id-ID', {
  hour: '2-digit', minute: '2-digit', hour12: false
});

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [bookings, setBookings] = useState([]);
  const [queue, setQueue] = useState([]);
  const [services, setServices] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modal, setModal] = useState(null); // { type: 'service'|'therapist'|'room', mode: 'add'|'edit', data: {} }
  const [modalForm, setModalForm] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, qRes, sRes, tRes, rRes, tbRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/bookings/queue'),
        api.get('/services'),
        api.get('/therapists'),
        api.get('/rooms'),
        api.get('/bookings/today'),
      ]);
      setBookings(bRes.data);
      setQueue(qRes.data.live_queue || []);
      setServices(sRes.data);
      setTherapists(tRes.data);
      setRooms(rRes.data);
      setTodayBookings(tbRes.data);
    } catch (err) {
      showMsg('❌ Gagal memuat data: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleStart = async (id) => {
    try {
      await api.put(`/bookings/${id}/start`);
      showMsg(`✅ Booking #${id} dimulai!`);
      loadData();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.error || err.message));
    }
  };

  const handleFinish = async (id) => {
    try {
      await api.put(`/bookings/${id}/finish`);
      showMsg(`✅ Booking #${id} selesai!`);
      loadData();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.error || err.message));
    }
  };

  // ─── CRUD helpers ───────────────────────────────────────────

  const openAdd = (type) => { setModal({ type, mode: 'add' }); setModalForm({}); };
  const openEdit = (type, data) => { setModal({ type, mode: 'edit', data }); setModalForm(data); };
  const closeModal = () => { setModal(null); setModalForm({}); };

  const handleSave = async () => {
    setModalLoading(true);
    const { type, mode, data } = modal;
    const endpoint = `/${type}s`;
    try {
      if (mode === 'add') {
        await api.post(endpoint, modalForm);
        showMsg(`✅ ${type} berhasil ditambahkan!`);
      } else {
        await api.put(`${endpoint}/${data.id}`, modalForm);
        showMsg(`✅ ${type} berhasil diperbarui!`);
      }
      closeModal();
      loadData();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.error || err.message));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (type, id, name) => {
    if (!window.confirm(`Hapus "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await api.delete(`/${type}s/${id}`);
      showMsg(`✅ Berhasil dihapus!`);
      loadData();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.error || err.message));
    }
  };

  const activeCount = bookings.filter(b => b.status !== 'Done').length;
  const estRevenue = bookings.reduce((sum, b) => sum + Number(b.Service?.price || 0), 0);

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-900">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
              <Sparkles size={18} /> Spa & Salon
            </div>
            <h1 className="mt-1 text-2xl font-black text-slate-950">Receptionist Operations Hub</h1>
            <p className="text-sm text-slate-500">Login sebagai: <span className="font-semibold">{user.name}</span></p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">
              <RefreshCcw size={15} /> {loading ? 'Memuat...' : 'Refresh'}
            </button>
            <button onClick={handleLogout}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-100">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-5 md:grid-cols-4">
        <Metric icon={<CalendarDays size={20} />} label="Total Booking" value={bookings.length} tone="teal" />
        <Metric icon={<Clock3 size={20} />} label="Live Queue" value={queue.length} tone="rose" />
        <Metric icon={<UserRoundCheck size={20} />} label="Sesi Aktif" value={activeCount} tone="amber" />
        <Metric icon={<CircleDollarSign size={20} />} label="Est. Revenue" value={formatRupiah(estRevenue)} tone="slate" />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 space-y-5">
        {/* Message */}
        {message && (
          <div className="rounded-md bg-teal-50 border border-teal-200 p-3 text-sm text-teal-900">{message}</div>
        )}

        {/* Live Queue */}
        <Panel title="Live Queue Firestore" icon={<Clock3 className="text-rose-700" size={20} />}>
          {queue.length === 0
            ? <p className="text-sm text-slate-500 bg-slate-50 rounded-md p-4">Tidak ada antrean aktif.</p>
            : <div className="space-y-2">
                {queue.map((item, i) => (
                  <div key={i} className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">
                    Booking #{item.id} - {item.message || 'Processing'}
                  </div>
                ))}
              </div>
          }
        </Panel>

        {/* Jadwal Booking */}
        <Panel title="Jadwal Booking Hari Ini" icon={<CalendarDays size={20} className="text-teal-700" />}>
          {todayBookings.length === 0
            ? <p className="text-sm text-slate-500 bg-slate-50 rounded-md p-4 text-center">Belum ada booking hari ini.</p>
            : <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                      <th className="p-3">ID</th><th className="p-3">Waktu</th><th className="p-3">Customer</th>
                      <th className="p-3">Terapis</th><th className="p-3">Layanan</th><th className="p-3">Ruangan</th>
                      <th className="p-3">Status</th><th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {todayBookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-3 font-black text-teal-700">#{b.id}</td>
                        <td className="p-3 text-xs">{formatTime(b.booking_time)}</td>
                        <td className="p-3">{b.User?.name || 'N/A'}</td>
                        <td className="p-3">{b.Therapist?.name || 'N/A'}</td>
                        <td className="p-3 text-xs text-slate-600">{b.Service?.name || 'N/A'}</td>
                        <td className="p-3 font-semibold">{b.Room?.room_number || 'N/A'}</td>
                        <td className="p-3">
                          {b.status === 'Pending' && <Badge color="yellow">⏳ Menunggu</Badge>}
                          {b.status === 'In_Progress' && <Badge color="green">🟢 Proses</Badge>}
                          {b.status === 'Done' && <Badge color="blue">✅ Selesai</Badge>}
                        </td>
                        <td className="p-3 text-center">
                          {b.status === 'Pending' && (
                            <button onClick={() => handleStart(b.id)}
                              className="inline-flex h-8 items-center gap-1 rounded-md bg-teal-600 px-3 text-xs font-bold text-white hover:bg-teal-700">
                              <Play size={12} /> Mulai
                            </button>
                          )}
                          {b.status === 'In_Progress' && (
                            <button onClick={() => handleFinish(b.id)}
                              className="inline-flex h-8 items-center gap-1 rounded-md bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700">
                              <CheckCheck size={12} /> Selesai
                            </button>
                          )}
                          {b.status === 'Done' && <span className="text-xs text-slate-400">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </Panel>

        {/* Layanan */}
        <Panel title="Katalog Layanan"
          icon={<Scissors size={20} className="text-teal-700" />}
          action={<button onClick={() => openAdd('service')}
            className="inline-flex h-8 items-center gap-1 rounded-md bg-teal-600 px-3 text-xs font-bold text-white hover:bg-teal-700">
            <Plus size={13} /> Tambah
          </button>}>
          <div className="space-y-2">
            {services.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                <div>
                  <p className="font-bold">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.duration_minutes} menit · {formatRupiah(s.price)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit('service', s)}
                    className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-100">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete('service', s.id, s.name)}
                    className="h-8 w-8 flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Terapis */}
        <Panel title="Daftar Terapis"
          icon={<UserRoundCheck size={20} className="text-teal-700" />}
          action={<button onClick={() => openAdd('therapist')}
            className="inline-flex h-8 items-center gap-1 rounded-md bg-teal-600 px-3 text-xs font-bold text-white hover:bg-teal-700">
            <Plus size={13} /> Tambah
          </button>}>
          <div className="space-y-2">
            {therapists.map(t => (
              <div key={t.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.specialization}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit('therapist', t)}
                    className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-100">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete('therapist', t.id, t.name)}
                    className="h-8 w-8 flex items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Ruangan */}
        <Panel title="Inventori Ruangan"
          icon={<Sparkles size={20} className="text-amber-600" />}
          action={<button onClick={() => openAdd('room')}
            className="inline-flex h-8 items-center gap-1 rounded-md bg-teal-600 px-3 text-xs font-bold text-white hover:bg-teal-700">
            <Plus size={13} /> Tambah
          </button>}>
          <div className="grid gap-3 sm:grid-cols-3">
            {rooms.map(r => (
              <div key={r.id} className="rounded-md border border-slate-200 p-3 relative">
                <p className="text-xs font-bold uppercase text-slate-500">Room {r.id}</p>
                <p className="text-lg font-black text-slate-950">{r.room_number}</p>
                <p className="text-sm text-slate-600">{r.type}</p>
                <div className="flex gap-1 mt-2">
                  <button onClick={() => openEdit('room', r)}
                    className="h-7 w-7 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleDelete('room', r.id, r.room_number)}
                    className="h-7 w-7 flex items-center justify-center rounded border border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      {/* Modal CRUD */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-950 capitalize">
                {modal.mode === 'add' ? 'Tambah' : 'Edit'} {modal.type}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>

            <div className="space-y-3">
              {/* Service fields */}
              {modal.type === 'service' && <>
                <Field label="Nama Layanan" value={modalForm.name || ''} onChange={v => setModalForm({...modalForm, name: v})} />
                <Field label="Durasi (menit)" type="number" value={modalForm.duration_minutes || ''} onChange={v => setModalForm({...modalForm, duration_minutes: v})} />
                <Field label="Harga (Rp)" type="number" value={modalForm.price || ''} onChange={v => setModalForm({...modalForm, price: v})} />
                <Field label="Deskripsi" value={modalForm.description || ''} onChange={v => setModalForm({...modalForm, description: v})} />
              </>}

              {/* Therapist fields */}
              {modal.type === 'therapist' && <>
                <Field label="Nama Terapis" value={modalForm.name || ''} onChange={v => setModalForm({...modalForm, name: v})} />
                <Field label="Spesialisasi" value={modalForm.specialization || ''} onChange={v => setModalForm({...modalForm, specialization: v})} />
              </>}

              {/* Room fields */}
              {modal.type === 'room' && <>
                <Field label="Nomor Ruangan" value={modalForm.room_number || ''} onChange={v => setModalForm({...modalForm, room_number: v})} />
                <Field label="Tipe" value={modalForm.type || ''} onChange={v => setModalForm({...modalForm, type: v})} placeholder="Spa / Salon / Facial" />
              </>}
            </div>

            <div className="flex gap-2 mt-5 justify-end">
              <button onClick={closeModal}
                className="h-9 px-4 rounded-md border border-slate-200 text-sm font-semibold hover:bg-slate-50">
                Batal
              </button>
              <button onClick={handleSave} disabled={modalLoading}
                className="h-9 px-4 rounded-md bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-2">
                <Check size={14} /> {modalLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
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
        <p className="text-sm font-bold">{label}</p>{icon}
      </div>
      <p className="mt-3 text-2xl font-black">{value}</p>
    </div>
  );
}

function Panel({ title, icon, children, action }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Badge({ color, children }) {
  const colors = {
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800'
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black ${colors[color]}`}>{children}</span>;
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      />
    </div>
  );
}