class Therapist {
  const Therapist({
    required this.id,
    required this.name,
    required this.specialization,
  });

  final int id;
  final String name;
  final String specialization;

  factory Therapist.fromJson(Map<String, dynamic> json) {
    return Therapist(
      id: int.parse('${json['id']}'),
      name: '${json['name']}',
      specialization: '${json['specialization']}',
    );
  }
}
