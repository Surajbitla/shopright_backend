const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 5000;
const saltRounds = 10;

app.use(cors());
app.use(express.json());

// Database connection setup
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'saiyan',
  password: 'saiyan',
  database: 'shopright'
});

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to the database:', error);
    return;
  }
  console.log('Connected to the MySQL database.');
});

function generateTempPassword(length = 8) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // limit to 5 requests per windowMs
    message: "Too many login attempts, please try again later.",
    keyGenerator: function(req, res) {
        return req.body.email; 
    }
});


const sendEmail = async (email, tempPassword) => {
    const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
            user: "mygmail@gmail.com",
            pass: "xsmtpsib-pass"
        }
    });

    const mailOptions = {
        from: 'surajbitla856@gmail.com',
        to: email,
        subject: 'Your Temporary Password',
        html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Hello,</h2>
            <p>Your temporary password is: <strong>${tempPassword}</strong></p>
            <p>Please use this password to log in to your account. For your security, we recommend you update your password immediately after logging in.</p>
            <p>If you did not request a temporary password, please contact our support team immediately.</p>
            <p><a href="http://localhost:3000/login" style="background-color: #0046f4; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In</a></p>
            <p>Thank you,<br>ShopRight Team</p>
        </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Temporary password sent to email!');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

app.post('/signup',async  (req, res) => {
  const { firstName, lastName, email, phoneNumber } = req.body;
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);
  const query = 'INSERT INTO users (firstName, lastName, email, phoneNumber, password, is_temp_password) VALUES (?, ?, ?, ?, ?, TRUE)';

    connection.query(query, [firstName, lastName, email, phoneNumber, hashedPassword], async (error, results) => {
        if (error) {
            console.error("Error inserting into database:", error);
            if (error.code === 'ER_DUP_ENTRY') {
              res.status(409).send("Error registering the user: Duplicate entry");
              return;
            }
            res.status(500).send("Error registering the user");
            return;
        }

        // Sending the email after successful registration
        try {
            await sendEmail(email, tempPassword);
            res.send("User registered successfully!");
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            res.status(500).send("User registered, but there was an error sending the email.");
        }
    });
});

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  // Verify if user exists
  const query = 'SELECT * FROM users WHERE email = ?';
  connection.query(query, [email], async (error, results) => {
      if (error) {
          console.error("Error querying the database:", error);
          res.status(500).send("Error processing your request");
          return;
      }

      if (results.length === 0) {
          res.status(404).send("User not found");
          return;
      }

      // Generate a temporary password
      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

      // Update user's password in the database
      const updateQuery = 'UPDATE users SET password = ?, is_temp_password = TRUE WHERE email = ?';
      connection.query(updateQuery, [hashedPassword, email], async (updateError) => {
          if (updateError) {
              console.error("Error updating the database:", updateError);
              res.status(500).send("Error updating user's password");
              return;
          }

          // Send email with temporary password
          try {
              await sendEmail(email, tempPassword);
              res.send("Temporary password has been sent to your email");
          } catch (emailError) {
              console.error("Error sending email:", emailError);
              res.status(500).send("Password reset, but there was an error sending the email.");
          }
      });
  });
});



app.post('/login',loginLimiter, (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT id, email, firstName,lastName, password, is_temp_password, phoneNumber FROM users WHERE email = ?';

    connection.query(query, [email], async (error, results) => {
      if (error) {
        console.error("Error fetching user:", error);
        return res.status(500).send("Internal server error");
      }
  
      if (results.length === 0) {
        return res.status(401).send("No user found with this email");
      }
  
      const user = results[0];
      // Compare provided password with stored hashed password
      const isTempPassword = user.is_temp_password === 1; // MySQL might return this as a number
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).send("Incorrect password");
      }
      res.json({
        message: "Logged in successfully",
        isTempPassword,
        user // send the user details
    });
    });
  });


  app.post('/change-password', async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    
    const query = 'SELECT password FROM users WHERE email = ?';
    connection.query(query, [email], async (error, results) => {
        if (error) {
            console.error("Error fetching user:", error);
            return res.status(500).send("Internal server error");
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "No user found with this email" });
        }

        const isPasswordCorrect = await bcrypt.compare(currentPassword, results[0].password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: "Incorrect current password" });
        }

        // Update the user's password in the database and set is_temp_password to FALSE
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        const updateQuery = 'UPDATE users SET password = ?, is_temp_password = FALSE WHERE email = ?';
        connection.query(updateQuery, [hashedNewPassword, email], (updateError) => {
            if (updateError) {
                console.error("Error updating password:", updateError);
                return res.status(500).send("Error changing the password");
            }
            res.json({ success: true, message: "Password changed successfully" });
        });
    });
});

