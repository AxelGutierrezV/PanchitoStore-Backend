# Panchito Store - Backend

Backend de la plataforma **Panchito Store**, desarrollado bajo una arquitectura de microservicios orientada a la gestión integral de procesos de comercio electrónico.

La solución está compuesta por múltiples servicios independientes que colaboran entre sí para administrar clientes, empleados, productos, inventario, órdenes, envíos, pagos, notificaciones y auditoría. Cada servicio es responsable de un dominio específico del negocio y mantiene su propia base de datos, siguiendo principios de desacoplamiento y escalabilidad.

---

# Descripción General

Panchito Store implementa una arquitectura basada en microservicios para separar las distintas responsabilidades del sistema y facilitar el mantenimiento, despliegue y evolución independiente de cada componente.

Los servicios se comunican mediante APIs REST y participan en procesos de negocio distribuidos como la creación de órdenes, actualización de inventario, generación de envíos, notificaciones por correo y auditoría de eventos.

La plataforma soporta tanto las operaciones realizadas por los clientes desde la tienda virtual como las operaciones administrativas realizadas desde el panel de gestión.

---

# Arquitectura de Microservicios

La plataforma se encuentra compuesta por los siguientes servicios:

| Servicio | Responsabilidad |
|-----------|----------------|
| Auth Service | Gestión de clientes, empleados, roles y autenticación |
| Product Service | Productos, categorías, promociones y cupones |
| Order Service | Gestión de órdenes de compra |
| Inventory Service | Inventario, almacenes y movimientos de stock |
| Shipping Service | Gestión logística y envíos |
| Payment Service | Simulación de pasarela de pago externa |
| Notification Service | Envío de correos electrónicos |
| Logging Service | Auditoría y trazabilidad |

Cada servicio administra sus propios datos y se comunica con los demás a través de APIs REST.

---

# Tecnologías Utilizadas

El backend fue desarrollado utilizando tecnologías del ecosistema JavaScript junto con una estrategia de persistencia distribuida.

## Principales tecnologías

- Node.js
- Express.js
- PostgreSQL
- MongoDB
- Axios
- JWT
- bcrypt
- Resend
- Docker
- Railway

Node.js y Express son utilizados para la construcción de APIs REST.

PostgreSQL se emplea para la gestión de información transaccional, mientras que MongoDB se utiliza para componentes que requieren una estructura documental flexible como el carrito de compras y la auditoría del sistema.

JWT se utiliza para autenticación basada en tokens y bcrypt para el almacenamiento seguro de contraseñas.

Axios permite la comunicación entre servicios y Resend es utilizado para el envío de correos electrónicos transaccionales.

---

# Servicios Implementados

## Auth Service

Responsable de la autenticación y administración de usuarios del sistema.

### Funcionalidades

- Registro de clientes.
- Autenticación de clientes.
- Gestión de perfiles.
- Cambio de contraseña.
- Gestión de direcciones.
- Registro de empleados.
- Inicio de sesión de empleados.
- Administración de roles.
- Generación y validación de JWT.

### Entidades principales

- clients
- client_addresses
- employees
- roles

---

## Product Service

Responsable de la gestión del catálogo de productos y estrategias comerciales.

### Funcionalidades

- Registro de productos.
- Actualización de productos.
- Activación y desactivación de productos.
- Gestión de categorías.
- Gestión de promociones.
- Gestión de cupones.
- Consulta de catálogo.
- Búsqueda y filtrado de productos.

### Entidades principales

- products
- categories
- promotions
- promotion_products

---

## Order Service

Responsable del ciclo de vida de las órdenes de compra.

### Funcionalidades

- Creación de órdenes.
- Aplicación de cupones.
- Generación de códigos de orden.
- Consulta de órdenes por cliente.
- Historial de estados.
- Consulta de detalles de pedidos.
- Integración con inventario.
- Integración con envíos.
- Integración con notificaciones.

### Entidades principales

- orders
- order_items
- order_status
- order_status_history

---

## Inventory Service

Responsable del control de existencias y movimientos de inventario.

### Funcionalidades

- Gestión de stock por almacén.
- Consulta de disponibilidad.
- Descuento automático de inventario por ventas.
- Registro de movimientos.
- Entradas de stock.
- Salidas de stock.
- Ajustes manuales.
- Control de almacenes.

### Entidades principales

- inventory
- inventory_movements
- warehouses

### Tipos de movimiento

- SALE
- PURCHASE
- RETURN
- ADJUSTMENT
- DAMAGED

---

## Shipping Service

Responsable de la gestión logística de los pedidos.

### Funcionalidades

- Generación de envíos.
- Gestión de estados logísticos.
- Asociación de productos a envíos.
- Consulta de envíos por orden.
- Seguimiento de entregas.

### Entidades principales

- shipments
- shipment_items
- shipment_status

---

## Payment Service

Servicio encargado de simular una pasarela de pagos externa.

### Funcionalidades

- Simulación de autorizaciones de pago.
- Simulación de pagos exitosos.
- Simulación de pagos rechazados.
- Integración con el flujo de checkout.

### Objetivo

