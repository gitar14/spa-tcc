import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import '../models/spa_service.dart';
import '../models/therapist.dart';
import '../services/api_service.dart';

class BookingFlowScreen extends StatefulWidget {
  final SpaService service;

  const BookingFlowScreen({super.key, required this.service});

  @override
  State<BookingFlowScreen> createState() => _BookingFlowScreenState();
}

class _BookingFlowScreenState extends State<BookingFlowScreen> {
  final ApiService _apiService = const ApiService();
  final PageController _pageController = PageController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();

  int _currentStep = 0;
  DateTime _selectedDateTime = DateTime.now().add(const Duration(days: 1));
  Therapist? _selectedTherapist;
  String _selectedRoomType = 'Reguler';
  File? _paymentProofImage;
  bool _submitting = false;

  List<Therapist> _therapists = [];

  @override
  void initState() {
    super.initState();
    _loadTherapists();
  }

  Future<void> _loadTherapists() async {
    try {
      final therapists = await _apiService.getTherapists();
      setState(() {
        _therapists = therapists;
        if (therapists.isNotEmpty) {
          _selectedTherapist = therapists.first;
        }
      });
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memuat terapis: $error')),
      );
    }
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedDateTime,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );

    if (date == null || !mounted) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_selectedDateTime),
    );

    if (time == null || !mounted) return;

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
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (pickedFile == null) return;

      final imageFile = File(pickedFile.path);
      if (!mounted) return;

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
      // Step 2 - payment proof is optional, no validation needed
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
      print('📤 Submitting booking...');
      print('Name: ${_nameController.text.trim()}');
      print('Phone: ${_phoneController.text.trim()}');
      print('Therapist: ${_selectedTherapist!.id}');
      print('Service: ${widget.service.id}');
      print('Room: ${_getRoomIdByType(_selectedRoomType)}');
      print('Time: ${_selectedDateTime.toIso8601String()}');
      
      // Step 1: Create booking with customer details
      final bookingResponse = await _apiService.createBookingWithDetails(
        name: _nameController.text.trim(),
        phone: _phoneController.text.trim(),
        therapistId: _selectedTherapist!.id,
        serviceId: widget.service.id,
        roomId: _getRoomIdByType(_selectedRoomType),
        bookingTime: _selectedDateTime,
      );

      print('✅ Booking created: ${bookingResponse['id']}');

      // Step 2: Upload payment proof (OPTIONAL)
      if (_paymentProofImage != null) {
        print('📤 Uploading payment proof...');
        final bookingId = bookingResponse['id'] as int;
        await _apiService.uploadPaymentProof(
          bookingId,
          _paymentProofImage!,
        );
        print('✅ Payment proof uploaded');
      } else {
        print('⚠️ No payment proof uploaded (optional)');
      }

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

      print('❌ Error: $error');
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
        return 1;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Booking'),
        elevation: 0,
      ),
      body: Column(
        children: [
          _buildStepper(),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildStep1DataBooking(),
                _buildStep2PaymentProof(),
                _buildStep3Confirmation(),
              ],
            ),
          ),
          _buildNavigationButtons(),
        ],
      ),
    );
  }

  Widget _buildStepper() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.grey[100],
      child: Row(
        children: [
          _buildStepCircle(1, 'Data', _currentStep >= 0),
          _buildStepLine(_currentStep >= 1),
          _buildStepCircle(2, 'Bayar', _currentStep >= 1),
          _buildStepLine(_currentStep >= 2),
          _buildStepCircle(3, 'Konfirmasi', _currentStep >= 2),
        ],
      ),
    );
  }

  Widget _buildStepCircle(int step, String label, bool isActive) {
    return Column(
      children: [
        CircleAvatar(
          radius: 20,
          backgroundColor: isActive ? Colors.teal : Colors.grey[300],
          child: Text(
            '$step',
            style: TextStyle(
              color: isActive ? Colors.white : Colors.grey[600],
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isActive ? Colors.teal : Colors.grey[600],
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  Widget _buildStepLine(bool isActive) {
    return Expanded(
      child: Container(
        height: 2,
        color: isActive ? Colors.teal : Colors.grey[300],
        margin: const EdgeInsets.only(bottom: 24),
      ),
    );
  }

  Widget _buildStep1DataBooking() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Data Booking',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _nameController,
            decoration: const InputDecoration(
              labelText: 'Nama Pelanggan',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _phoneController,
            decoration: const InputDecoration(
              labelText: 'No Telepon',
              border: OutlineInputBorder(),
            ),
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 16),
          ListTile(
            title: const Text('Tanggal & Waktu'),
            subtitle: Text(
              DateFormat('dd/MM/yyyy HH:mm').format(_selectedDateTime),
            ),
            trailing: const Icon(Icons.calendar_today),
            onTap: _pickDateTime,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
              side: BorderSide(color: Colors.grey[300]!),
            ),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<Therapist>(
            initialValue: _selectedTherapist,
            decoration: const InputDecoration(
              labelText: 'Pilih Terapis',
              border: OutlineInputBorder(),
            ),
            items: _therapists.map((therapist) {
              return DropdownMenuItem(
                value: therapist,
                child: Text(therapist.name),
              );
            }).toList(),
            onChanged: (value) {
              setState(() => _selectedTherapist = value);
            },
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            initialValue: _selectedRoomType,
            decoration: const InputDecoration(
              labelText: 'Jenis Ruangan',
              border: OutlineInputBorder(),
            ),
            items: ['Reguler', 'VIP', 'Suite'].map((type) {
              return DropdownMenuItem(
                value: type,
                child: Text(type),
              );
            }).toList(),
            onChanged: (value) {
              setState(() => _selectedRoomType = value!);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStep2PaymentProof() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Upload Bukti Bayar',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                const Text(
                  'Total Pembayaran',
                  style: TextStyle(fontSize: 16),
                ),
                const SizedBox(height: 8),
                Text(
                  'Rp ${NumberFormat('#,###').format(widget.service.price)}',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.teal,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: _pickPaymentProof,
            icon: const Icon(Icons.upload_file),
            label: Text(_paymentProofImage == null
                ? 'Upload Bukti Transfer (Opsional)'
                : 'Ganti Foto'),
            style: FilledButton.styleFrom(
              padding: const EdgeInsets.all(16),
            ),
          ),
          if (_paymentProofImage != null) ...[
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.file(
                _paymentProofImage!,
                height: 200,
                fit: BoxFit.cover,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStep3Confirmation() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Konfirmasi Booking',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoRow('Layanan', widget.service.name),
                  const Divider(),
                  _buildInfoRow('Nama', _nameController.text),
                  const Divider(),
                  _buildInfoRow('No Telepon', _phoneController.text),
                  const Divider(),
                  _buildInfoRow(
                    'Tanggal & Waktu',
                    DateFormat('dd/MM/yyyy HH:mm').format(_selectedDateTime),
                  ),
                  const Divider(),
                  _buildInfoRow('Terapis', _selectedTherapist?.name ?? '-'),
                  const Divider(),
                  _buildInfoRow('Jenis Ruangan', _selectedRoomType),
                  const Divider(),
                  _buildInfoRow(
                    'Total',
                    'Rp ${NumberFormat('#,###').format(widget.service.price)}',
                  ),
                ],
              ),
            ),
          ),
          if (_paymentProofImage != null) ...[
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.file(
                _paymentProofImage!,
                height: 200,
                fit: BoxFit.cover,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(color: Colors.grey[600]),
          ),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildNavigationButtons() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 5,
          ),
        ],
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
          if (_currentStep > 0) const SizedBox(width: 16),
          Expanded(
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
                        valueColor: AlwaysStoppedAnimation(Colors.white),
                      ),
                    )
                  : Text(_currentStep < 2 ? 'Lanjut' : 'Konfirmasi Booking'),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }
}