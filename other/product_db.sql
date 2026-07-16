--
-- PostgreSQL database dump
--

\restrict VKwShq6hJghmbsit18zn8yBuky5eBUfro5wzV5xnftIXwxh5Exij6XyZJ9IowJC

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categorias_id_seq OWNER TO postgres;

--
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    precio numeric(10,2),
    categoria_id integer,
    activo boolean DEFAULT true,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- Name: productos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.productos_id_seq OWNER TO postgres;

--
-- Name: productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;


--
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- Name: productos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN id SET DEFAULT nextval('public.productos_id_seq'::regclass);


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id, nombre, descripcion, activo) FROM stdin;
2	Hogar	Artículos para el hogar	t
3	Ropa	Vestimenta y accesorios	t
4	Electrodomesticos	Equipos para el hogar	t
5	Gaming	Productos para videojuegos	t
6	Deportes	Artículos deportivos	t
7	Oficina	Productos de oficina	t
1	Tecnología Pro	Actualizado	t
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id, nombre, descripcion, precio, categoria_id, activo, fecha_creacion) FROM stdin;
33	Refrigeradora LG 400L	Refrigeradora no frost	2800.00	4	t	2026-06-06 21:28:28.737714
34	Laptop Lenovo IdeaPad 3	Laptop para uso diario	2500.00	1	t	2026-06-06 21:28:28.737714
36	Laptop HP Pavilion 15	Laptop de alto rendimiento	3200.00	1	t	2026-06-06 21:28:28.737714
37	Zapatillas deportivas Nike	Calzado deportivo	250.00	3	t	2026-06-06 21:28:28.737714
38	Juego de ollas Tramontina	Ollas de acero inoxidable	450.00	2	t	2026-06-06 21:28:28.737714
39	Impresora HP	Impresora multifuncional	450.00	7	t	2026-06-06 21:28:28.737714
41	Monitor Samsung 24 pulgadas	Monitor Full HD	800.00	1	t	2026-06-06 21:28:28.737714
42	Aspiradora Philips	Aspiradora potente	400.00	4	t	2026-06-06 21:28:28.737714
43	Teclado mecánico Redragon	Teclado gamer RGB	180.00	5	t	2026-06-06 21:28:28.737714
44	Lámpara de pie	Iluminación moderna	180.00	2	t	2026-06-06 21:28:28.737714
45	Mouse Logitech G203	Mouse gamer	120.00	5	t	2026-06-06 21:28:28.737714
46	PlayStation 5	Consola Sony de última generación	3500.00	5	t	2026-06-06 21:28:28.737714
47	Colchón Queen Size	Colchón ortopédico	1100.00	2	t	2026-06-06 21:28:28.737714
48	Xbox Series S	Consola Microsoft	2000.00	5	t	2026-06-06 21:28:28.737714
49	Mancuernas 10kg	Set de pesas	120.00	6	t	2026-06-06 21:28:28.737714
50	Silla Gamer Cougar	Silla ergonómica gaming	900.00	5	t	2026-06-06 21:28:28.737714
51	Polo algodón hombre	Polo casual	50.00	3	t	2026-06-06 21:28:28.737714
52	Casaca impermeable	Chaqueta resistente al agua	180.00	3	t	2026-06-06 21:28:28.737714
53	Cocina a gas 4 hornillas	Cocina doméstica	700.00	4	t	2026-06-06 21:28:28.737714
54	Jeans slim fit	Pantalón de mezclilla	120.00	3	t	2026-06-06 21:28:28.737714
55	Mesa de comedor 6 sillas	Juego de comedor	1200.00	2	t	2026-06-06 21:28:28.737714
58	Archivador metálico	Para documentos	300.00	7	t	2026-06-06 21:28:28.737714
59	Cortinas blackout	Cortinas oscuras para dormitorio	220.00	2	t	2026-06-06 21:28:28.737714
60	Vestido casual mujer	Vestido de verano	140.00	3	t	2026-06-06 21:28:28.737714
61	Lavadora Samsung 12kg	Lavadora automática	1800.00	4	t	2026-06-06 21:28:28.737714
62	Escritorio madera	Escritorio moderno	650.00	7	t	2026-06-06 21:28:28.737714
63	Microondas Oster	Microondas 20L	350.00	4	t	2026-06-06 21:28:28.737714
64	Balón de fútbol Adidas	Balón profesional	90.00	6	t	2026-06-06 21:28:28.737714
65	Silla ergonómica	Silla para oficina	400.00	7	t	2026-06-06 21:28:28.737714
66	Colchoneta yoga	Mat fitness	60.00	6	t	2026-06-06 21:28:28.737714
35	Guantes de boxeo 12 oz	Guantes entrenamiento	150.00	6	t	2026-06-06 21:28:28.737714
40	Libreta A4 Artesco	Cuaderno universitario	15.00	7	t	2026-06-06 21:28:28.737714
56	Bicicleta montañera aro 29	Bicicleta todo terreno	900.00	6	t	2026-06-06 21:28:28.737714
57	Sofá 3 cuerpos cuero	Sofá cómodo de 3 cuerpos	1500.00	2	t	2026-06-06 21:28:28.737714
67	Refrigeradora LG 300L	Refrigeradora inverter	2500.00	4	t	2026-06-06 21:38:58.170097
68	Laptop Lenovo IdeaPad 2	Laptop para uso de oficina	2000.00	1	t	2026-06-06 21:38:58.170097
69	Guantes de boxeo 16oz	Guantes entrenamiento	170.00	6	t	2026-06-06 21:38:58.170097
70	Laptop HP Pavilion 12	Laptop de medio rendimiento	2800.00	1	t	2026-06-06 21:38:58.170097
71	Zapatillas deportivas Adidas	Calzado urbano	237.00	3	t	2026-06-06 21:38:58.170097
72	Juego de ollas Oster	Ollas de teflón	350.00	2	t	2026-06-06 21:38:58.170097
73	Impresora Epson	Impresora multifuncional	500.00	7	t	2026-06-06 21:38:58.170097
74	Libreta A4 Standford	Cuaderno anillado	18.00	7	t	2026-06-06 21:38:58.170097
75	Monitor Asus 21 pulgadas	Monitor Full HD	350.00	1	t	2026-06-06 21:38:58.170097
76	Aspiradora Electrolux	Aspiradora de mano	180.00	4	t	2026-06-06 21:38:58.170097
77	Teclado mecánico Logitech	Teclado gamer RGB a pilas	150.00	5	t	2026-06-06 21:38:58.170097
78	Lámpara de mesa	Iluminación para dormitorio	100.00	2	t	2026-06-06 21:38:58.170097
79	Mouse Logitech G302	Mouse de oficina	50.00	5	t	2026-06-06 21:38:58.170097
80	PlayStation 5 pro	Consola Sony de última generación	4000.00	5	t	2026-06-06 21:38:58.170097
81	Colchón King Size	Colchón ortopédico	1600.00	2	t	2026-06-06 21:38:58.170097
82	Xbox Series X	Consola Microsoft	2500.00	5	t	2026-06-06 21:38:58.170097
83	Mancuernas 20kg	Set de pesas y barra	240.00	6	t	2026-06-06 21:38:58.170097
84	Silla Gamer Kuzler	Silla ergonómica gaming	800.00	5	t	2026-06-06 21:38:58.170097
85	Polo camisero hombre	Polo casual de hombre	55.00	3	t	2026-06-06 21:38:58.170097
86	Casaca Jean	Chaqueta de calle para hombre	150.00	3	t	2026-06-06 21:38:58.170097
87	Cocina a gas 6 hornillas	Cocina doméstica	1000.00	4	t	2026-06-06 21:38:58.170097
88	Jeans baggy fit	Pantalón de jean para  hombre	120.00	3	t	2026-06-06 21:38:58.170097
89	Mesa de comedor 4 sillas	Juego de comedor	750.00	2	t	2026-06-06 21:38:58.170097
90	Bicicleta montañera aro 27	Bicicleta todo terreno	850.00	6	t	2026-06-06 21:38:58.170097
91	Sofá 3 cuerpos cuerina	Sofá cómodo	1100.00	2	t	2026-06-06 21:38:58.170097
92	Archivador plastico	archivador para oficina	100.00	7	t	2026-06-06 21:38:58.170097
93	Cortinas blackout	Cortinas oscuras para dormitorio	220.00	2	t	2026-06-06 21:38:58.170097
94	Vestido de noche mujer	Vestido de gala	200.00	3	t	2026-06-06 21:38:58.170097
95	Lavaseca Samsung 15kg	Lavaseca automática	2500.00	4	t	2026-06-06 21:38:58.170097
96	Escritorio de metal	Escritorio moderno	700.00	7	t	2026-06-06 21:38:58.170097
97	Microondas Electrolux	Microondas 25L	420.00	4	t	2026-06-06 21:38:58.170097
98	Balón de Voley Adidas	Balón profesional	70.00	6	t	2026-06-06 21:38:58.170097
99	Silla ergonómica	Silla para oficina	300.00	7	t	2026-06-06 21:38:58.170097
100	Laptop ASUS gamer	Laptop para gaming	3000.00	1	t	2026-06-06 21:40:31.674095
\.


--
-- Name: categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_id_seq', 7, true);


--
-- Name: productos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_id_seq', 100, true);


--
-- Name: categorias categorias_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_nombre_key UNIQUE (nombre);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- Name: idx_productos_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_activo ON public.productos USING btree (activo);


--
-- Name: idx_productos_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_productos_categoria ON public.productos USING btree (categoria_id);


--
-- Name: productos productos_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict VKwShq6hJghmbsit18zn8yBuky5eBUfro5wzV5xnftIXwxh5Exij6XyZJ9IowJC

