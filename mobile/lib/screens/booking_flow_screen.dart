import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../models/spa_service.dart';
import '../models/therapist.dart';
import '../services/api_service.dart';

class BookingFlowScreen extends StatefulWidget {
  const BookingFlowScreen({super.key, required this.service});

  final SpaService service;

  @override
  State<BookingFlowScreen> createState() => _BookingFlowScreenState();
}

class _BookingFlowScreenState extends State<BookingFlowScreen> {
  final ApiService _apiService = const ApiService();
  final ImagePicker _picker = ImagePicker();
  final PageController _pageController = PageController();

  int _currentStep = 0;

  // Form data
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  List<Therapist> _therapists = [];
  Therapist? _selectedTherapist;
  String _selectedRoomType = 'Reguler';
  DateTime _selectedDateTime = DateTime.now().add(const Duration(hours: 2));
  File? _paymentProofImage;

  bool _loading = true;
  bool _submitting = false;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _loadTherapists();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _loadTherapists() async {
    setState(() {
      _loading = true;
      _errorMessage = '';
    });

    try {
      final therapists = await _apiService.getTherapists();
      setState(() {
        _therapists = therapists;
        _selectedTherapist = therapists.isNotEmpty ? therapists.first : null;
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _errorMessage = 'Gagal memuat data: $error';
        _loading = false;
      });
    }
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 60)),
      initialDate: _selectedDateTime,
    );
    if (date == null || !mounted) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_selectedDateTime),
    );
    if (time == null) return;

    setState(() {
      _selectedDateTime = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      );
    });
  }

  Future<void> _pickPaymentProof() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );

      if (image == null) return;

      final imageFile = File(image.path);
      final fileSize = await imageFile.length();

      if (fileSize > 5 * 1024 * 1024) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('❌ File terlalu besar! Max 5MB'),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }

      setState(() => _paymentProofImage = imageFile);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('❌ Error: $error')),
      );
    }
  }

  void _nextStep() {
    if (_currentStep == 0) {
      // Validate step 1
      if (_nameController.text.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Nama tidak boleh kosong')),
        );
        return;
      }
      if (_phoneController.text.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No telepon tidak boleh kosong')),
        );
        return;
      }
    } else if (_currentStep == 1) {
      // Validate step 2
      if (_paymentProofImage == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Upload bukti bayar terlebih dahulu')),
        );
        return;
      }
    }

    if (_currentStep < 2) {
      setState(() => _currentStep++);
      _pageController.animateToPage(
        _currentStep,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
      _pageController.animateToPage(
        _currentStep,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _submitBooking() async {
    setState(() => _submitting = true);

    try {
      // Step 1: Create booking (hardcoded user_id = 1 for now)
      await _apiService.createBooking(
        userId: 1, // Alya Customer
        therapistId: _selectedTherapist!.id,
        serviceId: widget.service.id,
        roomId: _getRoomIdByType(_selectedRoomType),
        bookingTime: _selectedDateTime,
      );

      // Step 2: Get latest booking ID (simplified - in production use response from createBooking)
      final bookings = await _apiService.getUserBookings(1);
      final latestBooking = bookings.first;

      // Step 3: Upload payment proof
      await _apiService.uploadPaymentProof(
        latestBooking.id,
        _paymentProofImage!,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✅ Booking berhasil dibuat!'),
          backgroundColor: Colors.green,
        ),
      );

      Navigator.pop(context);
    } catch (error) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('❌ $error')),
      );
    } finally {
      setState(() => _submitting = false);
    }
  }

  int _getRoomIdByType(String type) {
    switch (type) {
      case 'VIP':
        return 2;
      case 'Suite':
        return 3;
      default:
        return 1; // Reguler
    }
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
    return 'Rp $buffer';
  }

  String _formatDateTime(DateTime dateTime) {
    String twoDigits(int number) => number.toString().padLeft(2, '0');
    return '${twoDigits(dateTime.day)}/${twoDigits(dateTime.month)}/${dateTime.year} '
        '${twoDigits(dateTime.hour)}:${twoDigits(dateTime.minute)}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Booking'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage.isNotEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 64, color: Colors.red),
                        const SizedBox(height: 16),
                        Text(_errorMessage, textAlign: TextAlign.center),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: _loadTherapists,
                          child: const Text('Coba Lagi'),
                        ),
                      ],
                    ),
                  ),
                )
              : Column(
                  children: [
                    _buildStepIndicator(),
                    Expanded(
                      child: PageView(
                        controller: _pageController,
                        physics: const NeverScrollableScrollPhysics(),
                        children: [
                          _buildStep1DataBooking(),
                          _buildStep2UploadPayment(),
                          _buildStep3Confirmation(),
                        ],
                      ),
                    ),
                    _buildBottomBar(),
                  ],
                ),
    );
  }

  Widget _buildStepIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        border: Border(
          bottom: BorderSide(
            color: Theme.of(context).colorScheme.outlineVariant,
          ),
        ),
      ),
      child: Row(
        children: [
          _buildStepCircle(0, 'Data'),
          Expanded(child: _buildStepLine(0)),
          _buildStepCircle(1, 'Bayar'),
          Expanded(child: _buildStepLine(1)),
          _buildStepCircle(2, 'Konfirmasi'),
        ],
      ),
    );
  }

  Widget _buildStepCircle(int step, String label) {
    final isActive = _currentStep >= step;
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isActive
                ? Theme.of(context).colorScheme.primary
                : Theme.of(context).colorScheme.surfaceContainerHigh,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              '${step + 1}',
              style: TextStyle(
                color: isActive ? Colors.white : Colors.grey,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: isActive ? Theme.of(context).colorScheme.primary : Colors.grey,
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  Widget _buildStepLine(int step) {
    final isActive = _currentStep > step;
    return Container(
      height: 2,
      margin: const EdgeInsets.only(bottom: 20),
      color: isActive
          ? Theme.of(context).colorScheme.primary
          : Theme.of(context).colorScheme.surfaceContainerHigh,
    );
  }

  Widget _buildStep1DataBooking() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          widget.service.name,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        Text(
          '${widget.service.durationMinutes} menit • ${_formatRupiah(widget.service.price)}',
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Theme.of(context).colorScheme.primary,
              ),
        ),
        const SizedBox(height: 24),
        TextField(
          controller: _nameController,
          decoration: const InputDecoration(
            labelText: 'Nama Pelanggan',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.person),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _phoneController,
          keyboardType: TextInputType.phone,
          decoration: const InputDecoration(
            labelText: 'No Telepon',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.phone),
          ),
        ),
        const SizedBox(height: 16),
        OutlinedButton.icon(
          onPressed: _pickDateTime,
          icon: const Icon(Icons.calendar_month),
          label: Text(_formatDateTime(_selectedDateTime)),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.all(16),
            alignment: Alignment.centerLeft,
          ),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<Therapist>(
          value: _selectedTherapist,
          decoration: const InputDecoration(
            labelText: 'Pilih Terapis',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.badge),
          ),
          items: _therapists
              .map((therapist) => DropdownMenuItem(
                    value: therapist,
                    child: Text(therapist.name),
                  ))
              .toList(),
          onChanged: (value) => setState(() => _selectedTherapist = value),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          value: _selectedRoomType,
          decoration: const InputDecoration(
            labelText: 'Jenis Ruangan',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.meeting_room),
          ),
          items: const [
            DropdownMenuItem(value: 'Reguler', child: Text('Reguler')),
            DropdownMenuItem(value: 'VIP', child: Text('VIP')),
            DropdownMenuItem(value: 'Suite', child: Text('Suite')),
          ],
          onChanged: (value) => setState(() => _selectedRoomType = value!),
        ),
      ],
    );
  }

  Widget _buildStep2UploadPayment() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          'Upload Bukti Pembayaran',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 8),
        Text(
          'Transfer ke rekening BCA 1234567890 a.n. Spa & Salon',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        const SizedBox(height: 24),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Text(
                  'Total Pembayaran',
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  _formatRupiah(widget.service.price),
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        if (_paymentProofImage != null) ...[
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.file(
              _paymentProofImage!,
              height: 300,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 16),
        ],
        FilledButton.icon(
          onPressed: _pickPaymentProof,
          icon: const Icon(Icons.upload_file),
          label: Text(_paymentProofImage == null
              ? 'Upload Bukti Transfer'
              : 'Ganti Foto'),
          style: FilledButton.styleFrom(
            padding: const EdgeInsets.all(16),
          ),
        ),
      ],
    );
  }

  Widget _buildStep3Confirmation() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text(
          'Konfirmasi Booking',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildInfoRow('Layanan', widget.service.name),
                const Divider(height: 24),
                _buildInfoRow('Nama', _nameController.text),
                const Divider(height: 24),
                _buildInfoRow('No Telepon', _phoneController.text),
                const Divider(height: 24),
                _buildInfoRow('Tanggal & Waktu', _formatDateTime(_selectedDateTime)),
                const Divider(height: 24),
                _buildInfoRow('Terapis', _selectedTherapist?.name ?? '-'),
                const Divider(height: 24),
                _buildInfoRow('Jenis Ruangan', _selectedRoomType),
                const Divider(height: 24),
                _buildInfoRow('Total', _formatRupiah(widget.service.price)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        if (_paymentProofImage != null)
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.file(
              _paymentProofImage!,
              height: 200,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(color: Colors.grey),
        ),
        Flexible(
          child: Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 15,
            ),
            textAlign: TextAlign.end,
          ),
        ),
      ],
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          top: BorderSide(
            color: Theme.of(context).colorScheme.outlineVariant,
          ),
        ),
      ),
      child: Row(
        children: [
          if (_currentStep > 0)
            Expanded(
              child: OutlinedButton(
                onPressed: _submitting ? null : _previousStep,
                child: const Text('Kembali'),
              ),
            ),
          if (_currentStep > 0) const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: FilledButton(
              onPressed: _submitting
                  ? null
                  : _currentStep < 2
                      ? _nextStep
                      : _submitBooking,
              child: _submitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(_currentStep < 2 ? 'Lanjut' : 'Konfirmasi Booking'),
            ),
          ),
        ],
      ),
    );
  }
}
