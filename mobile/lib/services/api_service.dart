import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';
import '../models/health_status.dart';

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
}
