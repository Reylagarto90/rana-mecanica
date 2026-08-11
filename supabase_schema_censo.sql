-- ══════════════════════════════════════════════════════
-- CENSO TEMPORADA 2026/2027 · La Rana Mecánica
-- Generado automáticamente desde censo_temporada_26-27.xlsx
-- ══════════════════════════════════════════════════════

-- Limpiar tabla antes de importar (solo en primer despliegue)
-- TRUNCATE socios CASCADE;

INSERT INTO socios (numero, nombre, apellidos, dni, fecha_nac, telefono, email, estado, tipo, cargo, rgpd, foto_aut) VALUES
  ('LRM-0001', 'Salvador', 'Alegre Alcobenda', '20156715K', NULL, '663960328', NULL, 'baja', 'adulto', 'Peñista', false, false),
  ('LRM-0002', 'Daniel', 'Alegre Esteve', '53882631W', NULL, '671309693', 'danielalegreesteve@gmail.com', 'baja', 'adulto', 'Peñista', false, false),
  ('LRM-0003', 'Rafael', 'Bernabéu Llorens', '52653620L', NULL, '653211861', 'rafabernabeu0@gmail.com', 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0004', 'Guillem', 'Carrion Oliva', '21014212D', NULL, '649652544', 'cem201102@gmail.com', 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0005', 'Antonio', 'Cortes Hidalgo', '52656248W', NULL, '611660287', 'tocohirocafort@hotmail.com', 'baja', 'adulto', 'Peñista', false, false),
  ('LRM-0006', 'Miguel', 'Cortes Llorens', '10250899Y', NULL, '611464406', NULL, 'baja', 'adulto', 'Peñista', false, false),
  ('LRM-0007', 'José Ramón', 'Esteban Mena', '23937659H', NULL, '617331167', NULL, 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0008', 'Jose Antonio', 'Garcia Alcantud', '53051968F', NULL, '619818917', 'jagalcantud78@gmaiol.com', 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0009', 'Marta', 'García Alcantud', '53257526Z', NULL, '619818917', NULL, 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0010', 'Ivan', 'Garcia Bayona', '49357092N', NULL, NULL, 'ivangb2005@gmail.com', 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0011', 'Carla', 'Gimeno  Pérez', '17518364T', NULL, NULL, NULL, 'baja', 'adulto', 'Peñista', false, false),
  ('LRM-0012', 'Vicente', 'Gimeno Carot', '52656148V', NULL, NULL, 'vicentegimenocarot@gmail.com', 'baja', 'adulto', 'Peñista', false, false),
  ('LRM-0013', 'Olivia', 'Gimeno Martí', '44521943S', NULL, '669815161', 'olivia.gimeno@gmail.com', 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0014', 'Eva', 'Gimeno Pérez', '17518365R', NULL, NULL, NULL, 'baja', 'adulto', 'Peñista', false, false),
  ('LRM-0015', 'Patricia', 'Herrero Gil', '26757146G', NULL, '692645562', 'hegilpa92@gmail.com', 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0016', 'Victor', 'Jimenez Bueso', '22581478D', NULL, NULL, NULL, 'baja', 'adulto', 'Peñista', false, false),
  ('LRM-0017', 'Amelia', 'Jiménez Pla', '17605831K', NULL, NULL, NULL, 'baja', 'adulto', 'Peñista', false, false),
  ('LRM-0018', 'Balma Victoria', 'Jiménez Pla', '17605832E', NULL, NULL, NULL, 'baja', 'adulto', 'Peñista', false, false),
  ('LRM-0019', 'Manuel', 'Martínez Navarro', '48435716Q', NULL, NULL, NULL, 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0020', 'Óscar', 'Martínez Romero', NULL, NULL, NULL, NULL, 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0021', 'Jose', 'Mocholi Ferrer', '44888320W', NULL, NULL, 'aupa_levante@hotmail.com', 'activo', 'adulto', 'Tesorero', false, false),
  ('LRM-0022', 'Marta', 'Oliveros Romero', '48676900E', NULL, '635298719', 'martaoli21@gmail.com', 'activo', 'adulto', 'Vocal', false, false),
  ('LRM-0023', 'Antonella', 'Palacios Arroyave', NULL, NULL, '661701672', 'arturopalaciosbuitrago@gmail.com', 'activo', 'infantil', 'Peñista', false, false),
  ('LRM-0024', 'Arturo', 'Palacios Buitrago', '70582608R', NULL, '661701672', 'arturopalaciosbuitrago@gmail.com', 'activo', 'adulto', 'Vicepresidente', false, false),
  ('LRM-0025', 'Jose Ignacio', 'Pellicer Doñate', '48676454J', NULL, '722472204', 'j.ignaciopellicer@gmail.com', 'activo', 'adulto', 'Presidente', false, false),
  ('LRM-0026', 'Adelina', 'Romero Queralt', '48310572S', NULL, NULL, NULL, 'baja', 'adulto', 'Peñista', false, false),
  ('LRM-0027', 'Daniel', 'Sempere Manuel', '73573354B', NULL, '645774034', 'sempere.dani@icloud.com', 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0028', 'Emma', 'Torres Gimeno', NULL, NULL, NULL, 'olivia.gimeno@gmail.com', 'baja', 'adulto', 'Peñista', false, false),
  ('LRM-0029', 'Mateo', 'Torres Gimeno', NULL, NULL, NULL, 'olivia.gimeno@gmail.com', 'baja', 'adulto', 'Peñista', false, false),
  ('LRM-0030', 'Sergio', 'Torres González', '48441190Q', NULL, NULL, 'olivia.gimeno@gmail.com', 'baja', 'adulto', 'Peñista', false, false),
  ('LRM-0031', 'Carlos', 'Yago Granell', '49571469Y', NULL, '637808538', 'carlosyagogranell@gmail.com', 'activo', 'adulto', 'Secretario', false, false),
  ('LRM-0032', 'Andrea', 'Mocholi Herrero', NULL, NULL, NULL, NULL, 'activo', 'infantil', 'Peñista', false, false),
  ('LRM-0033', 'Olga', 'Arroyave Jordan', 'Z1607188E', NULL, '661701672', NULL, 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0034', 'Antonio', 'Almenar Antón', '53751095A', NULL, '607697923', 'aalmenar057@gmail.com', 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0035', 'Francisco', 'Alfonso Belenguer', '85026686X', NULL, '667946421', 'es.j.alfbelen@gmail.com', 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0036', 'Neus', 'Pellicer Oliveros', NULL, NULL, NULL, NULL, 'activo', 'infantil', 'Peñista', false, false),
  ('LRM-0037', 'Diego', 'Mocholi Herrero', NULL, NULL, NULL, NULL, 'activo', 'infantil', 'Peñista', false, false),
  ('LRM-0038', 'Mari Carmen', 'López Casares', '19875345X', NULL, '616519900', NULL, 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0039', 'Adrián', 'Pérez segui', '21687528T', NULL, '665171998', 'perezadriansegui1986@gmail.com', 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0040', 'Alma', 'Palacios Arroyave', NULL, NULL, '661701672', NULL, 'activo', 'infantil', 'Peñista', false, false),
  ('LRM-0041', 'Eduard', 'Galindo', '19865992H', NULL, '628069013', 'galindonaya@hotmail.com', 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0042', 'Eduardo', 'Hervás Lafuente', '18417667A', NULL, '635664315', NULL, 'activo', 'adulto', 'Peñista', false, false),
  ('LRM-0043', 'Luisa', 'González Moya', '24322779A', NULL, '671090657', 'luisagonmo@gmail.com', 'activo', 'adulto', 'Peñista', false, false);

-- Actualizar secuencia de IDs
SELECT setval('socios_id_seq', (SELECT MAX(id) FROM socios));

-- Total importado: 29 activos, 14 bajas