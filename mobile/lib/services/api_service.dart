import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

import '../config/api_config.dart';
import '../models/booking.dart';
import '../models/health_status.dart';
import '../models/room.dart';
import '../models/spa_service.dart';
import '../models/therapist.dart';
import '../models/user.dart';

class ApiService {
  const ApiService({http.Client? client}) : _client = client;

  final http.Client? _client;

  Future<HealthStatus> getHealth() async {
    final client = _client ?? http.Client();
    final uri = Uri.parse('${ApiConfig.baseUrl}/health');

    try {
      final response = await client.get(uri);
      if (response.statusCode != 200) {
        throw Exception('HTTP ${response.statusCode}');
      }

      final json = jsonDecode(response.body) as Map<String, dynamic>;
      return HealthStatus.fromJson(json);
    } finally {
      if (_client == null) client.close();
    }
  }

  Future<List<User>> getUsers() async {
    final json = await _getList('/users');
    return json.map(User.fromJson).toList();
  }

  Future<List<SpaService>> getServices() async {
    final json = await _getList('/services');
    return json.map(SpaService.fromJson).toList();
  }

  Future<List<Therapist>> getTherapists() async {
    final json = await _getList('/therapists');
    return json.map(Therapist.fromJson).toList();
  }

  Future<List<Room>> getRooms() async {
    final json = await _getList('/rooms');
    return json.map(Room.fromJson).toList();
  }

  Future<void> createBooking({
    required int userId,
    required int therapistId,
    required int serviceId,
    required int roomId,
    required DateTime bookingTime,
  }) async {
    final client = _client ?? http.Client();
    final uri = Uri.parse('${ApiConfig.baseUrl}/bookings');

    try {
      final response = await client.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'user_id': userId,
          'therapist_id': therapistId,
          'service_id': serviceId,
          'room_id': roomId,
          'booking_time': bookingTime.toIso8601String(),
        }),
      );

      if (response.statusCode < 200 || response.statusCode >= 300) {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        throw Exception(body['error'] ?? 'Booking gagal diproses');
      }
    } finally {
      if (_client == null) client.close();
    }
  }

  // Create booking with customer details (NEW - for mobile app)
  Future<Map<String, dynamic>> createBookingWithDetails({
    required String name,
    required String phone,
    required int therapistId,
    required int serviceId,
    required int roomId,
    required DateTime bookingTime,
  }) async {
    final client = _client ?? http.Client();
    final uri = Uri.parse('${ApiConfig.baseUrl}/bookings');

    try {
      final response = await client.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'phone': phone,
          'therapist_id': therapistId,
          'service_id': serviceId,
          'room_id': roomId,
          'booking_time': bookingTime.toIso8601String(),
        }),
      );

      if (response.statusCode < 200 || response.statusCode >= 300) {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        throw Exception(body['error'] ?? 'Booking gagal diproses');
      }

      return jsonDecode(response.body) as Map<String, dynamic>;
    } finally {
      if (_client == null) client.close();
    }
  }

  // Get user's bookings
  Future<List<Booking>> getUserBookings(int userId) async {
    final client = _client ?? http.Client();
    final uri = Uri.parse('${ApiConfig.baseUrl}/users/$userId/bookings');

    try {
      final response = await client.get(uri);
      if (response.statusCode != 200) {
        throw Exception('HTTP ${response.statusCode}');
      }

      final json = jsonDecode(response.body) as List<dynamic>;
      return json
          .cast<Map<String, dynamic>>()
          .map(Booking.fromJson)
          .toList();
    } finally {
      if (_client == null) client.close();
    }
  }

  // Upload payment proof
  Future<void> uploadPaymentProof(int bookingId, File imageFile) async {
    final uri = Uri.parse('${ApiConfig.baseUrl}/payments/$bookingId/proof');
    print('🔗 Upload URL: $uri');
    print('📁 File path: ${imageFile.path}');
    print('📁 File exists: ${imageFile.existsSync()}');
    print('📁 File size: ${imageFile.lengthSync()} bytes');

    final request = http.MultipartRequest('POST', uri);

    // Explicitly set content type as image/jpeg
    request.files.add(
      http.MultipartFile.fromBytes(
        'payment_proof',
        await imageFile.readAsBytes(),
        filename: 'payment_proof.jpg',
        contentType: MediaType('image', 'jpeg'),
      ),
    );

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    print('📡 Upload response status: ${response.statusCode}');
    print('📡 Upload response body: ${response.body}');

    if (response.statusCode < 200 || response.statusCode >= 300) {
      try {
        final body = jsonDecode(response.body) as Map<String, dynamic>;
        throw Exception(body['error'] ?? 'Upload bukti bayar gagal');
      } catch (e) {
        throw Exception('Upload gagal: HTTP ${response.statusCode}');
      }
    }
  }

  Future<List<Map<String, dynamic>>> _getList(String path) async {
    final client = _client ?? http.Client();
    final uri = Uri.parse('${ApiConfig.baseUrl}$path');

    try {
      final response = await client.get(uri);
      if (response.statusCode != 200) {
        throw Exception('HTTP ${response.statusCode}');
      }

      final json = jsonDecode(response.body);
      return (json as List).cast<Map<String, dynamic>>();
    } finally {
      if (_client == null) client.close();
    }
  }
}