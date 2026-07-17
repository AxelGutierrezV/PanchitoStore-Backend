--
-- PostgreSQL database dump
--

\restrict TUEZFMkji1KOrO3rsODRGbaMoBMrLJUccxFSqNV02EJitt0d1kkNfRcObUlXRo8

-- Dumped from database version 15.18 (Debian 15.18-1.pgdg13+1)
-- Dumped by pg_dump version 15.18 (Debian 15.18-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    telefono character varying(20),
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    password text NOT NULL
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.clientes_id_seq OWNER TO postgres;

--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- Name: direcciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.direcciones (
    id integer NOT NULL,
    cliente_id integer NOT NULL,
    direccion text NOT NULL,
    ciudad character varying(100),
    referencia text,
    principal boolean DEFAULT false,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.direcciones OWNER TO postgres;

--
-- Name: direcciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.direcciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.direcciones_id_seq OWNER TO postgres;

--
-- Name: direcciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.direcciones_id_seq OWNED BY public.direcciones.id;


--
-- Name: empleado_rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empleado_rol (
    empleado_id integer NOT NULL,
    rol_id integer NOT NULL
);


ALTER TABLE public.empleado_rol OWNER TO postgres;

--
-- Name: empleados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empleados (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.empleados OWNER TO postgres;

--
-- Name: permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permisos (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public.permisos OWNER TO postgres;

--
-- Name: permisos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permisos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permisos_id_seq OWNER TO postgres;

--
-- Name: permisos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permisos_id_seq OWNED BY public.permisos.id;


--
-- Name: rol_permiso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol_permiso (
    rol_id integer NOT NULL,
    permiso_id integer NOT NULL
);


ALTER TABLE public.rol_permiso OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.empleados.id;


--
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- Name: direcciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direcciones ALTER COLUMN id SET DEFAULT nextval('public.direcciones_id_seq'::regclass);


--
-- Name: empleados id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: permisos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos ALTER COLUMN id SET DEFAULT nextval('public.permisos_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (id, nombre, email, telefono, activo, fecha_creacion, password) FROM stdin;
5	Juan Carlos	juanc@test.com	999888777	t	2026-05-25 20:44:51.045571	$2b$10$3K6o0.hHa5D4bUq0NDOb5.e2.COBECI71yh3tPo6jTeyFYeBJUOoq
6	usertest	usertest@test.com	999444555	t	2026-06-27 17:10:06.481338	$2b$10$QZDUlDCgbM92.rwbQTDEreCF/apqP2lkEKlbF.JV5o/s8HYXLxV4e
7	test	test@test.com	9900887766	t	2026-06-27 20:29:17.229513	$2b$10$UZ1P27te1.r6QlnAhW6Uc.9E6evzwROgpj5IQKqYpFB0fwW1cxIW6
8	prueba	prueba@test.com	987654321	t	2026-06-27 20:32:28.78382	$2b$10$s1oFwqRMtI53twhIWCg92eCXgZdQXWV1xdzOmYDumZuHdWAFFPZ1K
9	user	user@test.com	9999999	t	2026-07-02 02:19:10.640408	$2b$10$mrrH6azbR67pBqONvsu3u.x/GztuL1JDx7QeV5rS94Uypi175IOBa
10	utp	utp@test.com	9999999	t	2026-07-02 03:07:26.497783	$2b$10$oUrLNfx3ROAxqt/wEoxCTe8lg5aVvhIJD/c0ia3yRJinZCHxhpEde
11	alex	alex@test.com	9990001123	t	2026-07-12 06:16:38.144224	$2b$10$cpnOHthnU0E1CRA1XqYvZ.7RJ615ANxLvlnwTjBsLhKiNC3swBxx6
12	testing	u21222595@utp.edu.pe	999999	t	2026-07-12 08:31:17.766851	$2b$10$ClQ0axIajfE/I2mCOYwqh.tkZNn2/CC.ncHqHtSAlWg5QFO.f2HhW
13	Juan Carlos	juancarlos@test.com	999888777	t	2026-07-13 02:17:54.761351	$2b$10$NZq20JOu/vYeT4xVYGmZQeTetGdamDsTGHxldZSECA2wmtmgnrujG
14	tester	testers@test.com	81811881	t	2026-07-13 02:20:20.233445	$2b$10$q5Z3rEyB7IA8ughRdst7I.bpgLJrZ7wryV0aNODBUiKeNjxDokNU.
15	test	test@test	1	t	2026-07-13 02:25:31.045415	$2b$10$1PYQ3/QLd2GAhqB6MpOGgeLi/rQrujBP5gj1pYUoadt.qNmss9BXq
\.


--
-- Data for Name: direcciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.direcciones (id, cliente_id, direccion, ciudad, referencia, principal, fecha_creacion) FROM stdin;
5	5	Jr Amazonas 222	Cusco	Casa verde	t	2026-05-24 23:37:24.185474
6	5	Av El Sol 999	Cusco	Cerca a plaza	f	2026-05-24 23:37:24.185474
7	11	Av Principal 111	Cusco	Segundo piso	f	2026-05-24 23:37:24.185474
8	11	Jr. test	Lima	cerca a test	f	2026-07-12 06:49:13.728327
9	11	Av. Test	Lima	cerca al otro test	t	2026-07-12 06:49:32.569176
10	12	Jr. testing tester	Lima	lejos	f	2026-07-12 08:31:54.769393
11	12	Jr. testing	Arequipa	aaaaa	t	2026-07-13 06:04:36.423224
\.


--
-- Data for Name: empleado_rol; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empleado_rol (empleado_id, rol_id) FROM stdin;
2	2
1	2
3	3
13	2
14	6
10	5
12	6
15	4
\.


--
-- Data for Name: empleados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empleados (id, nombre, email, password, activo, fecha_creacion) FROM stdin;
11	test	test@test.com	$2b$10$E0XmKtEcBKqt4XFUaZNsbO.KW7alRaqO1L1NJQjtG7qvqetIttKeO	t	2026-06-27 04:36:45.673496
13	admin	admin@test.com	$2b$10$LLxnPM9YsUyipRYZwL4zu.qgLkZynpWmk4Ew3QgQ9IulbRkc9Wv4q	t	2026-07-01 07:28:32.246243
2	Axel new	axelnew@test.com	$2b$10$Agcn3DIw7CfgKU6HUEmC7uLHvsWhuXc1dvAMNzntxhG1rf5yR3nJS	f	2026-05-24 16:56:32.309108
10	alex	alex@test.com	$2b$10$RzAmMQjYdrNaElzBUHRGAOtzu7.9xj7wdxbeSXoQQyaBTmJRHVwXu	t	2026-06-27 02:18:09.717483
14	comercial	comercial@test.com	$2b$10$SFiLRVCcZR.ktfD383CK5O7LfDUjDMEsvghv.Zo75JUk4.pcMS5zG	t	2026-07-01 07:29:43.02838
15	finanzas	finanzas@test.com	$2b$10$slorXB63V32Yb7sLp1iOEeCQaRAGdi/97w5.aGBdWI7ZGObhccQUS	t	2026-07-01 07:33:28.208432
1	Axel	axel@test.com	$2b$10$TbQgV5LbNbMaYMjcl58dzu5hLjc6txQMjch1Fvr9GCDrOmPEuTChG	t	2026-05-24 15:54:10.227363
3	carlos	carlos@test.com	$2b$10$XOdsCwH4WghgXB4ZUkPLC.fjJdMx/84f6keSCVpsbGnDLWoCuVB4G	t	2026-05-25 01:06:59.880403
12	TI	sotorpe@test.com	$2b$10$HpuvZ9bFh7dsmYDyefEgO.DBTlajy56idIyVDSPA79XvKFDFKwsFq	t	2026-06-28 02:49:38.075378
\.


--
-- Data for Name: permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permisos (id, nombre) FROM stdin;
1	CREAR_PEDIDO
2	VER_PEDIDO
3	GESTIONAR_PRODUCTO
4	GESTIONAR_USUARIO
5	GESTIONAR_ENVIO
6	CONFIGURAR_PROMOCIONES
\.


--
-- Data for Name: rol_permiso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rol_permiso (rol_id, permiso_id) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, nombre) FROM stdin;
2	ADMIN
3	LOGISTICA
4	FINANZAS
5	COMERCIAL
6	TI
\.


--
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_id_seq', 15, true);


--
-- Name: direcciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.direcciones_id_seq', 11, true);


--
-- Name: permisos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permisos_id_seq', 6, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 15, true);


--
-- Name: clientes clientes_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_email_key UNIQUE (email);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: direcciones direcciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direcciones
    ADD CONSTRAINT direcciones_pkey PRIMARY KEY (id);


--
-- Name: permisos permisos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_nombre_key UNIQUE (nombre);


--
-- Name: permisos permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_pkey PRIMARY KEY (id);


--
-- Name: rol_permiso rol_permiso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permiso
    ADD CONSTRAINT rol_permiso_pkey PRIMARY KEY (rol_id, permiso_id);


--
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: empleado_rol usuario_rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleado_rol
    ADD CONSTRAINT usuario_rol_pkey PRIMARY KEY (empleado_id, rol_id);


--
-- Name: empleados usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: empleados usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: direcciones direcciones_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direcciones
    ADD CONSTRAINT direcciones_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;


--
-- Name: rol_permiso rol_permiso_permiso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permiso
    ADD CONSTRAINT rol_permiso_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES public.permisos(id) ON DELETE CASCADE;


--
-- Name: rol_permiso rol_permiso_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permiso
    ADD CONSTRAINT rol_permiso_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: empleado_rol usuario_rol_empleado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleado_rol
    ADD CONSTRAINT usuario_rol_empleado_id_fkey FOREIGN KEY (empleado_id) REFERENCES public.empleados(id) ON DELETE CASCADE;


--
-- Name: empleado_rol usuario_rol_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleado_rol
    ADD CONSTRAINT usuario_rol_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO postgres;


--
-- PostgreSQL database dump complete
--

\unrestrict TUEZFMkji1KOrO3rsODRGbaMoBMrLJUccxFSqNV02EJitt0d1kkNfRcObUlXRo8

