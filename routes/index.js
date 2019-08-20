/* eslint-disable no-undef */
// Importing Modules
const express = require("express");
const router = express.Router();
const ipfsClient = require('ipfs-http-client');
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const nodemailer = require("nodemailer");
const Buffer = require('buffer').Buffer;
const exec = require('child_process').exec;

// connect to ipfs daemon API server
const ipfs = ipfsClient("localhost", 5001, {
	protocol: "http"
});

// Accessing dot env file
const dotenv = require('dotenv');
dotenv.config();

// Importing simple-encryptor module
const encryptor = require('simple-encryptor')(process.env.KEY);

// Get request
router.get('/', function(req, res) {
    res.render('register', { title: 'Express' });
});

// POST request
router.post('/', upload.single("file"), (req, res) => {

    // Fetching data from body
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var appURL = req.body.appURL;
    var appName = req.body.appName;
    var phoneNumber = req.body.phoneNumber;
    var address = req.body.address;
    var fileHash;

    var info = {
        "firstName" : firstName,
        "lastName" : lastName,
        "email" : email,
        "appURL" : appURL,
        "appName" : appName,
        "phoneNumber": phoneNumber,
        "address" : address,
        "fileHash" : fileHash
    }

    // Read Card
    const file = fs.readFileSync(req.file.path);

    // IPFS add function call
    ipfs.add(file, (err, fileHash) => {
        if(err) {
            let error = new Error(err);

            // Json respose if something went wrong
            res.status(500).json({
                success: false,
                result: error.message
            });
            return;
        }

        // Unlink File from local storage
        fs.unlinkSync(req.file.path);

        // File Hash
        info.fileHash = fileHash[0].hash;

        // In String
        infoString = JSON.stringify(info);

        // Encrypt data string
        var encryptedInfo = encryptor.encrypt(infoString);

        // Convert to buffer
        infoString = Buffer(encryptedInfo);

        // IPFS add function call
        ipfs.add(infoString, async(err, hash) => {
            if(err) {
                let error = new Error(err);

                // Json respose if something went wrong
                res.status(500).json({
                    success: false,
                    result: error.message
                });
                return;
            }

            // Email address of receiver
            var receiver = process.env.ADMIN_EMAIL;

            // HTML body for Unsuccesful Buy
            var htmlBody = '<div style="background: #FAFAFA; text-align: center; margin-top: 30px; margin-bottom: 20px; margin-left: auto; margin-right: auto; padding-top: 10px; padding-bottom: 10px; max-width: 500px; max-height: 800px; background: #FFFFFF; border: 5px solid; border-radius: 10px; border-color: rgb(236, 220, 237, 0.8); font-family: Montserrat,sans-serif;"> <img style="max-width: 400px; max-height: 400px;" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBkX8PbXd_j6sVlVDwIZYrgnVzD2F9-VgiZ22G7Ch51XemgT6i"/> <br><br> Hey, New user has submitted the form.<br> Please click the below link to check his details. <br><br> IPFS Link: <href>http://' + process.env.RPC_ADDR +':3000/hash/' + hash[0].hash + '</href></div>'

            // Subject for Email
            var subject = "User Data";

            // SendMail function call
            await sendMail(receiver, subject, htmlBody, null);

            // Render succesfully submitted detail
            res.render('success', hash[0]);
        });
    });
});

// GET request
router.get('/hash/:ipfsHash', (req, res) => {

    // Parse data from body
    var ipfsHash = req.params.ipfsHash;

    // IPFS get request for fetching data
    ipfs.get(ipfsHash, (err, data) => {
        if(err) {
            let error = new Error(err);

            // Json respose if something went wrong
            res.status(400).json({
                success: false,
                result: error.message
            });
            return;
        }

        // Convert buffer to string
        var encryptedInfo = (data[0].content).toString('utf8');

        // Decrypt information
        var decryptedInfo = encryptor.decrypt(encryptedInfo);

        // Parse into JSON object
        var info = JSON.parse(decryptedInfo);

        // IPFS get request
        ipfs.get(info.fileHash, (err, file) => {
            if(err) {
                let error = new Error(err);

                // Json respose if something went wrong
                res.status(400).json({
                    success: false,
                    result: error.message
                });
                return;
            }

            // info.fileHash = (file[0].content).toString('base64');
            info.fileHash = file[0].content.toString("base64");

            res.render('index', info);
        });
    });
});

