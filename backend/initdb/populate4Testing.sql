\connect food_delivery_platform;

INSERT INTO users (user_name, first_name, last_name, email, phone, password_hash)
VALUES ('Seal', 'Markus', 'M', 'seal@q.1', '+123', 'tubele'),
       ('owner99', 'Restau', 'rantOwner','restau@owner.at', '+123','paschwoat');

INSERT INTO restaurant (restaurant_name, owner_id, phone, email, restaurant_status_id, location_name, address_street, address_house_nr, address_postal_code, address_city, address_door)
VALUES ('Borgar Bootique',2,'+123','restaurant@mail.at','accepted','RestaurantLocation','RestaurantStr.','999','9583','Klagenfurt','5');


INSERT INTO menu_item (restaurant_id,item_name, item_price, item_description)
VALUES (1,'Pizza', 12.00, 'yay'),
       (1,'Borgar', 8.99, 'lol');


INSERT INTO "order" (order_name, order_type, order_status, address_street, address_house_nr, address_postal_code, address_city, paid_amount, payment_method, user_id)
VALUES ('SealOrder', 'delivery', 'preparing', 'Gruberstrasse', '420', '9583', 'Klagenfurt', 999.44, 'cash', 1);

INSERT INTO order_item (order_id, item_id, quantity, unit_price)
VALUES (1, 1, 1, 12.00),
       (1, 2, 1, 80.99);