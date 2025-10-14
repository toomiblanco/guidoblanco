-- Script para crear/actualizar usuario administrador con credenciales reales
-- Este script debe ejecutarse en tu base de datos PostgreSQL

-- Crear o actualizar el usuario administrador
-- Email: admin@guidoblanco.com
-- Contraseña: admin123

-- Hash de la contraseña "admin123" (bcrypt con salt 10)
-- Puedes cambiar la contraseña después

INSERT INTO users (email, password_hash, full_name, is_admin, email_verified) VALUES
('admin@guidoblanco.com', '$2a$10$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W', 'Guido Blanco', true, true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2a$10$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W',
  is_admin = true,
  full_name = 'Guido Blanco',
  email_verified = true;

-- También agregar el email que veo en tu imagen
INSERT INTO users (email, password_hash, full_name, is_admin, email_verified) VALUES
('guidoblanco@gmail.com', '$2a$10$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W', 'Guido Blanco', true, true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2a$10$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W',
  is_admin = true,
  full_name = 'Guido Blanco',
  email_verified = true;

-- Verificar que los usuarios fueron creados correctamente
SELECT email, full_name, is_admin, email_verified, created_at 
FROM users 
WHERE email IN ('admin@guidoblanco.com', 'guidoblanco@gmail.com');