app.put('/cart/:userId', (req, res) => {
  const { userId } = req.params;
  const cartItems = req.body; // expecting an array of cart items

  // Start the transaction
  connection.beginTransaction((err) => {
    if (err) {
      console.error('Transaction Error:', err);
      return res.status(500).send('Internal server error');
    }

    // Step 1: Get or create a cart for the user
    const getOrCreateCartQuery = `
      INSERT INTO carts (user_id)
      SELECT ? WHERE NOT EXISTS (
        SELECT 1 FROM carts WHERE user_id = ?
      );
    `;

    connection.query(getOrCreateCartQuery, [userId, userId], (error, results) => {
      if (error) {
        return connection.rollback(() => {
          console.error('Rollback Error:', error);
          res.status(500).send('Error getting or creating cart');
        });
      }

      // Step 2: Retrieve the cart_id
      const selectCartIdQuery = 'SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1';
      connection.query(selectCartIdQuery, [userId], (error, results) => {
        if (error || results.length === 0) {
          return connection.rollback(() => {
            console.error('Rollback Error:', error);
            res.status(500).send('Error retrieving cart id');
          });
        }

        const cartId = results[0].cart_id;

        // Step 3: Clear existing cart items
        const deleteQuery = 'DELETE FROM cart_items WHERE cart_id = ?';
        connection.query(deleteQuery, [cartId], (error, deleteResult) => {
          if (error) {
            return connection.rollback(() => {
              console.error('Rollback Error:', error);
              res.status(500).send('Error clearing cart items');
            });
          }

          // Step 4: Insert new cart items if any
          if (cartItems.length > 0) {
            const insertQuery = 'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES ?';
            const values = cartItems.map(item => [cartId, item.id, item.quantity, item.price]);
            connection.query(insertQuery, [values], (error, insertResult) => {
              if (error) {
                return connection.rollback(() => {
                  console.error('Rollback Error:', error);
                  res.status(500).send('Error inserting cart items');
                });
              }

              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    console.error('Commit Rollback Error:', err);
                    res.status(500).send('Error finalizing cart update');
                  });
                }
                console.log('Transaction Complete.');
                res.send('Cart updated successfully');
              });
            });
          } else {
            // If there are no items to insert, commit the transaction
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  console.error('Commit Rollback Error:', err);
                  res.status(500).send('Error finalizing cart update');
                });
              }
              console.log('Transaction Complete with empty cart.');
              res.send('Cart updated successfully with no items');
            });
          }
        });
      });
    });
  });
});

