CREATE DATABASE food_delivery_platform ENCODING = 'UTF8';
ALTER DATABASE food_delivery_platform OWNER TO postgres;
\connect food_delivery_platform;

CREATE TABLE public.users
(
    user_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_name     TEXT        NOT NULL,
    first_name    TEXT        NOT NULL,
    last_name     TEXT        NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    phone         TEXT        NOT NULL,
    password_hash TEXT        NOT NULL
);
--INSERT INTO public.users (user_name, first_name, last_name, email, phone, password_hash)
-- VALUES ('mustermaxi_hd', 'Maximilian', 'Mustermann', 'maxim@gmail.com', '+123', 'password')

CREATE TABLE public.coupon_code
(
    coupon_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    coupon_code TEXT NOT NULL UNIQUE,
    start_date  TIMESTAMPTZ,
    end_date    TIMESTAMPTZ
);

-- I have chosen to use an enum here for simplicity, I am aware that this can be restricting,
-- but given the app will not experience significant growth beyond these features I believe it to be the better choice.
-- (embedding further semantical meaning, e.g. 'preparing' coming before 'ready' into the db would also be overkill)
-- if s.b. disagrees with this, feel free to change tho ;)
CREATE TYPE public.order_type_enum AS ENUM ('pickup', 'delivery');
CREATE TYPE public.order_status_enum AS ENUM ('preparing', 'ready', 'dispatched', 'fulfilled', 'cancelled');
CREATE TYPE public.payment_method_enum as ENUM ('cash', 'card', 'crypto', 'csgo-skins');

CREATE TABLE public.order
(
    order_id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_name          TEXT                NOT NULL,
    order_type          order_type_enum     NOT NULL,
    order_status        order_status_enum   NOT NULL,
    -- the address is stored as an immutable record inside the order as a users address could possibly change
    -- (and we wouldn't want year old orders to change then)
    address_street      TEXT,
    address_house_nr    TEXT,
    address_postal_code TEXT,
    address_city        TEXT,
    address_door        TEXT,
    paid_amount         NUMERIC(9, 2)       NOT NULL, -- two decimal places, max total is 9 digits (i.e. 100k-1cent)
    payment_method      payment_method_enum NOT NULL,
    coupon_id           INT REFERENCES coupon_code (coupon_id) ON DELETE RESTRICT,
    user_id             INT                 NOT NULL REFERENCES users (user_id) ON DELETE RESTRICT,
    -- ^^ can't order truly anonymously, we'd likely have the user as a guest at least
    created_at          TIMESTAMPTZ DEFAULT now()

        CONSTRAINT order_address_check CHECK (
            (
                order_type = 'delivery'
                    AND address_street IS NOT NULL
                    AND address_house_nr IS NOT NULL
                    AND address_postal_code IS NOT NULL
                    AND address_city IS NOT NULL
                )
            )
);

-- snake case is the convention btw

CREATE TABLE public.menu_item
(
    item_id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    --TODO --restaurant_id  INT REFERENCES restaurant(restaurant_id) ON DELETE RESTRICT,
    item_name        TEXT           NOT NULL,
    item_price       NUMERIC(10, 2) NOT NULL,
    item_description TEXT,
    item_picture     BYTEA,
    is_deleted       BOOLEAN        NOT NULL DEFAULT FALSE
);

--Association-relation
CREATE TABLE order_item
(
    order_item_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id      INT           NOT NULL REFERENCES "order" (order_id) ON DELETE CASCADE,
    item_id       INT           NOT NULL REFERENCES menu_item (item_id) ON DELETE RESTRICT,
    quantity      INT           NOT NULL CHECK (quantity > 0), -- you cannot order -7 chicken nuggets
    unit_price    NUMERIC(9, 2) NOT NULL, -- see above
    UNIQUE (order_id, item_id)
);

-- TODO maybe add constraint that the sum of all ordered items must be equal to the paid amount? (unless coupons do strange stuff i guess)