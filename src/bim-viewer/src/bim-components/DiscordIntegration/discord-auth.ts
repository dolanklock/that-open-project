/* eslint-disable object-shorthand */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prettier/prettier */

// import express from 'express';
// import axios from 'axios';
// import qs from 'qs';

// const app = express();
// const port = 3000;

// // Replace these with your client ID and client secret
// const clientId = 'YOUR_CLIENT_ID';
// const clientSecret = 'YOUR_CLIENT_SECRET';
// const redirectUri = 'http://localhost:3000/callback';


// const Koa = require('koa')
// const Router = require('@koa/router')
// const knex = require('knex')
// const knexfile = require('./knexfile')


// Step 1: Redirect to Discord's OAuth2 authorization endpoint
// app.get('/login', (req, res) => {
//     const discordAuthUrl = 'https://discord.com/api/oauth2/authorize';
//     const scope = 'identify';

//     const authUrl = `${discordAuthUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
//     res.redirect(authUrl);
// });

// // Step 2: Handle the callback and exchange the code for an access token
// app.get('/callback', async (req, res) => {
//     const code = req.query.code as string;

//     if (!code) {
//         return res.status(400).send('No code provided');
//     }

//     try {
//         const tokenUrl = 'https://discord.com/api/oauth2/token';
//         const tokenData = {
//             client_id: clientId,
//             client_secret: clientSecret,
//             grant_type: 'authorization_code',
//             code: code,
//             redirect_uri: redirectUri,
//             scope: 'identify',
//         };

//         const response = await axios.post(tokenUrl, qs.stringify(tokenData), {
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//         });

//         const accessToken = response.data.access_token;
//         res.send(`Access Token: ${accessToken}`);
//     } catch (error) {
//         console.error('Error exchanging code for token:', error);
//         res.status(500).send('Error exchanging code for token');
//     }
// });

// app.listen(port, () => {
//     console.log(`Server is running at http://localhost:${port}`);
// });