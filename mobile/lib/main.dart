import 'package:flutter/material.dart';

import 'models/health_status.dart';
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
        useMaterial3: true,
      ),
      home: const MobileDashboard(),
    );
  }
}

class MobileDashboard extends StatefulWidget {
  const MobileDashboard({super.key});

  @override
  State<MobileDashboard> createState() => _MobileDashboardState();
}

class _MobileDashboardState extends State<MobileDashboard> {
  final ApiService _apiService = const ApiService();
  late Future<HealthStatus> _healthFuture;

  @override
  void initState() {
    super.initState();
    _healthFuture = _apiService.getHealth();
  }

  void _refresh() {
    setState(() {
      _healthFuture = _apiService.getHealth();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Spa Mobile'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: _refresh,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Dashboard Mobile',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Aplikasi Flutter ini sudah disiapkan untuk membaca REST API backend.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 24),
              FutureBuilder<HealthStatus>(
                future: _healthFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const _StatusCard(
                      icon: Icons.sync,
                      title: 'Menghubungkan backend',
                      subtitle: 'Memeriksa endpoint /api/health',
                    );
                  }

                  if (snapshot.hasError) {
                    return _StatusCard(
                      icon: Icons.error_outline,
                      title: 'Backend belum terhubung',
                      subtitle: '${snapshot.error}',
                    );
                  }

                  final health = snapshot.data!;
                  return _StatusCard(
                    icon: Icons.check_circle_outline,
                    title: health.service,
                    subtitle: 'Status backend: ${health.status}',
                  );
                },
              ),
              const SizedBox(height: 16),
              const _InfoTile(
                title: 'Local Android emulator',
                value: 'http://10.0.2.2:8080/api',
              ),
              const _InfoTile(
                title: 'Production',
                value: '--dart-define=API_BASE_URL=https://URL-CLOUD-RUN/api',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  const _StatusCard({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Icon(icon, size: 32),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(subtitle),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(value),
        ],
      ),
    );
  }
}
