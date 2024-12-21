const nodemailer = require('nodemailer');
const axios = require('axios');

const SMTP_HOST = process.env.MAILCRAB_SMTP_HOST || 'localhost';
const SMTP_PORT = process.env.MAILCRAB_SMTP_PORT || 1025;
const API_BASE_URL = `http://${SMTP_HOST}:1080/api`;

console.log('Using configuration:', {
    SMTP_HOST,
    SMTP_PORT,
    API_BASE_URL
  });
  

// Create email transporter
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false
});

// Function to send email
async function sendEmail(toEmail) {
    const mailOptions = {
        from: 'test@example.com',
        to: toEmail,
        subject: 'Test Email',
        text: 'testKey: testValue123' // Key-value pair for testing
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

// Function to wait for specified time
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to get emails from MailCrab
async function getEmails() {
    try {
        const response = await axios.get(`${API_BASE_URL}/messages`);
        return response.data;
    } catch (error) {
        console.error('Error getting emails:', error);
        throw error;
    }
}

// Function to get specific email content
async function getEmailContent(emailId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/message/${emailId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting email content:', error);
        throw error;
    }
}

// Function to extract key-value pair from email text
function extractKeyValue(text) {
    const match = text.match(/(\w+):\s*(.+)/);
    if (match) {
        return {
            key: match[1],
            value: match[2]
        };
    }
    return null;
}

// Main execution function
async function runTest() {
    try {
        // Send email
        const testEmail = 'recipient@example.com';
        await sendEmail(testEmail);

        // Wait for email to be processed
        console.log('Waiting for email to be processed...');
        await wait(3000);

        // Get all emails
        const emails = await getEmails();
        
        if (emails.length === 0) {
            console.log('No emails found');
            process.exit(1);
        }

        // Get the latest email
        const latestEmail = emails[emails.length - 1];
        
        // Get full email content
        const emailContent = await getEmailContent(latestEmail.id);
        
        // Extract and log key-value pair
        const keyValue = extractKeyValue(emailContent.text);
        if (keyValue) {
            console.log('Found key-value pair:');
            console.log(`Key: ${keyValue.key}`);
            console.log(`Value: ${keyValue.value}`);
            process.exit(0);
        } else {
            console.log('No key-value pair found in email');
            process.exit(1);
        }

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

// Run the test
runTest();
