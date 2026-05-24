CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Customer' CHECK (role IN ('Receptionist', 'Customer'))
);

CREATE TABLE IF NOT EXISTS auth_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Customer' CHECK (role IN ('Receptionist', 'Customer')),
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS therapists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL,
    type VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    therapist_id INTEGER REFERENCES therapists(id),
    service_id INTEGER REFERENCES services(id),
    room_id INTEGER REFERENCES rooms(id),
    booking_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In_Progress', 'Done'))
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Unpaid' CHECK (status IN ('Unpaid', 'Paid'))
);

CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    score INTEGER CHECK (score BETWEEN 1 AND 5),
    review TEXT
);

INSERT INTO users (name, email, role) VALUES
('Alya Customer', 'alya@example.com', 'Customer'),
('Rani Receptionist', 'rani@spa.local', 'Receptionist')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role;

INSERT INTO therapists (name, specialization) VALUES
('Mira', 'Aromatherapy Massage'),
('Nadia', 'Facial Treatment'),
('Salsa', 'Hair Spa');

INSERT INTO services (name, duration_minutes, price) VALUES
('Signature Glow Facial', 60, 225000),
('Aromatherapy Body Massage', 90, 350000),
('Hair Spa Repair Ritual', 75, 275000);

INSERT INTO rooms (room_number, type) VALUES
('A-01', 'Spa'),
('B-02', 'Salon'),
('C-03', 'Facial');