router.post('/approve', async(req, res) => {
    var appURL = req.body.appURL;
    var username = req.body.username;
    var email = req.body.email;

    // Extract IP address from app url
    var ipAddress = appURL.split('/')[2].split(':')[0];

    // UfW command for allowing specific IP
    command = 'echo ' + process.env.CMD_PASSWORD + ' | sudo -S ufw allow from ' + ipAddress + ' to any port ' + process.env.RPC_PORT;
    // command =  'sudo ufw allow from ' + ipAddress + ' to any port ' + process.env.RPC_PORT;         //for instance only

    // Execute CMD Command
    exec(command, async(err, stdout, stderr) => {
        if (err) {
            console.log("node couldn't execute the command");
            return;
        }

        // the *entire* stdout and stderr (buffered)
        console.log(stdout);

        if(stderr){
            console.log("stderr", stderr);
        }

        // Email address of receiver
        var receiver = email;

        // HTML body for Unsuccesful Buy
        var htmlBody = '<div style="background: #FAFAFA; text-align: center; margin-top: 30px; margin-bottom: 20px; margin-left: auto; margin-right: auto; padding-top: 10px; padding-bottom: 10px; max-width: 500px; max-height: 800px; background: #FFFFFF; border: 5px solid; border-radius: 10px; border-color: rgb(236, 220, 237, 0.8); font-family: Montserrat,sans-serif;"> <img style="max-width: 400px; max-height: 400px;" src="https://d1yn1kh78jj1rr.cloudfront.net/image/preview/SzRtaULgXji47u65o/storyblocks-grunge-blue-accepted-word-round-rubber-seal-stamp-on-white-background_BMUjEAUHV_SB_PM.jpg"/> <br><br> Hey '
                        + username +  ', <br><br> Congratulations!! Your application has been accepted.<br> You can now use our RPC at http://' + process.env.RPC_ADDR + ':' + process.env.RPC_PORT + '.</div>'

        // Subject for Email
        var subject = "Application accepted for RPC connection";

        // SendMail function call
        await sendMail(receiver, subject, htmlBody, null);

        fs.appendFile('trustedIP.txt', '\n'+ipAddress, function (err) {
            if (err) throw err;
            console.log('File Saved!');
        });

        res.json({
            success: true,
            result: stdout
        })
    });
});

router.post('/reject', async(req, res) => {
    var username = req.body.username;
    var email = req.body.email;

    // Email address of receiver
    var receiver = email;

    // HTML body for Unsuccesful Buy
    var htmlBody = '<div style="background: #FAFAFA; text-align: center; margin-top: 30px; margin-bottom: 20px; margin-left: auto; margin-right: auto; padding-top: 10px; padding-bottom: 10px; max-width: 500px; max-height: 800px; background: #FFFFFF; border: 5px solid; border-radius: 10px; border-color: rgb(236, 220, 237, 0.8); font-family: Montserrat,sans-serif;"> <img style="max-width: 400px; max-height: 400px;" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiGdbhZRGLQs3W3kAmBstCDi_msTQm2d-lUsfLp4dERL9iKxii2A"/> <br><br> Hey ' + username +  ', <br><br> Sorry!! Your application has been rejected.</div>'

    // Subject for Email
    var subject = "Application rejected for RPC connection";

    // SendMail function call
    await sendMail(receiver, subject, htmlBody, null);

    res.json({
        success: true,
        result: subject
    })
});

function sendMail(receiverList, subject, htmlBody, attachments) {
    return new Promise((resolve, reject) => {
        nodemailer.createTestAccount(() => {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: process.env.HOST,
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.ACCOUNT,
                    pass: process.env.PASSWORD,
                },
            });

            // setup email data with unicode symbols
            let mailOptions = {
                from: "RPC Secure" + process.env.ACCOUNT, // sender address
                to: receiverList, // list of receivers
                subject: subject, // Subject line
                text: "", // plain text body
                html: htmlBody,
                attachments: attachments
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    reject(err);
                }
                console.log(info)
                resolve("Message sent: %s", info.messageId);
                console.log("Mail Sent Succesfully !!")
            });
        });
    });
}

module.exports = router;