Este servicio representa una integración externa similar a una pasarela real de pagos y permite desacoplar la lógica financiera del resto de los procesos de negocio.

---

## Notification Service

Responsable de las comunicaciones enviadas a los clientes.

### Funcionalidades

- Envío de correos electrónicos.
- Confirmación de compras.
- Notificación de cambios de estado.
- Integración con Resend.

### Eventos notificados

- Pedido creado.
- Pedido confirmado.
- Pedido enviado.
- Pedido entregado.
- Pedido cancelado.

---

## Logging Service

Responsable de la auditoría y trazabilidad del sistema.

### Tecnologías

- Node.js
- Express.js
- MongoDB

### Funcionalidades

- Registro de eventos.
- Consulta de logs.
- Auditoría de procesos.
- Seguimiento de actividades entre servicios.

### Eventos registrados

- Creación de órdenes.
- Movimientos de inventario.
- Actualizaciones de estado.
- Eventos logísticos.
- Operaciones administrativas.
- Comunicación entre servicios.

---

# Bases de Datos

La plataforma utiliza una arquitectura de persistencia distribuida donde cada servicio administra su propia base de datos.

## PostgreSQL

PostgreSQL es utilizado para la gestión de información transaccional relacionada con:

- Clientes.
- Empleados.
- Roles.
- Direcciones.
- Productos.
- Categorías.
- Promociones.
- Inventario.
- Almacenes.
- Órdenes.
- Estados de órdenes.
- Envíos.

## MongoDB

MongoDB es utilizado para componentes con estructura documental.

### Carrito de Compras

El carrito se almacena como documentos asociados a cada cliente, permitiendo una gestión flexible de los productos seleccionados antes de generar una orden.

### Auditoría y Logs

El Logging Service almacena registros de eventos generados por toda la plataforma.

Entre los eventos registrados se incluyen:

- Creación de órdenes.
- Actualización de estados.
- Movimientos de inventario.
- Eventos de envío.
- Operaciones administrativas.
- Integraciones entre servicios.

## Estrategia de Persistencia

La arquitectura implementada sigue el patrón:

```text
Un servicio
↓
Una base de datos
```

Cada servicio es dueño de sus datos y la comunicación entre dominios se realiza exclusivamente mediante APIs REST.

---

# Flujo General de Compra

El backend soporta el ciclo completo de una compra dentro de la plataforma.

1. El cliente agrega productos al carrito.
2. Se valida la disponibilidad de inventario.
3. Se calculan promociones y descuentos aplicables.
4. Se procesa el pago mediante el servicio de pagos.
5. Se genera la orden de compra.
6. Se actualiza el inventario.
7. Se crean los envíos correspondientes.
8. Se registran movimientos de stock.
9. Se generan eventos de auditoría.
10. Se envían notificaciones por correo electrónico.

---

# Estructura General de un Servicio

```text
service
│
├── controllers
├── routes
├── middleware
├── config
├── database
├── utils
├── app.js
└── server.js
```

## Descripción

| Carpeta | Descripción |
|----------|-------------|
| controllers | Lógica de negocio |
| routes | Definición de endpoints |
| middleware | Validaciones y autenticación |
| config | Configuración del servicio |
| database | Conexiones a bases de datos |
| utils | Funciones auxiliares |

---

# Seguridad

La plataforma incorpora mecanismos de protección orientados a la seguridad de los datos y procesos.

## Medidas implementadas

- Autenticación mediante JWT.
- Hash de contraseñas utilizando bcrypt.
- Separación de responsabilidades por servicio.
- Validación de datos de entrada.
- Protección de rutas administrativas.
- Registro de eventos críticos mediante auditoría.

---

# Variables de Entorno

Cada servicio utiliza variables de entorno para configurar conexiones internas y externas.

Ejemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=database

JWT_SECRET=secret

AUTH_SERVICE_URL=http://auth-service
PRODUCT_SERVICE_URL=http://product-service
ORDER_SERVICE_URL=http://order-service
INVENTORY_SERVICE_URL=http://inventory-service
SHIPPING_SERVICE_URL=http://shipping-service
PAYMENT_SERVICE_URL=http://payment-service
NOTIFICATION_SERVICE_URL=http://notification-service
LOGGING_SERVICE_URL=http://logging-service
```

---

# Instalación

Instalar dependencias:

```bash
npm install
```

Ejecutar entorno de desarrollo:

```bash
npm run dev
```

Ejecutar entorno de producción:

```bash
npm start
```

---

# Contenerización

Los servicios pueden ejecutarse mediante Docker.

Construir imagen:

```bash
docker build -t service-name .
```

Ejecutar contenedor:

```bash
docker run -p 3000:3000 service-name
```

---

# Despliegue

Los microservicios se encuentran preparados para desplegarse de forma independiente en Railway.

Las bases de datos PostgreSQL y MongoDB son administradas de manera separada, permitiendo escalar cada componente según sus necesidades y mantener un bajo acoplamiento entre servicios.

---

# Autor

### Axel Gabriel Gutierrez Vasquez

Proyecto desarrollado como parte de la plataforma de comercio electrónico Panchito Store para el curso de Arquitectura Orientada al Servicio.