app.get('/cart/:userId', (req, res) => {
  const { userId } = req.params;

  // Begin transaction to fetch user cart
  connection.beginTransaction((err) => {
    if (err) {
      console.error('Transaction Error:', err);
      return res.status(500).send('Internal server error');
    }

    // Step 1: Get the cart_id for the user
    const selectCartIdQuery = 'SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1';
    connection.query(selectCartIdQuery, [userId], (error, results) => {
      if (error) {
        return connection.rollback(() => {
          console.error('Rollback Error:', error);
          res.status(500).send('Error retrieving cart id');
        });
      }

      // Check if a cart was found
      if (results.length === 0) {
        return res.status(404).send('No cart found for this user');
      }

      const cartId = results[0].cart_id;

      // Step 2: Fetch cart items for the cart_id
      const selectCartItemsQuery = `
        SELECT  ci.product_id as id, ci.quantity, ci.price, p.description, p.image
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = ?;
      `;
      connection.query(selectCartItemsQuery, [cartId], (error, cartItems) => {
        if (error) {
          return connection.rollback(() => {
            console.error('Rollback Error:', error);
            res.status(500).send('Error retrieving cart items');
          });
        }

        // If there are no errors, commit the transaction and return the cart items
        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              console.error('Commit Rollback Error:', err);
              res.status(500).send('Error finalizing cart retrieval');
            });
          }
          cartItems.forEach(item => {
            item.price = parseFloat(item.price);
          });
          res.json(cartItems);
        });
      });
    });
  });
});

app.get('/addresses/:userId', (req, res) => {
  const { userId } = req.params;

  // SQL query to fetch addresses
  const query = `
      SELECT address_id, address_line, city, state, postal_code, is_primary
      FROM addresses
      WHERE user_id = ?;
  `;

  connection.query(query, [userId], (error, results) => {
      if (error) {
          console.error('Error fetching addresses:', error);
          return res.status(500).send('Internal server error');
      }

      // If addresses are found, send them back to the client
      if (results.length > 0) {
          res.json(results);
      } else {
          // No addresses found for this user
          res.status(404).send('No addresses found for this user');
      }
  });
});

app.post('/addresses', (req, res) => {
  const { userId, addressLine, city, state, postalCode, isPrimary } = req.body;
  const query = 'INSERT INTO addresses (user_id, address_line, city, state, postal_code, is_primary) VALUES (?, ?, ?, ?, ?, ?)';

  connection.query(query, [userId, addressLine, city, state, postalCode, isPrimary], (error, results) => {
      if (error) {
          console.error('Error adding address:', error);
          res.status(500).send('Error adding address');
          return;
      }
      res.send('Address added successfully');
  });
});

app.delete('/addresses/:addressId', (req, res) => {
  const { addressId } = req.params;
  const query = 'DELETE FROM addresses WHERE address_id = ?';

  connection.query(query, [addressId], (error, results) => {
      if (error) {
          console.error('Error removing address:', error);
          res.status(500).send('Internal server error');
          return;
      }
      res.send('Address deleted successfully');
  });
});


app.put('/addresses/:addressId/set-primary', (req, res) => {
  const { addressId } = req.params;
  const { userId } = req.body; // User ID for additional validation

  // Begin transaction
  connection.beginTransaction((err) => {
      if (err) {
          console.error('Transaction Error:', err);
          return res.status(500).send('Internal server error');
      }

      // Step 1: Set all addresses of the user to non-primary
      const resetQuery = 'UPDATE addresses SET is_primary = FALSE WHERE user_id = ?';
      connection.query(resetQuery, [userId], (error) => {
          if (error) {
              return connection.rollback(() => {
                  console.error('Rollback Error:', error);
                  res.status(500).send('Error updating addresses');
              });
          }

          // Step 2: Set the selected address as primary
          const updateQuery = 'UPDATE addresses SET is_primary = TRUE WHERE address_id = ? AND user_id = ?';
          connection.query(updateQuery, [addressId, userId], (error) => {
              if (error) {
                  return connection.rollback(() => {
                      console.error('Rollback Error:', error);
                      res.status(500).send('Error setting primary address');
                  });
              }

              // Commit transaction
              connection.commit((err) => {
                  if (err) {
                      return connection.rollback(() => {
                          console.error('Commit Rollback Error:', err);
                          res.status(500).send('Error finalizing address update');
                      });
                  }
                  res.send('Primary address updated successfully');
              });
          });
      });
  });
});



