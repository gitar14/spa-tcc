import 'package:flutter/material.dart';
import '../models/spa_service.dart';
import '../services/api_service.dart';
import '../widgets/service_card.dart';
import 'booking_flow_screen.dart';

class BrowseScreen extends StatefulWidget {
  const BrowseScreen({super.key});

  @override
  State<BrowseScreen> createState() => _BrowseScreenState();
}

class _BrowseScreenState extends State<BrowseScreen> {
  final ApiService _apiService = const ApiService();
  List<SpaService> _services = [];
  bool _loading = true;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  Future<void> _loadServices() async {
    setState(() {
      _loading = true;
      _errorMessage = '';
    });

    try {
      final services = await _apiService.getServices();
      setState(() {
        _services = services;
        _loading = false;
      });
    } catch (error) {
      setState(() {
        _errorMessage = 'Gagal memuat layanan: $error';
        _loading = false;
      });
    }
  }

  void _navigateToBooking(SpaService service) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BookingFlowScreen(service: service),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Browse Layanan'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loading ? null : _loadServices,
          ),
        ],
      ),
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _errorMessage.isNotEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.error_outline,
                            size: 64,
                            color: Colors.red,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _errorMessage,
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 16),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: _loadServices,
                            icon: const Icon(Icons.refresh),
                            label: const Text('Coba Lagi'),
                          ),
                        ],
                      ),
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _loadServices,
                    child: ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        Text(
                          'Pilih Layanan Spa',
                          style: Theme.of(context)
                              .textTheme
                              .headlineSmall
                              ?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Kami menyediakan berbagai layanan perawatan kecantikan untuk Anda',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 24),
                        ..._services.map(
                          (service) => Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: ServiceCard(
                              service: service,
                              onTap: () => _navigateToBooking(service),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
      ),
    );
  }
}
