import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';

class AuthStorage {
  static const _keyUserId = 'user_id';
  static const _keyUserName = 'user_name';
  static const _keyUserEmail = 'user_email';
  static const _keyUserRole = 'user_role';

  /// Simpan data user ke local storage setelah login berhasil.
  static Future<void> saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_keyUserId, user.id);
    await prefs.setString(_keyUserName, user.name);
    await prefs.setString(_keyUserEmail, user.email);
    await prefs.setString(_keyUserRole, user.role);
  }

  /// Baca data user dari local storage.
  /// Mengembalikan null jika belum pernah login atau sudah logout.
  static Future<User?> loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final id = prefs.getInt(_keyUserId);
    final name = prefs.getString(_keyUserName);
    final email = prefs.getString(_keyUserEmail);
    final role = prefs.getString(_keyUserRole);

    if (id == null || name == null || email == null || role == null) {
      return null;
    }

    return User(id: id, name: name, email: email, role: role);
  }

  /// Hapus data user dari local storage saat logout.
  static Future<void> clearUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyUserId);
    await prefs.remove(_keyUserName);
    await prefs.remove(_keyUserEmail);
    await prefs.remove(_keyUserRole);
  }
}
