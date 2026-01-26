\connect food_delivery_platform;

-- Insert sample users (role_id: 1=customer, 2=restaurantOwner, 3=admin; user_status_id: 1=ok, 2=warned, 3=suspended)
INSERT INTO users (user_name, first_name, last_name, email, phone, password_hash, role_id, user_status_id, warning_count)
VALUES 
       -- Active customers
       ('Seal', 'Markus', 'M', 'seal@q.1', '+123', 'tubele', 1, 1, 0),
       ('johndoe', 'John', 'Doe', 'john.doe@email.com', '+43660111222', 'password123', 1, 1, 0),
       ('janedoe', 'Jane', 'Doe', 'jane.doe@email.com', '+43660222333', 'password123', 1, 1, 0),
       -- Warned customers
       ('warneduser1', 'Peter', 'Parker', 'peter@email.com', '+43660333444', 'password123', 1, 2, 1),
       ('warneduser2', 'Mary', 'Jane', 'mary@email.com', '+43660444555', 'password123', 1, 2, 2),
       -- Suspended customers
       ('suspendeduser', 'Bruce', 'Banner', 'bruce@email.com', '+43660555666', 'password123', 1, 3, 3),
       -- Restaurant owners with different statuses
       ('owner99', 'Restau', 'rantOwner','restau@owner.at', '+123','paschwoat', 2, 1, 0),
       ('owner_warned', 'Tony', 'Stark', 'tony@restaurant.at', '+43660777888', 'password123', 2, 2, 1),
       ('owner_suspended', 'Steve', 'Rogers', 'steve@restaurant.at', '+43660888999', 'password123', 2, 3, 2);

-- Initialize points for sample users
INSERT INTO user_points (user_id, total_points_earned, current_balance)
SELECT user_id, 0, 0 FROM users WHERE user_id > 1
ON CONFLICT (user_id) DO NOTHING;

-- Add sample warnings for warned/suspended users
INSERT INTO user_warning (user_id, reason, issued_by)
VALUES 
    (5, 'Inappropriate language in reviews', 1),
    (6, 'Abusive behavior towards delivery driver', 1),
    (6, 'Repeated order cancellations without reason', 1),
    (7, 'Multiple accounts detected', 1),
    (7, 'Fraudulent payment attempts', 1),
    (7, 'Harassment of restaurant staff', 1),
    (9, 'Failure to maintain restaurant hygiene standards', 1),
    (10, 'Refusal to fulfill confirmed orders', 1),
    (10, 'Customer data misuse', 1);

-- owner99 is now user_id 8
INSERT INTO restaurant (restaurant_name, owner_id, phone, email, restaurant_status_id, location_name, address_street,
                        address_house_nr, address_postal_code, address_city, address_door, opening_hours_monday,
                        opening_hours_tuesday, opening_hours_wednesday, opening_hours_thursday, opening_hours_friday,
                        opening_hours_saturday, opening_hours_sunday, image)
VALUES ('Borgar Bootique', 8, '+123', 'restaurant@mail.at', 'accepted', 'RestaurantLocation', 'RestaurantStr.', '999',
        '9583', 'Klagenfurt', '5', '09:00-22:00', '09:00-22:00', '09:00-22:00', '09:00-22:00', '09:00-23:00',
        '10:00-23:00', 'Closed', null);


INSERT INTO menu_item (restaurant_id,item_name, item_price, item_description)
VALUES (1,'Pizza', 12.00, 'yay'),
       (1,'Borgar', 8.99, 'lol');


INSERT INTO "order" (order_name, order_type, order_status, address_street, address_house_nr, address_postal_code, address_city, paid_amount, payment_method, user_id)
VALUES ('SealOrder', 'delivery', 'preparing', 'Gruberstrasse', '420', '9583', 'Klagenfurt', 999.44, 'cash', 2);

INSERT INTO order_item (order_id, item_id, quantity, unit_price)
VALUES (1, 1, 1, 12.00),
       (1, 2, 1, 80.99);