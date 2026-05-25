import 'package:flutter/material.dart';
import '../models/booking.dart';

class BookingCard extends StatelessWidget {
  const BookingCard({
    super.key,
    required this.booking,
    required this.onTap,
  });

  final Booking booking;
  final VoidCallback onTap;

  String _formatDateTime(DateTime dateTime) {
    String twoDigits(int number) => number.toString().padLeft(2, '0');
    return '${twoDigits(dateTime.day)}/${twoDigits(dateTime.month)}/${dateTime.year} '
        '${twoDigits(dateTime.hour)}:${twoDigits(dateTime.minute)}';
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

  IconData _getStatusIcon() {
    switch (booking.status) {
      case 'Pending':
        return Icons.schedule;
      case 'In_Progress':
        return Icons.play_circle_outline;
      case 'Done':
        return Icons.check_circle_outline;
      default:
        return Icons.info_outline;
    }
  }

  Color _getPaymentStatusColor() {
    switch (booking.paymentStatus) {
      case 'paid':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      default:
        return Colors.red;
    }
  }

  String _getPaymentStatusLabel() {
    switch (booking.paymentStatus) {
      case 'paid':
        return 'Lunas';
      case 'pending':
        return 'Menunggu Verifikasi';
      default:
        return 'Belum Bayar';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Booking #${booking.id}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: _getStatusColor().withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _getStatusIcon(),
                          size: 14,
                          color: _getStatusColor(),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _getStatusLabel(),
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: _getStatusColor(),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.spa, size: 18, color: Colors.grey),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      booking.service?.name ?? 'Layanan',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.person_outline, size: 18, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(
                    booking.therapist?.name ?? 'Terapis',
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.meeting_room_outlined, size: 18, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(
                    booking.room?.roomNumber ?? 'Ruangan',
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.calendar_today, size: 18, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(
                    _formatDateTime(booking.bookingTime),
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),
              const Divider(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.payment,
                        size: 16,
                        color: _getPaymentStatusColor(),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        _getPaymentStatusLabel(),
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: _getPaymentStatusColor(),
                        ),
                      ),
                    ],
                  ),
                  const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
