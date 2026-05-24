class HealthStatus {
  const HealthStatus({required this.service, required this.status});

  final String service;
  final String status;

  factory HealthStatus.fromJson(Map<String, dynamic> json) {
    return HealthStatus(
      service: String.fromCharCodes('${json['service'] ?? '-'}'.runes),
      status: String.fromCharCodes('${json['status'] ?? '-'}'.runes),
    );
  }
}
