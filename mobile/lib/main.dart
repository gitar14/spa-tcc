import 'package:flutter/material.dart';

import 'models/room.dart';
import 'models/spa_service.dart';
import 'models/therapist.dart';
import 'services/api_service.dart';

void main() {
  runApp(const SpaMobileApp());
}

class SpaMobileApp extends StatelessWidget {
  const SpaMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Spa Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0F766E)),
        inputDecorationTheme: const InputDecorationTheme(
          border: OutlineInputBorder(),
        ),
        useMaterial3: true,
      ),
      home: const BookingPage(),
    );
  }
}

class BookingPage extends StatefulWidget {
  const BookingPage({super.key});

  @override
  State<BookingPage> createState() => _BookingPageState();
}

class _BookingPageState extends State<BookingPage> {
  final ApiService _apiService = const ApiService();
  final TextEditingController _userIdController =
      TextEditingController(text: '1');

  List<SpaService> _services = const [];
  List<Therapist> _therapists = const [];
  List<Room> _rooms = const [];

  SpaService? _selectedService;
  Therapist? _selectedTherapist;
  Room? _selectedRoom;
  DateTime _bookingTime = DateTime.now().add(const Duration(hours: 2));
  bool _loading = true;
  bool _submitting = false;
  String _message = 'Memuat layanan dan terapis...';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _userIdController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      _loading = true;
      _message = 'Memuat layanan dan terapis...';
    });

    try {
      final results = await Future.wait([
        _apiService.getServices(),
        _apiService.getTherapists(),
        _apiService.getRooms(),
      ]);

      final services = results[0] as List<SpaService>;
      final therapists = results[1] as List<Therapist>;
      final rooms = results[2] as List<Room>;

      setState(() {
        _services = services;
        _therapists = therapists;
        _rooms = rooms;
        _selectedService = services.isNotEmpty ? services.first : null;
        _selectedTherapist = therapists.isNotEmpty ? therapists.first : null;
        _selectedRoom = rooms.isNotEmpty ? rooms.first : null;
        _message = 'Pilih layanan, terapis, dan jadwal perawatan.';
      });
    } catch (error) {
      setState(() {
        _message = 'Backend belum terhubung: $error';
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 60)),
      initialDate: _bookingTime,
    );
    if (date == null || !mounted) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_bookingTime),
    );
    if (time == null) return;

    setState(() {
      _bookingTime =
          DateTime(date.year, date.month, date.day, time.hour, time.minute);
    });
  }

  Future<void> _submitBooking() async {
    final userId = int.tryParse(_userIdController.text);
    if (userId == null ||
        _selectedService == null ||
        _selectedTherapist == null ||
        _selectedRoom == null) {
      setState(() {
        _message = 'Lengkapi data booking terlebih dahulu.';
      });
      return;
    }

    setState(() {
      _submitting = true;
      _message = 'Mengirim booking...';
    });

    try {
      await _apiService.createBooking(
        userId: userId,
        therapistId: _selectedTherapist!.id,
        serviceId: _selectedService!.id,
        roomId: _selectedRoom!.id,
        bookingTime: _bookingTime,
      );
      setState(() {
        _message = 'Booking berhasil dibuat. Silakan datang sesuai jadwal.';
      });
    } catch (error) {
      setState(() {
        _message = '$error';
      });
    } finally {
      setState(() {
        _submitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Booking Spa'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: _loading ? null : _loadData,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Text(
                'Booking Terapis & Layanan',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Pilih layanan kecantikan, terapis favorit, ruangan, dan jam perawatan.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 18),
              _MessageCard(message: _message, loading: _loading || _submitting),
              const SizedBox(height: 18),
              TextField(
                controller: _userIdController,
                decoration: const InputDecoration(
                  labelText: 'ID Pelanggan',
                  prefixIcon: Icon(Icons.person_outline),
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 14),
              _DropdownField<SpaService>(
                label: 'Layanan',
                icon: Icons.spa_outlined,
                value: _selectedService,
                items: _services,
                itemLabel: (service) =>
                    '${service.name} - ${service.durationMinutes} menit - ${_formatRupiah(service.price)}',
                onChanged: (value) => setState(() => _selectedService = value),
              ),
              const SizedBox(height: 14),
              _DropdownField<Therapist>(
                label: 'Terapis',
                icon: Icons.badge_outlined,
                value: _selectedTherapist,
                items: _therapists,
                itemLabel: (therapist) =>
                    '${therapist.name} - ${therapist.specialization}',
                onChanged: (value) =>
                    setState(() => _selectedTherapist = value),
              ),
              const SizedBox(height: 14),
              _DropdownField<Room>(
                label: 'Ruangan',
                icon: Icons.meeting_room_outlined,
                value: _selectedRoom,
                items: _rooms,
                itemLabel: (room) => '${room.roomNumber} - ${room.type}',
                onChanged: (value) => setState(() => _selectedRoom = value),
              ),
              const SizedBox(height: 14),
              OutlinedButton.icon(
                onPressed: _pickDateTime,
                icon: const Icon(Icons.calendar_month_outlined),
                label: Text(_formatDateTime(_bookingTime)),
              ),
              const SizedBox(height: 22),
              FilledButton.icon(
                onPressed: _loading || _submitting ? null : _submitBooking,
                icon: const Icon(Icons.check_circle_outline),
                label: Text(_submitting ? 'Memproses...' : 'Booking Sekarang'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DropdownField<T> extends StatelessWidget {
  const _DropdownField({
    required this.label,
    required this.icon,
    required this.value,
    required this.items,
    required this.itemLabel,
    required this.onChanged,
  });

  final String label;
  final IconData icon;
  final T? value;
  final List<T> items;
  final String Function(T item) itemLabel;
  final ValueChanged<T?> onChanged;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<T>(
      initialValue: value,
      isExpanded: true,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
      ),
      items: items
          .map(
            (item) => DropdownMenuItem<T>(
              value: item,
              child: Text(
                itemLabel(item),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          )
          .toList(),
      onChanged: items.isEmpty ? null : onChanged,
    );
  }
}

class _MessageCard extends StatelessWidget {
  const _MessageCard({
    required this.message,
    required this.loading,
  });

  final String message;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          if (loading)
            const SizedBox(
              height: 20,
              width: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          else
            const Icon(Icons.info_outline),
          const SizedBox(width: 12),
          Expanded(child: Text(message)),
        ],
      ),
    );
  }
}

String _formatDateTime(DateTime value) {
  String twoDigits(int number) => number.toString().padLeft(2, '0');
  return '${twoDigits(value.day)}/${twoDigits(value.month)}/${value.year} '
      '${twoDigits(value.hour)}:${twoDigits(value.minute)}';
}

String _formatRupiah(double value) {
  final rounded = value.round().toString();
  final buffer = StringBuffer();
  for (var i = 0; i < rounded.length; i += 1) {
    final reverseIndex = rounded.length - i;
    buffer.write(rounded[i]);
    if (reverseIndex > 1 && reverseIndex % 3 == 1) {
      buffer.write('.');
    }
  }
  return 'Rp$buffer';
}
