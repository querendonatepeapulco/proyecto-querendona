# inventario_querendona con PostgreSQL

Sistema de inventario con login, roles, API en Node/Express y base de datos PostgreSQL.

## Requisitos

- Node.js
- PostgreSQL

## Configuracion

1. Crea la base de datos:

```sql
CREATE DATABASE inventario_querendona;
```

2. Copia `.env.example` como `.env` y ajusta tu conexion:

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/inventario_querendona
```

3. Instala dependencias:

```bash
npm install
```

4. Inicia el servidor:

```bash
npm start
```

5. Abre:

```text
http://localhost:3000/login.html
```

## Usuarios demo

- `admin / admin123`: acceso completo.
- `capturista / alta123`: solo puede agregar productos.

## Base de datos

El servidor crea automaticamente las tablas si no existen y carga datos demo cuando la tabla de productos esta vacia. El archivo `schema.sql` tambien contiene el esquema por si prefieres ejecutarlo manualmente.

La tabla que lee el sistema es `products`. Para separar productos usa la columna `category`, por ejemplo `Abarrotes`, `Bebidas`, `Bolsas`, `Carne`, `Fruta y verdura` o `Molino`.

Campos principales:

```text
name          nombre del producto
stock         cantidad actual
min_stock     cantidad minima para activar alerta
description   descripcion corta
category      categoria
unit          unidad de medida, por ejemplo Unidad, Pieza, Litro u Onza
price         precio
```

Si ya tienes tablas separadas por categoria, revisa `import_category_tables.sql` como plantilla para pasar esos datos a `products`.

Los avisos que envian los capturistas cuando falta un producto se guardan en `stock_alerts`. El admin puede verlos y marcarlos como atendidos desde el panel.