app.get('/payments/:userId', (req, res) => {
  const { userId } = req.params;
  const query = `
      SELECT payment_id, card_number, card_type, expiry_date, cvv, is_default
      FROM payments
      WHERE user_id = ?;
  `;

  connection.query(query, [userId], (error, results) => {
      if (error) {
          console.error('Error fetching payments:', error);
          return res.status(500).send('Internal server error');
      }

      if (results.length > 0) {
          res.json(results);
      } else {
          res.status(404).send('No payments found for this user');
      }
  });
});


app.post('/payments', (req, res) => {
  const { userId, cardNumber, cardType, expiryDate, cvv, isDefault } = req.body;
  const query = 'INSERT INTO payments (user_id, card_number, card_type, expiry_date, cvv, is_default) VALUES (?, ?, ?, ?, ?, ?)';

  connection.query(query, [userId, cardNumber, cardType, expiryDate, cvv, isDefault], (error, results) => {
      if (error) {
          console.error('Error adding payment method:', error);
          res.status(500).send('Error adding payment method');
          return;
      }
      res.send('Payment method added successfully');
  });
});


app.delete('/payments/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  const query = 'DELETE FROM payments WHERE payment_id = ?';

  connection.query(query, [paymentId], (error, results) => {
      if (error) {
          console.error('Error removing payment method:', error);
          res.status(500).send('Internal server error');
          return;
      }
      res.send('Payment method deleted successfully');
  });
});


app.put('/payments/:paymentId/set-default', (req, res) => {
  const { paymentId } = req.params;
  const { userId } = req.body;

  connection.beginTransaction((err) => {
      if (err) {
          console.error('Transaction Error:', err);
          return res.status(500).send('Internal server error');
      }

      const resetQuery = 'UPDATE payments SET is_default = FALSE WHERE user_id = ?';
      connection.query(resetQuery, [userId], (error) => {
          if (error) {
              return connection.rollback(() => {
                  console.error('Rollback Error:', error);
                  res.status(500).send('Error resetting default payment');
              });
          }

          const updateQuery = 'UPDATE payments SET is_default = TRUE WHERE payment_id = ? AND user_id = ?';
          connection.query(updateQuery, [paymentId, userId], (error) => {
              if (error) {
                  return connection.rollback(() => {
                      console.error('Rollback Error:', error);
                      res.status(500).send('Error setting default payment');
                  });
              }

              connection.commit((err) => {
                  if (err) {
                      return connection.rollback(() => {
                          console.error('Commit Rollback Error:', err);
                          res.status(500).send('Error finalizing payment update');
                      });
                  }
                  res.send('Default payment method updated successfully');
              });
          });
      });
  });
});


