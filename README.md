# Shopright_backend

## Introduction
ShopRight is a digital marketplace where customers can explore a variety of products, conduct product searches, examine detailed product information, and complete purchases using their credit or debit cards.

## Technical Overview
ShopRight is built using a three-tier architecture:
- **Presentation Layer**: HTML, CSS, JavaScript, ReactJS.
- **Application Layer**: NodeJS with ExpressJS Framework.
- **Data Layer**: MySQL.
The platform is designed for scalability with AWS cloud computing and features robust security measures including HTTPS, user authentication, and data encryption.

## How to Run the Code

### Prerequisites
Before you begin, ensure you have met the following requirements:

- **Node.js**: Version 12.x or above.
- **npm**  As a package manager.
- **Git**: For cloning and version control.
- **MySQL**: For the database.
- **Any text editor or IDE**: Preferably VSCode.
- An email account for sending temporary passwords (setup with Brevo)


### Installation and Setup

#### Setting Up the Frontend
1. Clone the frontend repository:
   ```
   git clone https://github.com/Surajbitla/shopright.git
   ```
2. Navigate to the frontend repository location:
   ```
   cd [frontend-repo-location]
   ```
3. Install the necessary packages:
   ```
   npm install
   ```
4. Start the frontend server:
   ```
   npm start
   ```
5. Open the website in a browser:
   ```
    http://localhost:3000
   ```

#### Setting Up the Backend
1. Clone the backend repository:
   ```
   git clone https://github.com/Surajbitla/shopright_backend.git
   ```
2. Navigate to the backend repository location in a new VS Code window:
   ```
   cd [backend-repo-location]
   ```
3. Start the backend server:
   ```
   node server.js
   ```
   This will also establish a connection to the database.


#### Email Configuration for Temporary Passwords
1. Sign up or log in to https://app.brevo.com/.
2. Navigate to SMTP & API and click "Generate a new SMTP Key".
3. Copy the generated key.
4. In your project, open `server.js` or the relevant file where the nodemailer transport is set up.
5. Replace the `user` value with your email and `pass` value with the copied SMTP key:
   ```javascript
   const transporter = nodemailer.createTransport({
       host: "smtp-relay.brevo.com",
       port: 587,
       secure: false,
       auth: {
           user: "mygamil@gmail.com",
           pass: "xsmtpsib-your-copied-key"
       }
   });
   ```

#### Database Configuration
Before running the `server.js`, you need to set up your database connection. The default connection settings are as follows:

```javascript
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'saiyan',
  password: 'saiyan',
  database: 'shopright'
});
```

##### Modifying Database Connection Settings

1. Open the `server.js` file in your project.
2. Locate the section of code where the MySQL connection is created.
3. Replace `'localhost'`, `'saiyan'`, `'saiyan'`, and `'shopright'` with your database's host, username, password, and database name, respectively.
4. Save the changes.

##### Ensuring Proper Database Setup

- Ensure your MySQL database is running.
- Create a database matching the name in `server.js`.
- Run the necessary script files for database schema setup (located in the `shopright-backend` repository).

##### Database Setup
1. Ensure MySQL is installed and running on your system.
2. Run the provided script files located in the `shopright-backend` repository to set up the database schema.

## Features
- Detailed product catalog
- User-friendly shopping cart and checkout process
- Secure user account management
- Comprehensive order management system

## Usage
- Search and browse products easily
- Add products to the shopping cart
- Seamlessly proceed to checkout and payment

## ShopRight Screenshots

