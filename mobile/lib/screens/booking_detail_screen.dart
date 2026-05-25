import 'package:flutter/material.dart';
import '../models/booking.dart';

class BookingDetailScreen extends StatelessWidget {
  const BookingDetailScreen({super.key, required this.booking});

  final Booking booking;

  String _formatDateTime(DateTime dateTime) {
    String twoDigits(int number) => number.toString().padLeft(2, '0');
    return '${twoDigits(dateTime.day)}/${twoDigits(dateTime.month)}/${dateTime.year} '
        '${twoDigits(dateTime.hour)}:${twoDigits(dateTime.minute)}';
  }

  String _formatRupiah(String price) {
    try {
      final value = double.parse(price).round();
      final rounded = value.toString();
      final buffer = StringBuffer();
      for (var i = 0; i < rounded.length; i += 1) {
        final reverseIndex = rounded.length - i;
        buffer.write(rounded[i]);
        if (reverseIndex > 1 && reverseIndex % 3 == 1) {
          buffer.write('.');
        }
      }
      return 'Rp $buffer';
    } catch (e) {
      return 'Rp $price';
    }
  }

  Color _getStatusColor() {
    switch (booking.status) {
      case 'Pending':
        return Colors.orange;
      case 'In_Progress':
        return Colors.green;
      case 'Done':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  String _getStatusLabel() {
    switch (booking.status) {
      case 'Pending':
        return 'Menunggu';
      case 'In_Progress':
        return 'Sedang Proses';
      case 'Done':
        return 'Selesai';
      default:
        return booking.status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Booking #${booking.id}'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Status Badge
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              decoration: BoxDecoration(
                color: _getStatusColor().withOpacity(0.1),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: _getStatusColor(), width: 2),
              ),
              child: Text(
                _getStatusLabel(),
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: _getStatusColor(),
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Service Info
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Detail Booking',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const Divider(height: 20),
                  _buildInfoRow(
                    Icons.spa,
                    'Layanan',
                    booking.service?.name ?? '-',
                  ),
                  const SizedBox(height: 12),
                  _buildInfoRow(
                    Icons.person,
                    'Terapis',
                    booking.therapist?.name ?? '-',
                  ),
                  const SizedBox(height: 12),
                  _buildInfoRow(
                    Icons.meeting_room,
                    'Ruangan',
                    booking.room?.roomNumber ?? '-',
                  ),
                  const SizedBox(height: 12),
                  _buildInfoRow(
                    Icons.calendar_today,
                    'Waktu',
                    _formatDateTime(booking.bookingTime),
                  ),
                  const SizedBox(height: 12),
                  _buildInfoRow(
                    Icons.attach_money,
                    'Total',
                    _formatRupiah(booking.service?.price ?? '0'),
                    valueColor: Theme.of(context).colorScheme.primary,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Payment Proof
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Bukti Pembayaran',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const Divider(height: 20),
                  if (booking.paymentProofUrl != null) ...[
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
                        booking.paymentProofUrl!,
                        height: 300,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            height: 300,
                            color: Colors.grey[200],
                            child: const Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.error_outline, size: 48),
                                  SizedBox(height: 8),
                                  Text('Gagal memuat gambar'),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Icon(
                          booking.paymentStatus == 'paid'
                              ? Icons.check_circle
                              : Icons.schedule,
                          color: booking.paymentStatus == 'paid'
                              ? Colors.green
                              : Colors.orange,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          booking.paymentStatus == 'paid'
                              ? 'Pembayaran Terverifikasi'
                              : 'Menunggu Verifikasi Admin',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: booking.paymentStatus == 'paid'
                                ? Colors.green
                                : Colors.orange,
                          ),
                        ),
                      ],
                    ),
                  ] else ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.orange[50],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.warning, color: Colors.orange),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Text(
                              'Bukti pembayaran belum diupload saat booking',
                              style: TextStyle(fontSize: 14),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value,
      {Color? valueColor}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: Colors.grey),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: valueColor,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
