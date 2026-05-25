class ApiConfig {
  // Cloud Run Production URL
  static const String production = 'https://spa-backend-344007205547.us-central1.run.app/api';
  
  // Local development URLs (untuk testing)
  static const String localAndroidEmulator = 'http://10.0.2.2:8080/api';
  static const String localWebOrDesktop = 'http://localhost:8080/api';

  // Use production by default
  static String get baseUrl => production;
}
