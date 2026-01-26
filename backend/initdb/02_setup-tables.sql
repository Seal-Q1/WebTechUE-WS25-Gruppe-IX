\connect food_delivery_platform;

-- Role table (customer, restaurantOwner, admin)
CREATE TABLE public.role
(
    role_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE
);

-- Insert default roles
INSERT INTO public.role (role_name) VALUES ('customer'), ('restaurantOwner'), ('admin');

-- UserStatus table (ok, warned, suspended)
CREATE TABLE public.user_status
(
    user_status_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status_name    TEXT NOT NULL UNIQUE,
    status_message TEXT
);

-- Insert default statuses
INSERT INTO public.user_status (status_name, status_message) VALUES 
    ('ok', NULL),
    ('warned', 'Your account has received warnings'),
    ('suspended', 'Your account has been suspended');

-- UserLocation table for addresses
CREATE TABLE public.user_location
(
    location_id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    location_name       TEXT,
    address_street      TEXT NOT NULL,
    address_house_nr    TEXT NOT NULL,
    address_postal_code TEXT NOT NULL,
    address_city        TEXT NOT NULL,
    address_door        TEXT
);

-- Users table with foreign keys
CREATE TABLE public.users
(
    user_id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_name            TEXT        NOT NULL,
    first_name           TEXT        NOT NULL,
    last_name            TEXT        NOT NULL,
    email                TEXT UNIQUE NOT NULL,
    phone                TEXT        NOT NULL,
    password_hash        TEXT        NOT NULL,
    role_id              INT         NOT NULL REFERENCES public.role (role_id) ON DELETE RESTRICT,
    location_id          INT         REFERENCES public.user_location (location_id) ON DELETE SET NULL,
    user_status_id       INT         NOT NULL REFERENCES public.user_status (user_status_id) ON DELETE RESTRICT,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMPTZ
);

-- LoginStat table for tracking login history
CREATE TABLE public.login_stat
(
    login_stat_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       INT         NOT NULL REFERENCES public.users (user_id) ON DELETE CASCADE,
    timestamp     TIMESTAMPTZ NOT NULL DEFAULT now(),
    location      TEXT
);

-- StoredPaymentType base table
CREATE TABLE public.stored_payment_type
(
    ref_nr  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES public.users (user_id) ON DELETE CASCADE
);

-- CreditCardPaymentType (extends StoredPaymentType)
CREATE TABLE public.credit_card_payment_type
(
    ref_nr      INT PRIMARY KEY REFERENCES public.stored_payment_type (ref_nr) ON DELETE CASCADE,
    card_nr     TEXT      NOT NULL,
    cvv         SMALLINT  NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL
);

-- Q1PayPaymentType (extends StoredPaymentType)
CREATE TABLE public.q1pay_payment_type
(
    ref_nr      INT PRIMARY KEY REFERENCES public.stored_payment_type (ref_nr) ON DELETE CASCADE,
    account_sso TEXT NOT NULL
);

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



-- TODO add constraint only accepted restaurants can do anything
CREATE TYPE public.restaurant_type_enum AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE public.restaurant
(
    restaurant_id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    restaurant_name      TEXT                 NOT NULL,
    owner_id             INT REFERENCES users ON DELETE RESTRICT,
    phone                TEXT                 NOT NULL,
    email                TEXT                 NOT NULL,
    restaurant_status_id restaurant_type_enum NOT NUll,
    location_name        TEXT                 NOT NULL,
    address_street       TEXT                 NOT NULL,
    address_house_nr     TEXT                 NOT NULL,
    address_postal_code  TEXT                 NOT NULL,
    address_city         TEXT                 NOT NULL,
    address_door            TEXT NOT NULL,
    opening_hours_monday    TEXT,
    opening_hours_tuesday   TEXT,
    opening_hours_wednesday TEXT,
    opening_hours_thursday  TEXT,
    opening_hours_friday    TEXT,
    opening_hours_saturday  TEXT,
    opening_hours_sunday    TEXT,
    image                   TEXT,
    order_index             INT NOT NULL DEFAULT 0

);

CREATE TABLE public.menu_item
(
    item_id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    restaurant_id    INT REFERENCES restaurant (restaurant_id) ON DELETE CASCADE, --todo reconsider if this should cascade or restrict
    item_name        TEXT           NOT NULL,
    item_price       NUMERIC(10, 2) NOT NULL,
    item_description TEXT,
    item_picture     TEXT,
    is_deleted       BOOLEAN        NOT NULL DEFAULT FALSE,
    order_index      INT NOT NULL DEFAULT 0
);

--Association-relation
CREATE TABLE order_item
(
    order_item_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id      INT           NOT NULL REFERENCES "order" (order_id) ON DELETE CASCADE,
    item_id       INT           NOT NULL REFERENCES menu_item (item_id) ON DELETE RESTRICT,
    quantity      INT           NOT NULL CHECK (quantity > 0), -- you cannot order -7 chicken nuggets
    unit_price    NUMERIC(9, 2) NOT NULL,                      -- see above
    UNIQUE (order_id, item_id)
);

--todo add constraint that order may only hold items of the same restaurant

CREATE TABLE public.cuisine
(
    cuisine_id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cuisine_name        TEXT NOT NULL,
    cuisine_description TEXT,
    cuisine_emoji       TEXT,
    order_index         INT NOT NULL DEFAULT 0
);
-- TODO maybe add constraint that the sum of all ordered items must be equal to the paid amount? (unless coupons do strange stuff i guess)

-- Association-relation
CREATE TABLE public.restaurant_cuisine_map
(
    restaurant_cuisine_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    restaurant_id         INT NOT NULL REFERENCES public.restaurant (restaurant_id) ON DELETE CASCADE,
    cuisine_id            INT NOT NULL REFERENCES public.cuisine (cuisine_id) ON DELETE RESTRICT,
    UNIQUE (restaurant_id, cuisine_id)
);

-- Table to store users who have admin access
-- Users can be added to this list by existing admins
CREATE TABLE public.admin_list
(
    admin_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    INT UNIQUE NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    added_by   INT REFERENCES users (user_id) ON DELETE SET NULL,
    added_at   TIMESTAMPTZ DEFAULT now()
);

-- Insert default admin user with password 'admin' (role_id=3 is admin, user_status_id=1 is 'ok')
INSERT INTO public.users (user_name, first_name, last_name, email, phone, password_hash, role_id, user_status_id)
VALUES ('admin', 'Admin', 'Admin', 'admin@admin.com', '+43123456789', 'admin', 3, 1);

-- Add the admin user to the admin list
INSERT INTO public.admin_list (user_id, added_by)
SELECT user_id, user_id FROM public.users WHERE user_name = 'admin';

