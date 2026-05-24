class Room {
  const Room({
    required this.id,
    required this.roomNumber,
    required this.type,
  });

  final int id;
  final String roomNumber;
  final String type;

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: int.parse('${json['id']}'),
      roomNumber: '${json['room_number']}',
      type: '${json['type']}',
    );
  }
}
