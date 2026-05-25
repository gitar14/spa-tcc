class Booking {
  const Booking({
    required this.id,
    required this.userId,
    required this.therapistId,
    required this.serviceId,
    required this.roomId,
    required this.bookingTime,
    required this.status,
    this.user,
    this.therapist,
    this.service,
    this.room,
    this.paymentStatus,
    this.paymentProofUrl,
  });

  final int id;
  final int userId;
  final int therapistId;
  final int serviceId;
  final int roomId;
  final DateTime bookingTime;
  final String status;
  final BookingUser? user;
  final BookingTherapist? therapist;
  final BookingService? service;
  final BookingRoom? room;
  final String? paymentStatus;
  final String? paymentProofUrl;

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] as int,
      userId: json['user_id'] as int,
      therapistId: json['therapist_id'] as int,
      serviceId: json['service_id'] as int,
      roomId: json['room_id'] as int,
      bookingTime: DateTime.parse(json['booking_time'] as String),
      status: json['status'] as String,
      user: json['User'] != null ? BookingUser.fromJson(json['User']) : null,
      therapist: json['Therapist'] != null
          ? BookingTherapist.fromJson(json['Therapist'])
          : null,
      service: json['Service'] != null
          ? BookingService.fromJson(json['Service'])
          : null,
      room: json['Room'] != null ? BookingRoom.fromJson(json['Room']) : null,
      paymentStatus: json['payment_status'] as String?,
      paymentProofUrl: json['payment_proof_url'] as String?,
    );
  }
}

class BookingUser {
  const BookingUser({required this.id, required this.name});
  final int id;
  final String name;

  factory BookingUser.fromJson(Map<String, dynamic> json) {
    return BookingUser(
      id: json['id'] as int,
      name: json['name'] as String,
    );
  }
}

class BookingTherapist {
  const BookingTherapist({required this.id, required this.name});
  final int id;
  final String name;

  factory BookingTherapist.fromJson(Map<String, dynamic> json) {
    return BookingTherapist(
      id: json['id'] as int,
      name: json['name'] as String,
    );
  }
}

class BookingService {
  const BookingService({
    required this.id,
    required this.name,
    required this.price,
  });
  final int id;
  final String name;
  final String price;

  factory BookingService.fromJson(Map<String, dynamic> json) {
    return BookingService(
      id: json['id'] as int,
      name: json['name'] as String,
      price: json['price'] as String,
    );
  }
}

class BookingRoom {
  const BookingRoom({required this.id, required this.roomNumber});
  final int id;
  final String roomNumber;

  factory BookingRoom.fromJson(Map<String, dynamic> json) {
    return BookingRoom(
      id: json['id'] as int,
      roomNumber: json['room_number'] as String,
    );
  }
}
