import 'package:flutter/material.dart';
import '../models/booking.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/auth_storage.dart';
import 'booking_detail_screen.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key, required this.user});

  final User user;

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ApiService _apiService = const ApiService();

  late User _user;
  List<Booking> _bookings = [];
  bool _loadingBookings = true;
  String _bookingError = '';

  @override
  void initState() {
    super.initState();
    _user = widget.user;
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    setState(() {
      _loadingBookings = true;
      _bookingError = '';
    });
    try {
      final bookings = await _apiService.getUserBookings(_user.id);
      setState(() {
        _bookings = bookings;
        _loadingBookings = false;
      });
    } catch (e) {
      setState(() {
        _bookingError = 'Gagal memuat riwayat booking';
        _loadingBookings = false;
      });
    }
  }

  // ─── Dialog Ganti Email ────────────────────────────────────────────────────

  Future<void> _showChangeEmailDialog() async {
    final emailController = TextEditingController(text: _user.email);
    final passwordController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool submitting = false;
    String? errorMsg;

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Ganti Email'),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Email Baru',
                    prefixIcon: Icon(Icons.email_outlined),
                    border: OutlineInputBorder(),
                  ),
                  validator: (v) {
                    final val = v?.trim() ?? '';
                    if (val.isEmpty) return 'Email wajib diisi';
                    final rx = RegExp(r'^[\w\.\-+]+@[\w\-]+\.[\w\-\.]+$');
                    if (!rx.hasMatch(val)) return 'Format email tidak valid';
                    if (val == _user.email) return 'Email sama dengan sekarang';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Password Saat Ini',
                    prefixIcon: Icon(Icons.lock_outline),
                    border: OutlineInputBorder(),
                  ),
                  validator: (v) =>
                      (v?.isEmpty ?? true) ? 'Password wajib diisi' : null,
                ),
                if (errorMsg != null) ...[
                  const SizedBox(height: 12),
                  Text(errorMsg!,
                      style: const TextStyle(color: Colors.red, fontSize: 13)),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: submitting ? null : () => Navigator.pop(ctx),
              child: const Text('Batal'),
            ),
            ElevatedButton(
              onPressed: submitting
                  ? null
                  : () async {
                      if (!formKey.currentState!.validate()) return;
                      setDialogState(() {
                        submitting = true;
                        errorMsg = null;
                      });
                      try {
                        final updatedUser = await _apiService.updateEmail(
                          userId: _user.id,
                          newEmail: emailController.text.trim(),
                          currentPassword: passwordController.text,
                        );
                        await AuthStorage.saveUser(updatedUser);
                        setState(() => _user = updatedUser);
                        if (ctx.mounted) Navigator.pop(ctx);
                        if (mounted) {
                          _showSnackBar('Email berhasil diperbarui', Colors.green);
                        }
                      } catch (e) {
                        setDialogState(() {
                          errorMsg = e.toString().replaceFirst('Exception: ', '');
                          submitting = false;
                        });
                      }
                    },
              child: submitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Simpan'),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Dialog Ganti Password ─────────────────────────────────────────────────

  Future<void> _showChangePasswordDialog() async {
    final currentController = TextEditingController();
    final newController = TextEditingController();
    final confirmController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool submitting = false;
    String? errorMsg;
    bool obscureCurrent = true;
    bool obscureNew = true;
    bool obscureConfirm = true;

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Ganti Password'),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: currentController,
                  obscureText: obscureCurrent,
                  decoration: InputDecoration(
                    labelText: 'Password Saat Ini',
                    prefixIcon: const Icon(Icons.lock_outline),
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      icon: Icon(obscureCurrent
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined),
                      onPressed: () => setDialogState(
                          () => obscureCurrent = !obscureCurrent),
                    ),
                  ),
                  validator: (v) =>
                      (v?.isEmpty ?? true) ? 'Password lama wajib diisi' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: newController,
                  obscureText: obscureNew,
                  decoration: InputDecoration(
                    labelText: 'Password Baru',
                    prefixIcon: const Icon(Icons.lock_reset_outlined),
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      icon: Icon(obscureNew
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined),
                      onPressed: () =>
                          setDialogState(() => obscureNew = !obscureNew),
                    ),
                  ),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Password baru wajib diisi';
                    if (v.length < 6) return 'Minimal 6 karakter';
                    if (v == currentController.text) {
                      return 'Password baru tidak boleh sama';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: confirmController,
                  obscureText: obscureConfirm,
                  decoration: InputDecoration(
                    labelText: 'Konfirmasi Password Baru',
                    prefixIcon: const Icon(Icons.lock_reset_outlined),
                    border: const OutlineInputBorder(),
                    suffixIcon: IconButton(
                      icon: Icon(obscureConfirm
                          ? Icons.visibility_outlined
                          : Icons.visibility_off_outlined),
                      onPressed: () => setDialogState(
                          () => obscureConfirm = !obscureConfirm),
                    ),
                  ),
                  validator: (v) {
                    if (v != newController.text) return 'Password tidak cocok';
                    return null;
                  },
                ),
                if (errorMsg != null) ...[
                  const SizedBox(height: 12),
                  Text(errorMsg!,
                      style: const TextStyle(color: Colors.red, fontSize: 13)),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: submitting ? null : () => Navigator.pop(ctx),
              child: const Text('Batal'),
            ),
            ElevatedButton(
              onPressed: submitting
                  ? null
                  : () async {
                      if (!formKey.currentState!.validate()) return;
                      setDialogState(() {
                        submitting = true;
                        errorMsg = null;
                      });
                      try {
                        await _apiService.updatePassword(
                          userId: _user.id,
                          currentPassword: currentController.text,
                          newPassword: newController.text,
                        );
                        if (ctx.mounted) Navigator.pop(ctx);
                        if (mounted) {
                          _showSnackBar(
                              'Password berhasil diperbarui', Colors.green);
                        }
                      } catch (e) {
                        setDialogState(() {
                          errorMsg = e.toString().replaceFirst('Exception: ', '');
                          submitting = false;
                        });
                      }
                    },
              child: submitting
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Simpan'),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Logout ────────────────────────────────────────────────────────────────

  Future<void> _logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Keluar Akun'),
        content: const Text('Apakah Anda yakin ingin keluar?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Keluar'),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    await AuthStorage.clearUser();

    if (!mounted) return;

    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  void _showSnackBar(String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
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

  String _getStatusLabel(String status) {
    switch (status) {
      case 'Pending':
        return 'Menunggu';
      case 'In_Progress':
        return 'Sedang Proses';
      case 'Done':
        return 'Selesai';
      default:
        return status;
    }
  }

  String _formatDateTime(DateTime dt) {
    String d(int n) => n.toString().padLeft(2, '0');
    return '${d(dt.day)}/${d(dt.month)}/${dt.year} ${d(dt.hour)}:${d(dt.minute)}';
  }

  // ─── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _loadBookings,
        child: CustomScrollView(
          slivers: [
            // ── App Bar + Avatar ──────────────────────────────────────────
            SliverAppBar(
              expandedHeight: 220,
              pinned: true,
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        colorScheme.primary,
                        colorScheme.primary.withOpacity(0.8),
                      ],
                    ),
                  ),
                  child: SafeArea(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(height: 16),
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: Colors.white.withOpacity(0.2),
                          child: Text(
                            _user.name.isNotEmpty
                                ? _user.name[0].toUpperCase()
                                : '?',
                            style: const TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _user.name,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _user.email,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withOpacity(0.85),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              title: const Text('Profil Saya'),
            ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Info Akun ───────────────────────────────────────
                    Card(
                      child: Column(
                        children: [
                          ListTile(
                            leading: Icon(Icons.badge_outlined,
                                color: colorScheme.primary),
                            title: const Text('Role'),
                            subtitle: Text(_user.role),
                          ),
                          const Divider(height: 1, indent: 16),
                          ListTile(
                            leading: Icon(Icons.tag,
                                color: colorScheme.primary),
                            title: const Text('User ID'),
                            subtitle: Text('${_user.id}'),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // ── Pengaturan Akun ─────────────────────────────────
                    Text(
                      'Pengaturan Akun',
                      style: Theme.of(context)
                          .textTheme
                          .titleSmall
                          ?.copyWith(color: Colors.grey[600]),
                    ),
                    const SizedBox(height: 8),
                    Card(
                      child: Column(
                        children: [
                          ListTile(
                            leading: Icon(Icons.email_outlined,
                                color: colorScheme.primary),
                            title: const Text('Ganti Email'),
                            subtitle: Text(_user.email),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: _showChangeEmailDialog,
                          ),
                          const Divider(height: 1, indent: 16),
                          ListTile(
                            leading: Icon(Icons.lock_outline,
                                color: colorScheme.primary),
                            title: const Text('Ganti Password'),
                            subtitle: const Text('••••••••'),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: _showChangePasswordDialog,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // ── Riwayat Booking ─────────────────────────────────
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Riwayat Booking',
                          style: Theme.of(context)
                              .textTheme
                              .titleSmall
                              ?.copyWith(color: Colors.grey[600]),
                        ),
                        if (!_loadingBookings && _bookings.isNotEmpty)
                          Text(
                            '${_bookings.length} booking',
                            style: TextStyle(
                              fontSize: 13,
                              color: colorScheme.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    if (_loadingBookings)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 32),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    else if (_bookingError.isNotEmpty)
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            children: [
                              const Icon(Icons.error_outline,
                                  color: Colors.red, size: 40),
                              const SizedBox(height: 8),
                              Text(_bookingError,
                                  textAlign: TextAlign.center),
                              const SizedBox(height: 12),
                              TextButton.icon(
                                onPressed: _loadBookings,
                                icon: const Icon(Icons.refresh),
                                label: const Text('Coba Lagi'),
                              ),
                            ],
                          ),
                        ),
                      )
                    else if (_bookings.isEmpty)
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Center(
                            child: Column(
                              children: [
                                Icon(Icons.event_busy,
                                    size: 48, color: Colors.grey[400]),
                                const SizedBox(height: 12),
                                Text(
                                  'Belum ada riwayat booking',
                                  style: TextStyle(color: Colors.grey[600]),
                                ),
                              ],
                            ),
                          ),
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _bookings.length,
                        itemBuilder: (context, index) {
                          final booking = _bookings[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 10),
                            clipBehavior: Clip.antiAlias,
                            child: InkWell(
                              onTap: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) =>
                                      BookingDetailScreen(booking: booking),
                                ),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(14),
                                child: Row(
                                  children: [
                                    Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        color: _getStatusColor(booking.status)
                                            .withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Icon(
                                        Icons.spa,
                                        color:
                                            _getStatusColor(booking.status),
                                        size: 22,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            booking.service?.name ??
                                                'Layanan',
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w600,
                                              fontSize: 14,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            _formatDateTime(
                                                booking.bookingTime),
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey[600],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.end,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: _getStatusColor(
                                                    booking.status)
                                                .withOpacity(0.1),
                                            borderRadius:
                                                BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            _getStatusLabel(booking.status),
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: _getStatusColor(
                                                  booking.status),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        const Icon(Icons.chevron_right,
                                            size: 18, color: Colors.grey),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),

                    const SizedBox(height: 24),

                    // ── Logout ──────────────────────────────────────────
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _logout,
                        icon: const Icon(Icons.logout),
                        label: const Text('Keluar'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.red,
                          side: const BorderSide(color: Colors.red),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),

                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
