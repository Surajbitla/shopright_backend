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
    max: 5, // limit to 5 requests per windowMs
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
            user: "surajbitla856@gmail.com",
            pass: "xsmtpsib-86bb5726d927cbefe740976d6053803a3aea6fbab13f45a5526608de136c9688-3gpAzVrGZDcwbSFB"
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

app.post('/login',loginLimiter, (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT password, is_temp_password FROM users WHERE email = ?';
    connection.query(query, [email], async (error, results) => {
      if (error) {
        console.error("Error fetching user:", error);
        return res.status(500).send("Internal server error");
      }
  
      if (results.length === 0) {
        return res.status(401).send("No user found with this email");
      }
  
      // Compare provided password with stored hashed password
      const isTempPassword = results[0].is_temp_password === 1; // MySQL might return this as a number
      const isPasswordCorrect = await bcrypt.compare(password, results[0].password);
      if (!isPasswordCorrect) {
        return res.status(401).send("Incorrect password");
      }
      res.json({ message: "Logged in successfully", isTempPassword });
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




app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

