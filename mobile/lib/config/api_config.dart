class ApiConfig {
  static const String localAndroidEmulator = 'http://10.0.2.2:8080/api';
  static const String localWebOrDesktop = 'http://localhost:8080/api';
  static const String production = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: localAndroidEmulator,
  );

  static String get baseUrl => production;
}
