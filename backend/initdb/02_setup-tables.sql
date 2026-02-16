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
    user_status_id       INT         NOT NULL DEFAULT 1 REFERENCES public.user_status (user_status_id) ON DELETE RESTRICT,
    warning_count        INT         NOT NULL DEFAULT 0,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMPTZ
);

-- User warnings table for storing warning history
CREATE TABLE public.user_warning
(
    warning_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES public.users (user_id) ON DELETE CASCADE,
    reason       TEXT NOT NULL,
    issued_by    INT REFERENCES public.users (user_id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ DEFAULT now()
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
    coupon_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    coupon_code     TEXT NOT NULL UNIQUE,
    description     TEXT,
    discount_type   TEXT NOT NULL DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percentage')),
    discount_value  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    min_order_value NUMERIC(10, 2) DEFAULT 0,
    max_uses        INT,
    current_uses    INT DEFAULT 0,
    start_date      TIMESTAMPTZ,
    end_date        TIMESTAMPTZ,
    is_active       BOOLEAN DEFAULT TRUE,
    restaurant_id   INT,  -- NULL = platform-wide, FK added later after restaurant table exists
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- PLATFORM SETTINGS & GLOBAL CONFIGURATION
-- =====================

-- Platform-wide settings (key-value store)
CREATE TABLE public.platform_setting
(
    setting_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    setting_key   TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description   TEXT,
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Insert default platform settings
INSERT INTO public.platform_setting (setting_key, setting_value, description) VALUES
    ('service_fee_percentage', '5.0', 'Platform service fee percentage charged to restaurants'),
    ('delivery_fee_base', '2.50', 'Base delivery fee in EUR'),
    ('delivery_fee_per_km', '0.50', 'Additional fee per kilometer'),
    ('min_order_value', '10.00', 'Minimum order value for delivery');

-- Delivery zones table: defines allowed delivery areas
CREATE TABLE public.delivery_zone
(
    zone_id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    zone_name       TEXT NOT NULL,
    postal_codes    TEXT NOT NULL,  -- Comma-separated list of postal codes
    city            TEXT NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    delivery_fee    NUMERIC(10, 2) DEFAULT 0,  -- Zone-specific fee override (0 = use default)
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Insert sample delivery zones
INSERT INTO public.delivery_zone (zone_name, postal_codes, city, delivery_fee) VALUES
    ('Vienna Center', '1010,1020,1030,1040,1050,1060,1070,1080,1090', 'Vienna', 2.50),
    ('Vienna Outer Districts', '1100,1110,1120,1130,1140,1150,1160,1170,1180,1190,1200,1210,1220,1230', 'Vienna', 3.50),
    ('Graz Center', '8010,8020', 'Graz', 2.50);

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
    latitude            NUMERIC,
    longitude           NUMERIC,
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
    latitude                NUMERIC,
    longitude               NUMERIC,
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

CREATE TABLE public.restaurant_review
(
    review_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    restaurant_id   INT REFERENCES restaurant (restaurant_id) ON DELETE CASCADE,
    user_id         INT REFERENCES users (user_id) ON DELETE CASCADE,
    rating          INT NOT NULL,
    review_text     TEXT,
    timestamp       TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key to coupon_code now that restaurant table exists
ALTER TABLE public.coupon_code 
    ADD CONSTRAINT fk_coupon_restaurant 
    FOREIGN KEY (restaurant_id) REFERENCES restaurant (restaurant_id) ON DELETE CASCADE;

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

CREATE TABLE public.dish_review
(
    review_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_id         INT REFERENCES menu_item (item_id) ON DELETE CASCADE,
    user_id         INT REFERENCES users (user_id) ON DELETE CASCADE,
    rating          INT NOT NULL,
    review_text     TEXT,
    timestamp       TIMESTAMPTZ DEFAULT now()
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

INSERT INTO public.admin_list (user_id, added_by)
SELECT user_id, user_id FROM public.users WHERE user_name = 'admin';

-- =====================
-- MULTIPLE ADDRESSES & PAYMENT CARDS
-- =====================

-- User addresses table: allows multiple addresses per user
CREATE TABLE public.user_address
(
    address_id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id             INT         NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    address_name        TEXT        NOT NULL DEFAULT 'Home',
    address_street      TEXT        NOT NULL,
    address_house_nr    TEXT        NOT NULL,
    address_postal_code TEXT        NOT NULL,
    address_city        TEXT        NOT NULL,
    address_door        TEXT,
    latitude            NUMERIC,
    longitude           NUMERIC,
    is_default          BOOLEAN     DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT now()
);

-- Payment card table: stores user's payment cards
CREATE TABLE public.payment_card
(
    card_id             INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id             INT         NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    card_name           TEXT        NOT NULL DEFAULT 'My Card',
    card_holder_name    TEXT        NOT NULL,
    card_number_last4   TEXT        NOT NULL,
    card_number_hash    TEXT        NOT NULL,
    expiry_month        INT         NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
    expiry_year         INT         NOT NULL CHECK (expiry_year >= 2024),
    card_type           TEXT        NOT NULL DEFAULT 'visa',
    is_default          BOOLEAN     DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_address_user ON user_address (user_id);
CREATE INDEX idx_payment_card_user ON payment_card (user_id);

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE user_address 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id AND address_id != NEW.address_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_default_address
AFTER INSERT OR UPDATE ON user_address
FOR EACH ROW
EXECUTE FUNCTION ensure_single_default_address();

-- Function to ensure only one default card per user
CREATE OR REPLACE FUNCTION ensure_single_default_card()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE payment_card 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id AND card_id != NEW.card_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_default_card
AFTER INSERT OR UPDATE ON payment_card
FOR EACH ROW
EXECUTE FUNCTION ensure_single_default_card();

-- =====================
-- LOYALTY & REWARDS SYSTEM
-- =====================

-- Reward types: fixed_discount (€ off), percentage_discount (% off), free_product (free menu item)
CREATE TYPE public.reward_type_enum AS ENUM ('fixed_discount', 'percentage_discount', 'free_product');

-- Point transaction types
CREATE TYPE public.point_transaction_type_enum AS ENUM ('earned', 'redeemed', 'expired', 'bonus', 'adjustment');

-- Promotions table: defines active promotions with point multipliers or special offers
CREATE TABLE public.promotion
(
    promotion_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    promotion_name  TEXT        NOT NULL,
    description     TEXT,
    multiplier      NUMERIC(3, 2) DEFAULT 1.0, -- e.g., 2.0 for double points
    start_date      TIMESTAMPTZ NOT NULL,
    end_date        TIMESTAMPTZ NOT NULL,
    is_active       BOOLEAN     DEFAULT TRUE,
    -- Optional: restrict to specific days of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    -- NULL means all days, otherwise comma-separated day numbers
    applicable_days TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT promotion_date_check CHECK (end_date > start_date),
    CONSTRAINT promotion_multiplier_check CHECK (multiplier >= 1.0)
);

-- Rewards catalog: available rewards customers can redeem
CREATE TABLE public.reward
(
    reward_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reward_name     TEXT            NOT NULL,
    description     TEXT,
    reward_type     reward_type_enum NOT NULL,
    points_cost     INT             NOT NULL CHECK (points_cost > 0),
    -- For fixed_discount: discount amount in EUR
    -- For percentage_discount: percentage (e.g., 10 for 10%)
    -- For free_product: NULL (product specified in menu_item_id)
    discount_value  NUMERIC(10, 2),
    -- For free_product rewards, which menu item
    menu_item_id    INT REFERENCES menu_item (item_id) ON DELETE SET NULL,
    -- Minimum order value to use this reward (optional)
    min_order_value NUMERIC(10, 2) DEFAULT 0,
    -- Optional: limited time reward
    valid_from      TIMESTAMPTZ,
    valid_until     TIMESTAMPTZ,
    is_active       BOOLEAN         DEFAULT TRUE,
    created_at      TIMESTAMPTZ     DEFAULT now(),
    
    CONSTRAINT reward_discount_check CHECK (
        (reward_type = 'free_product' AND menu_item_id IS NOT NULL) OR
        (reward_type != 'free_product' AND discount_value IS NOT NULL)
    )
);

-- User points balance tracking
CREATE TABLE public.user_points
(
    user_points_id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id             INT UNIQUE NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    total_points_earned INT        DEFAULT 0 CHECK (total_points_earned >= 0),
    current_balance     INT        DEFAULT 0 CHECK (current_balance >= 0),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Point transactions history
CREATE TABLE public.point_transaction
(
    transaction_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id          INT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    points           INT NOT NULL, -- positive for earned/bonus, negative for redeemed
    transaction_type point_transaction_type_enum NOT NULL,
    -- Optional references
    order_id         INT REFERENCES "order" (order_id) ON DELETE SET NULL,
    promotion_id     INT REFERENCES promotion (promotion_id) ON DELETE SET NULL,
    redemption_id    INT, -- Will be set after reward_redemption is created
    description      TEXT,
    created_at       TIMESTAMPTZ DEFAULT now()
);

-- Reward redemption history
CREATE TABLE public.reward_redemption
(
    redemption_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
    reward_id       INT NOT NULL REFERENCES reward (reward_id) ON DELETE RESTRICT,
    points_spent    INT NOT NULL CHECK (points_spent > 0),
    -- For tracking if/when the reward was used
    order_id        INT REFERENCES "order" (order_id) ON DELETE SET NULL,
    redeemed_at     TIMESTAMPTZ DEFAULT now(),
    used_at         TIMESTAMPTZ,
    -- Store snapshot of reward details at time of redemption
    reward_snapshot JSONB NOT NULL
);

-- Add foreign key for point_transaction.redemption_id after reward_redemption exists
ALTER TABLE public.point_transaction 
ADD CONSTRAINT fk_point_transaction_redemption 
FOREIGN KEY (redemption_id) REFERENCES reward_redemption (redemption_id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_point_transaction_user ON point_transaction (user_id);
CREATE INDEX idx_point_transaction_created ON point_transaction (created_at);
CREATE INDEX idx_reward_redemption_user ON reward_redemption (user_id);
CREATE INDEX idx_promotion_dates ON promotion (start_date, end_date);

-- Insert sample promotions
INSERT INTO public.promotion (promotion_name, description, multiplier, start_date, end_date, applicable_days)
VALUES 
    ('Weekend Double Points', 'Earn double points on all orders during weekends!', 2.0, 
     now(), now() + INTERVAL '1 year', '0,6'),
    ('Summer Special', 'Get 1.5x points on all orders this summer!', 1.5, 
     '2025-06-01', '2025-08-31', NULL);

-- Insert sample rewards
INSERT INTO public.reward (reward_name, description, reward_type, points_cost, discount_value, min_order_value)
VALUES 
    ('€5 Off Your Order', 'Get €5 off your next order of €15 or more', 'fixed_discount', 50, 5.00, 15.00),
    ('€10 Off Your Order', 'Get €10 off your next order of €25 or more', 'fixed_discount', 90, 10.00, 25.00),
    ('10% Off', 'Get 10% off your entire order of €15 or more', 'percentage_discount', 75, 10, 15.00),
    ('15% Off', 'Get 15% off your entire order of €20 or more', 'percentage_discount', 120, 15, 20.00),
    ('€20 Off Big Order', 'Get €20 off orders of €50 or more', 'fixed_discount', 180, 20.00, 50.00);

INSERT INTO public.user_points (user_id, total_points_earned, current_balance)
SELECT user_id, 0, 0 FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- Set initial points for admin user (e.g., 1000 points)
UPDATE public.user_points
SET total_points_earned = 1000, current_balance = 1000, updated_at = now()
WHERE user_id = (SELECT user_id FROM public.users WHERE user_name = 'admin');

-- Log the initial points as a bonus transaction for admin
INSERT INTO public.point_transaction (user_id, points, transaction_type, description)
SELECT user_id, 1000, 'bonus', 'Initial points for admin'
FROM public.users WHERE user_name = 'admin';