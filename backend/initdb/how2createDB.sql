CREATE DATABASE food_delivery_platform ENCODING = 'UTF8';
ALTER DATABASE food_delivery_platform OWNER TO postgres;
\connect food_delivery_platform;

CREATE TABLE public.users (
                        user_id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        user_name       TEXT NOT NULL,
                        first_name      TEXT NOT NULL,
                        last_name       TEXT NOT NULL,
                        email           TEXT UNIQUE NOT NULL,
                        phone           TEXT NOT NULL,
                        password_hash   TEXT NOT NULL
);
--INSERT INTO public.users (user_name, first_name, last_name, email, phone, password_hash) VALUES ('mustermaxi_hd', 'Maximilian', 'Mustermann', 'maxim@gmail.com', '+123', 'password')