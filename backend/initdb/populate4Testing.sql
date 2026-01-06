\connect food_delivery_platform;

INSERT INTO users (user_name, first_name, last_name, email, phone, password_hash)
VALUES ('Seal', 'Markus', 'M', 'seal@q.1', '+123', 'tubele');


INSERT INTO menu_item (item_name, item_price, item_description)
VALUES ('Pizza', 12.00, 'yay'),
       ('Borgar', 8.99, 'lol');


INSERT INTO "order" (order_name, order_type, order_status, address_street, address_house_nr, address_postal_code, address_city, paid_amount, payment_method, user_id)
VALUES ('SealOrder', 'delivery', 'preparing', 'Gruberstrasse', '420', '9583', 'Klagenfurt', 999.44, 'cash', 1);

INSERT INTO order_item (order_id, item_id, quantity, unit_price)
VALUES (1, 1, 1, 12.00),
       (1, 2, 1, 80.99);