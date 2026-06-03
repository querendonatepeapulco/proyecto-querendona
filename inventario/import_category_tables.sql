-- Plantilla para importar tus tablas por categoria hacia la tabla que usa el sistema.
-- Ajusta los nombres de columnas si tus tablas usan otros nombres.
--
-- Estructura esperada por cada tabla de categoria:
-- nombre, cantidad, descripcion, precio
-- Para usar otra unidad, cambia 'Unidad' por 'Onza', 'Litro' o por una columna real como unidad.
--
-- La alerta se calcula con min_stock. Aqui se pone 5 como minimo por defecto;
-- puedes cambiarlo por el valor que quieras.

INSERT INTO products (name, sku, description, category, unit, stock, min_stock, price)
SELECT nombre, 'ABAR-' || row_number() OVER (), COALESCE(descripcion, ''), 'Abarrotes', 'Unidad', cantidad, 5, precio
FROM abarrotes
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, sku, description, category, unit, stock, min_stock, price)
SELECT nombre, 'BEB-' || row_number() OVER (), COALESCE(descripcion, ''), 'Bebidas', 'Unidad', cantidad, 5, precio
FROM bebidas
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, sku, description, category, unit, stock, min_stock, price)
SELECT nombre, 'BOL-' || row_number() OVER (), COALESCE(descripcion, ''), 'Bolsas', 'Unidad', cantidad, 5, precio
FROM bolsas
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, sku, description, category, unit, stock, min_stock, price)
SELECT nombre, 'CAR-' || row_number() OVER (), COALESCE(descripcion, ''), 'Carne', 'Unidad', cantidad, 5, precio
FROM carne
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, sku, description, category, unit, stock, min_stock, price)
SELECT nombre, 'FRU-' || row_number() OVER (), COALESCE(descripcion, ''), 'Fruta y verdura', 'Unidad', cantidad, 5, precio
FROM fruta_y_verdura
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, sku, description, category, unit, stock, min_stock, price)
SELECT nombre, 'MOL-' || row_number() OVER (), COALESCE(descripcion, ''), 'Molino', 'Unidad', cantidad, 5, precio
FROM molino
ON CONFLICT (sku) DO NOTHING;
