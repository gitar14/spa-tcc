class SpaService {
  const SpaService({
    required this.id,
    required this.name,
    required this.durationMinutes,
    required this.price,
  });

  final int id;
  final String name;
  final int durationMinutes;
  final double price;

  factory SpaService.fromJson(Map<String, dynamic> json) {
    return SpaService(
      id: int.parse('${json['id']}'),
      name: '${json['name']}',
      durationMinutes: int.parse('${json['duration_minutes'] ?? 0}'),
      price: double.parse('${json['price'] ?? 0}'),
    );
  }
}
