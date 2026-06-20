import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/main_screen.dart';
import 'services/auth_storage.dart';

void main() {
  runApp(const SpaMobileApp());
}

class SpaMobileApp extends StatelessWidget {
  const SpaMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Spa Booking',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0F766E)),
        useMaterial3: true,
      ),
      home: const SplashRouter(),
    );
  }
}

/// Widget yang mengecek sesi tersimpan sebelum menentukan halaman awal.
/// - Jika ada data user di local storage → langsung ke MainScreen (auto-login)
/// - Jika tidak ada → ke LoginScreen seperti biasa
class SplashRouter extends StatefulWidget {
  const SplashRouter({super.key});

  @override
  State<SplashRouter> createState() => _SplashRouterState();
}

class _SplashRouterState extends State<SplashRouter> {
  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    final user = await AuthStorage.loadUser();

    if (!mounted) return;

    if (user != null) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => MainScreen(user: user)),
      );
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Tampilkan splash sederhana sambil mengecek sesi
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