## Home Screen
![Home Screen](https://github.com/Surajbitla/shopright/assets/135169955/c3a1cfc5-7295-411e-abca-743c23c0c01f)

## Products Overview
### Products Page 1
![Products 1](https://github.com/Surajbitla/shopright/assets/135169955/64dc00f3-3ed7-4b69-b31f-46280423f501)

### Products Page 2
![Products 2](https://github.com/Surajbitla/shopright/assets/135169955/3eaa5cb3-9706-4eee-9a27-0cc4d992257f)

## User Authentication
### Login
![Login](https://github.com/Surajbitla/shopright/assets/135169955/c52dc048-ce42-4118-9078-9435608e2f19)

### Signup
![Signup](https://github.com/Surajbitla/shopright/assets/135169955/b3c5adf3-1d60-4b71-874b-3501bdea871b)

## Landing Page
![Landing Page](https://github.com/Surajbitla/shopright/assets/135169955/a20f1a35-c2bd-41a9-81f7-3a9c5e41d1c2)

## Customer Service
![Customer Service](https://github.com/Surajbitla/shopright/assets/135169955/c4354a7f-0ee5-4904-bb54-0da823e9ac39)

## Shopping Cart
### Shopping Cart Empty
![Shopping Cart Empty](https://github.com/Surajbitla/shopright/assets/135169955/6a5472bc-3a2e-4323-a3b1-86ec8d5ac169)

### Shopping Cart
![Shopping Cart](https://github.com/Surajbitla/shopright/assets/135169955/8eac2c52-8920-4b05-becb-dfb24ed5f68b)

## Account Management
### My Details
![My Details](https://github.com/Surajbitla/shopright/assets/135169955/9a136985-2b20-4cae-98dc-6af45688a6fb)

### My Payments
![My Payments](https://github.com/Surajbitla/shopright/assets/135169955/110f9d17-e46e-4655-a2ba-4a620e56d4bd)

### My Address
![My Address](https://github.com/Surajbitla/shopright/assets/135169955/bec5bc17-063e-47c1-b1f0-1321dc0caf88)

## Product Details
![Product Detail](https://github.com/Surajbitla/shopright/assets/135169955/66e72bc5-c60a-449c-abd2-12393f5a524b)

## Add to Cart
![Add to cart](https://github.com/Surajbitla/shopright/assets/135169955/0b00e8bd-dffd-4219-b769-7f8fa1dcaec5)

## Checkout Process
### Checkout
![Checkout](https://github.com/Surajbitla/shopright/assets/135169955/4dfa78ed-97a8-4c4e-924a-9839af7e8849)

### Address Change
![Address Change](https://github.com/Surajbitla/shopright/assets/135169955/82f8adb2-ad77-4148-b208-370bbba23596)

### Payments Change
![Payments Change](https://github.com/Surajbitla/shopright/assets/135169955/d9641ed9-9abb-4d0c-b803-d0389e9cd101)

### Place Order
![Place Order](https://github.com/Surajbitla/shopright/assets/135169955/b36e17b2-a5fe-49df-b143-ff06cbe6c255)

## Order Management
### Order History
![Order History](https://github.com/Surajbitla/shopright/assets/135169955/92f5febb-f199-4b6d-abda-5acae823c320)

### Order History Detailed View
![Order History 2](https://github.com/Surajbitla/shopright/assets/135169955/85a6f724-ee28-4676-9c58-91e3c59058df)

### Cancel Order
![Cancel Order](https://github.com/Surajbitla/shopright/assets/135169955/3ffb805c-0d03-40a0-bfda-9cb06a2a15e6)

### Cancel Order Confirmation
![Cancel Order 2](https://github.com/Surajbitla/shopright/assets/135169955/e68f9e94-ed72-427b-8570-72c3044b23f1)

### Return Order
![Return Order](https://github.com/Surajbitla/shopright/assets/135169955/1a714bd9-0e8f-4e25-aeff-600c8f44ffa8)

### Return Order Confirmation
![Return Order 2](https://github.com/Surajbitla/shopright/assets/135169955/632985b8-041e-47dc-86ff-eef88111429b)

## Security Features
### Change Password
![Change Password](https://github.com/Surajbitla/shopright/assets/135169955/08221d86-f609-468a-96bf-3ae53eb70bc8)

### Temporary Password
![Temp Password](https://github.com/Surajbitla/shopright/assets/135169955/bdb311be-03f0-4b97-ba30-cbbc0a3ed63f)

## Receipt and Order Confirmation
### Receipt
![Receipt](https://github.com/Surajbitla/shopright/assets/135169955/edaeb1b0-138b-4a75-a81e-5dd244b86386)


## Note on Project Status

This is currently the first version (Version 1.0) of ShopRight, marking the initial phase of development. It's important to note that this version serves as a foundational release, and there are several enhancements and features that are still in the pipeline. Future updates will focus on improving functionality, adding new features, and refining the user experience. Your feedback and contributions are invaluable as we continue to evolve and improve this platform. Stay tuned for upcoming releases and additional features!


## Contact
- Suraj Bitla
- [surajb.5639@gmail.com](mailto:surajb.5639@gmail.com)
- [LinkedIn](https://www.linkedin.com/in/suraj-bitla-73a623148/)