const sendReceiptEmail = async (email, orderDetails, cartItems) => {
  const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: "surajbitla856@gmail.com",
        pass: "xsmtpsib-86bb5726d927cbefe740976d6053803a3aea6fbab13f45a5526608de136c9688-jIQm0GJA4wTFxUbs"
      }
  });

  const itemsHtml = cartItems.map(item => {
    const price = parseFloat(item.price);
    return `
        <tr>
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>$${price.toFixed(2)}</td>
            <td>$${((item.quantity * price) + (price* 0.10)).toFixed(2)}</td>
        </tr>`;
}).join('');

  const mailOptions = {
      from: 'surajbitla856@gmail.com',
      to: email,
      subject: 'Your Order Receipt from ShopRight',
      html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Thank you for your order!</h2>
          <p>Here are the details of your order:</p>
          <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse;">
              <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
              </tr>
              ${itemsHtml}
          </table>
          <h3>Order Summary:</h3>
          <p>Order Number: ${orderDetails.orderId}</p>
          <p>Total Price (Inclusive of tax): $${orderDetails.totalPrice.toFixed(2)}</p>
          <p>Shipping Address: ${orderDetails.shippingAddress}</p>
          <p>Payment Method: ${orderDetails.paymentMethod}</p>
          <p><a href="http://localhost:3000/login" style="background-color: #0046f4; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In</a></p>
          <p>If you have any questions or concerns about your order, please contact us at support@shopright.com.</p>
          <p>Thank you for shopping with ShopRight!</p>
      </div>
  `
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log('Order receipt sent to email!');
  } catch (error) {
      console.error('Error sending order receipt email:', error);
  }
}

const sendReceiptEmailToUser = (userId, orderId, cartItems, totalPrice, shippingAddressId, paymentMethodId) => {
  // Fetch user email and other necessary details
  const userEmailQuery = 'SELECT email FROM users WHERE id = ?';
  const shippingAddressQuery = 'SELECT address_line, city, state, postal_code FROM addresses WHERE address_id = ?';
  const paymentMethodQuery = 'SELECT card_number, card_type FROM payments WHERE payment_id = ?';

  // First, get the user's email
  connection.query(userEmailQuery, [userId], (userError, userResults) => {
      if (userError || userResults.length === 0) {
          console.error('Error retrieving user details:', userError);
          return;
      }
      const userEmail = userResults[0].email;

      // Next, get the shipping address
      connection.query(shippingAddressQuery, [shippingAddressId], (shippingError, shippingResults) => {
          if (shippingError || shippingResults.length === 0) {
              console.error('Error retrieving shipping details:', shippingError);
              return;
          }
          const shippingAddress = `${shippingResults[0].address_line}, ${shippingResults[0].city}, ${shippingResults[0].state}, ${shippingResults[0].postal_code}`;

          // Finally, get the payment method
          connection.query(paymentMethodQuery, [paymentMethodId], (paymentError, paymentResults) => {
              if (paymentError || paymentResults.length === 0) {
                  console.error('Error retrieving payment details:', paymentError);
                  return;
              }
              const paymentMethod = `${paymentResults[0].card_type} ending in ${paymentResults[0].card_number.substr(-4)}`;

              const orderDetails = {
                  orderId: orderId,
                  totalPrice: totalPrice,
                  shippingAddress: shippingAddress,
                  paymentMethod: paymentMethod
              };
              console.log(cartItems[0]);
              // Send the receipt email
              sendReceiptEmail(userEmail, orderDetails, cartItems).catch(emailError => {
                  console.error('Error sending receipt email:', emailError);
              });
          });
      });
  });
}



app.post('/place-order', (req, res) => {
  const { userId, totalPrice, shippingAddressId, paymentMethodId } = req.body;

  connection.beginTransaction((err) => {
    if (err) {
      console.error('Transaction Error:', err);
      return res.status(500).send('Internal server error');
    }

    // Step 1: Create a new order entry
    const createOrderQuery = `
        INSERT INTO orders (user_id, total_price, shipping_address_id, payment_method_id)
        VALUES (?, ?, ?, ?);
    `;
    connection.query(createOrderQuery, [userId, totalPrice, shippingAddressId, paymentMethodId], (error, orderResult) => {
      if (error) {
        return connection.rollback(() => {
          console.error('Error creating order:', error);
          res.status(500).send('Error creating order');
        });
      }

      const orderId = orderResult.insertId;

      // Step 2: Retrieve cart items
      //const selectCartItemsQuery = 'SELECT product_id, quantity, price FROM cart_items WHERE cart_id = (SELECT cart_id FROM carts WHERE user_id = ?)';
      const selectCartItemsQuery = `
                SELECT ci.product_id, ci.quantity, ci.price, p.description as product_name
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE cart_id = (SELECT cart_id FROM carts WHERE user_id = ?)
            `;
      connection.query(selectCartItemsQuery, [userId], (error, cartItems) => {
        if (error) {
          return connection.rollback(() => {
            console.error('Error retrieving cart items:', error);
            res.status(500).send('Error retrieving cart items');
          });
        }

        // Step 3: Insert cart items into order_items
        const orderItemsValues = cartItems.map(item => [orderId, item.product_id, item.quantity, item.price]);
        if (orderItemsValues.length > 0) {
          const insertOrderItemsQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
          connection.query(insertOrderItemsQuery, [orderItemsValues], (error) => {
            if (error) {
              return connection.rollback(() => {
                console.error('Error inserting order items:', error);
                res.status(500).send('Error inserting order items');
              });
            }

            // Step 4: Clear the user's cart
            const clearCartQuery = 'DELETE FROM cart_items WHERE cart_id = (SELECT cart_id FROM carts WHERE user_id = ?)';
            connection.query(clearCartQuery, [userId], (error) => {
              if (error) {
                return connection.rollback(() => {
                  console.error('Error clearing cart:', error);
                  res.status(500).send('Error clearing cart');
                });
              }

              // Commit the transaction
              connection.commit((commitErr) => {
                if (commitErr) {
                  console.error('Commit Error:', commitErr);
                  return connection.rollback(() => {
                    res.status(500).send('Error finalizing order placement');
                  });
                }
                sendReceiptEmailToUser(userId, orderId, cartItems, totalPrice, shippingAddressId, paymentMethodId);
                res.send('Order placed successfully');
              });
            });
          });
        } else {
          // If there are no items to insert, commit the transaction
          connection.commit((commitErr) => {
            if (commitErr) {
              console.error('Commit Error:', commitErr);
              return connection.rollback(() => {
                res.status(500).send('Error finalizing order placement');
              });
            }
            res.send('Order placed successfully');
          });
        }
      });
    });
  });
});



app.get('/orders/:userId', (req, res) => {
  const { userId } = req.params;

  // Adjusted query to include date fields
  const query = `
      SELECT o.order_id, o.total_price, DATE(oi.order_date) as order_date, DATE(oi.processed_date) as processed_date, 
            DATE(oi.shipped_date) as shipped_date, DATE(oi.out_for_delivery_date) as out_for_delivery_date, DATE(oi.delivered_date) as delivered_date, oi.status,
            DATE(oi.initiated_date) as initiated_date, DATE(oi.picked_up_date) as picked_up_date, DATE(oi.received_date) as received_date, oi.cancelled_status,
            DATE(oi.refund_issued_date) as refund_issued_date, DATE(oi.refund_credited_date) as refund_credited_date,
            oi.product_id, oi.quantity, oi.price, oi.order_item_id, p.description as product_name, p.image as product_image,
            a.address_line, a.city, a.state, a.postal_code,
            pa.card_number, pa.card_type
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN addresses a ON o.shipping_address_id = a.address_id
      JOIN payments pa ON o.payment_method_id = pa.payment_id
      WHERE o.user_id = ? order by o.order_id desc;
  `;

  connection.query(query, [userId], (error, results) => {
      if (error) {
          console.error('Error fetching orders:', error);
          return res.status(500).send('Internal server error');
      }
      // Format and send back the results
      // Note: Additional formatting may be needed to match the frontend structure
      res.json(results);
  });
});


//For Admin
// Fetch all users
app.get('/api/users', (req, res) => {
  const query = 'SELECT id, CONCAT(firstName, \' \', lastName) as name, email FROM users;';
  connection.query(query, (error, results) => {
      if (error) {
          console.error('Error fetching users:', error);
          return res.status(500).send('Internal server error');
      }
      res.json(results);
  });
});

// Fetch orders for a specific user
app.get('/api/orders/user/:userId', (req, res) => {
  const { userId } = req.params;
  const query = 'SELECT order_id FROM orders WHERE user_id = ?;';
  connection.query(query, [userId], (error, results) => {
      if (error) {
          console.error(`Error fetching orders for user ${userId}:`, error);
          return res.status(500).send('Internal server error');
      }
      res.json(results);
  });
});

// Fetch order items for a specific order
app.get('/api/order-items/:orderId', (req, res) => {
  const { orderId } = req.params;
  const query = 'SELECT order_item_id, product_id, quantity, status FROM order_items WHERE order_id = ?;';
  connection.query(query, [orderId], (error, results) => {
      if (error) {
          console.error(`Error fetching order items for order ${orderId}:`, error);
          return res.status(500).send('Internal server error');
      }
      res.json(results);
  });
});

app.post('/api/update-order-item', (req, res) => {
  const { orderItemId, newStatus, dateFields } = req.body;

  // Define status arrays
  const statusUpdates = ['Processed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const cancelledStatusUpdates = ['Picked Up', 'Received', 'Refund Issued', 'Refund Credited'];

  // Validate orderItemId and newStatus
  if (!orderItemId || !newStatus) {
    return res.status(400).send('Missing required fields');
  }

  // Prepare date updates
  let dateUpdates = Object.entries(dateFields).reduce((acc, [field, value]) => {
    if (value && ['processed_date', 'shipped_date', 'out_for_delivery_date', 'delivered_date','picked_up_date','received_date','refund_issued_date','refund_credited_date'].includes(field)) {
      acc.push(`${field} = ${connection.escape(value)}`);
    }
    return acc;
  }, []);

  let statusField = statusUpdates.includes(newStatus) ? 'status' : cancelledStatusUpdates.includes(newStatus) ? 'cancelled_status' : null;

  // If statusField is null, the status is not valid
  if (!statusField) {
    return res.status(400).send('Invalid status');
  }

  // Combine date update statements
  let dateUpdatesSql = dateUpdates.join(', ');
  let statusUpdateSql = `${statusField} = ${connection.escape(newStatus)}`;

  // Ensure there's at least one date field or status to update
  if (dateUpdatesSql.length === 0 && !statusUpdateSql) {
    return res.status(400).send('No valid fields provided for update');
  }

  // SQL Query
  let queryParts = [statusUpdateSql, ...dateUpdates].filter(part => part.length > 0);
  const query = `
      UPDATE order_items
      SET ${queryParts.join(', ')}
      WHERE order_item_id = ${connection.escape(orderItemId)};
  `;

  // Execute query
  connection.query(query, (error, results) => {
      if (error) {
          console.error('Error updating order item:', error);
          return res.status(500).send('Error updating order item');
      }
      res.send('Order item updated successfully');
  });
});


app.post('/cancel-order-item', (req, res) => {
  const { orderItemId } = req.body;

  connection.beginTransaction((err) => {
    if (err) {
      console.error('Transaction Error:', err);
      return res.status(500).send('Internal server error');
    }

    // Step 1: Check the current status of the order item
    const checkOrderItemStatusQuery = 'SELECT status FROM order_items WHERE order_item_id = ?';
    connection.query(checkOrderItemStatusQuery, [orderItemId], (error, orderItemResults) => {
      if (error) {
        return connection.rollback(() => {
          console.error('Error checking order item status:', error);
          res.status(500).send('Error checking order item status');
        });
      }

      if (orderItemResults.length === 0) {
        return res.status(404).send('Order item not found');
      }

      const currentItemStatus = orderItemResults[0].status;
      let newItemStatus = '';

      // Step 2: Determine the new status based on current status
      if (['Ordered', 'Processed', 'Shipped'].includes(currentItemStatus)) {
        newItemStatus = 'Cancelled Before Delivery';
      } else if (['Out for Delivery', 'Delivered'].includes(currentItemStatus)) {
        newItemStatus = 'Cancelled After Delivery';
      } else {
        return res.status(400).send('Order item cannot be cancelled at this stage');
      }

      // Step 3: Update the order item status and set the initiated_date
      const updateOrderItemStatusQuery = 'UPDATE order_items SET status = ?, initiated_date = NOW() WHERE order_item_id = ?;';

      connection.query(updateOrderItemStatusQuery, [newItemStatus, orderItemId], (error) => {
        if (error) {
          return connection.rollback(() => {
            console.error('Error updating order item status:', error);
            res.status(500).send('Error updating order item status');
          });
        }

        // Commit the transaction
        connection.commit((commitErr) => {
          if (commitErr) {
            console.error('Commit Error:', commitErr);
            return connection.rollback(() => {
              res.status(500).send('Error finalizing order item cancellation');
            });
          }
          res.send('Order item cancelled successfully');
        });
      });
    });
  });
});




app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

