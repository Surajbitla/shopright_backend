show databases;
create database shopright;
use shopright;

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phoneNumber VARCHAR(15) NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_temp_password TINYINT DEFAULT 1,
  registered_date DATETIME DEFAULT CURRENT_TIMESTAMP
);


show tables;
describe users;

select * from users;

truncate table users;
truncate table cart_items;


CREATE TABLE products (
    id INT PRIMARY KEY,
    description VARCHAR(255),
    price DECIMAL(10, 2),
    rating DECIMAL(2, 1),
    image VARCHAR(255)
);

INSERT INTO products (id, description, price, rating, image) VALUES
(1, 'Retractable Car Charger 4 in 1 Fast Car Phone Charger 60W', 22.88, 4.5, 'images/1.jpg'),
(2, 'Portable Charger 38800mAh,LCD Display Power Bank', 34.99, 4, 'images/2.jpg'),
(3, 'Baseus Charging Station 65W PowerCombo, 6 in 1 Power Strip with Retractable USB-C Cable', 69.99, 3, 'images/3.jpg'),
(4, '1TB USB Flash Drive, Portable High Speed USB', 25.99, 5, 'images/4.jpg'),
(5, 'SAMSUNG Type-C™ USB Flash Drive, 256GB, Transfers 4GB Files in 11 Secs w/Up to 400MB/s 3.13 Read Speeds', 24.99, 3.5, 'images/5.jpg'),
(6, 'Apple AirPods Pro (2nd Generation) Up to 2X More Active Noise Cancelling Bluetooth Headphones, Transparency Mode', 249.99, 4.5, 'images/6.jpg'),
(7, 'Apple AirPods Max Wireless Over-Ear Headphones, Active Noise Cancelling, Transparency Mode, Personalized Spatial Audio, Dolby Atmos', 479.99, 4.5, 'images/7.jpg'),
(8, '3-Pair Replacement Ear Tips for AirPods Pro & 2nd Generation with Noise Reduction Holewith and Cleaner kit', 8.00, 3.5, 'images/8.jpg'),
(9, 'soundcore by Anker Liberty 4 NC Wireless Earbuds, 98.5% Noise Reduction', 88.00, 4, 'images/9.jpg'),
(10, 'UCOMX Nano 3 in 1 Wireless Charger for iPhone', 29.99, 4.5, 'images/10.jpg'),
(11, 'sisma Travel Electronics Organizer Small Electronic Accessories Carrying Bag', 16.99, 4, 'images/11.jpg'),
(12, 'Bluetooth Speaker with HD Sound, Portable Wireless, IPX5 Waterproof', 26.99, 5, 'images/12.jpg'),
(13, 'BUGANI Bluetooth Speakers, 40W Loud Portable Wireless Bluetooth Speaker AUX for Party Outdoor Camping', 34.99, 4.5, 'images/13.jpg'),
(14, 'Apple Watch SE (2nd Gen) [GPS 40mm] Smartwatch with Midnight Aluminum Case', 249.99, 4, 'images/14.jpg'),
(15, 'Apple Watch Series 5 (GPS + Cellular, 40MM) Gold Aluminum Case with Pink Sport Band', 199.99, 4, 'images/15.jpg'),
(16, 'Apple iPhone 15 (128 GB) – Black', 900.00, 4, 'images/16.jpg'),
(17, 'Apple iPhone 14 Pro, 256GB, Deep Purple', 999.00, 5, 'images/17.jpg'),
(18, 'Apple iPhone 15 Pro (128 GB) - Natural Titanium', 1200.00, 4.5, 'images/18.jpg'),
(19, 'OnePlus 9 Winter Mist, 5G Unlocked Android Smartphone U.S Version, 8GB RAM+128GB Storage', 405.00, 4.9, 'images/19.jpg'),
(20, 'OnePlus 10T | Moonstone Black | 5G Unlocked Android Smartphone U.S Version | 8GB RAM+128GB Storage', 369.00, 4, 'images/20.jpg'),
(21, 'Apple AirPods (3rd Generation) Wireless Ear Buds', 199.00, 5, 'images/21.jpg'),
(22, 'SanDisk 2TB Extreme Portable SSD', 129.99, 5, 'images/22.jpg'),
(23, 'SAMSUNG SSD T7 Portable External Solid State Drive 1TB, Up to USB 3.2 Gen 2', 94.99, 5, 'images/23.jpg'),
(24, 'SAMSUNG Galaxy Tab S7 FE 12.4” 64GB WiFi Android Tablet', 349.00, 4.5, 'images/24.jpg'),
(25, 'Apple iPad Air (5th Generation): with M1 chip, 10.9-inch', 549.00, 4.5, 'images/25.jpg'),
(26, 'Apple iPad (9th Generation): with A13 Bionic chip, 10.2-inch', 249.00, 5, 'images/26.jpg'),
(27, 'HP x3000 Wireless Mouse, Contoured Comfort, USB Wireless', 8.99, 4.5, 'images/27.jpg'),
(28, 'HP 970 Programmable Wireless Keyboard (Silver) - Bluetooth & 2.4 GHz', 29.99, 3.4, 'images/28.jpg'),
(29, 'havit HV-F2056 15.6"-17" Laptop Cooler Cooling Pad', 27.99, 4, 'images/29.jpg'),
(30, 'TECKNET Wireless Mouse, 2.4G Ergonomic Optical Mouse, Computer Mouse for Laptop', 9.99, 4, 'images/30.jpg');

select * from products;

CREATE TABLE carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE cart_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10, 2),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

select * from carts;
select * from cart_items;

CREATE TABLE addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    address_line VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    is_primary BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    card_number VARCHAR(255),
    card_type VARCHAR(50),
    expiry_date VARCHAR(10),
    cvv VARCHAR(5),
    is_default BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

truncate table addresses;
select * from addresses;
select* from payments; 

-- Ordered - 0
-- Processed - 30 
-- Shipped - 50
-- Out for Delivery - 70
-- Delivered - 100


CREATE TABLE orders (
	order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
--     order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     processed_date TIMESTAMP NULL,
--     shipped_date TIMESTAMP NULL,
--     out_for_delivery_date TIMESTAMP NULL,
--     delivered_date TIMESTAMP NULL,
--     status VARCHAR(50) DEFAULT 'Ordered', -- or any default status you'd like
    shipping_address_id INT NOT NULL,
    payment_method_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id), 
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(address_id), 
    FOREIGN KEY (payment_method_id) REFERENCES payments(payment_id) 
)AUTO_INCREMENT=25000;

CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10, 2),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_date TIMESTAMP NULL,
    shipped_date TIMESTAMP NULL,
    out_for_delivery_date TIMESTAMP NULL,
    delivered_date TIMESTAMP NULL,
    initiated_date TIMESTAMP NULL,
    picked_up_date TIMESTAMP NULL,
    received_date TIMESTAMP NULL,
    refund_issued_date TIMESTAMP NULL,
    refund_credited_date TIMESTAMP NULL,
    status VARCHAR(50) DEFAULT 'Ordered', -- or any default status you'd like
    cancelled_status VARCHAR(50) DEFAULT 'Initiated',
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- drop table order_items;
-- drop table orders;

-- truncate table orders;
-- truncate table order_items;

select * from orders;
select * from order_items;


-- Ordered 
-- Processed 
-- Shipped 
-- Out for Delivery 
-- Delivered 




