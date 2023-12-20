'use strict';

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = process.env.PORT || 8081;

let credentials;
if (fs.existsSync('./credentials.json')) {
  credentials = require('./credentials.json');
}
// const SPACE_ID = process.env.SPACE_ID ? process.env.SPACE_ID : credentials.SPACE_ID;

app.use(express.static(`${__dirname}/views`)); // html
app.use(express.static(`${__dirname}/public`)); // js, css, images
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.set('view engine', 'ejs');

const openai = new OpenAI({
    apiKey: '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',
});


// async function getWork() {
//   const entries = await client.getEntries({ content_type: 'work' })
//   return entries.items
// }

// const chatCompletion = await openai.chat.completions.create({
//     messages: [{ role: "user", content: "Say this is a test" }],
//     model: "gpt-3.5-turbo",
// });


app.get('/', (req, res) => {
  if (res.statusCode === 200) {
    res.render('index.html')
    // res.sendFile('/views/index.html', {
    //   root: __dirname
    // });
  } else {
    res.sendStatus(404);
  }
});


app.post('/chat-gpt', async (req, res) => {
  try {
    const { country } = req.body;
    console.log('Received request:', country);


    // const stream = openai.beta.chat.completions.stream({
    //   model: 'gpt-3.5-turbo',
    //   stream: true,
    //   messages: [{ role: 'user', content: req.body }],
    // });

    // res.header('Content-Type', 'text/plain');
    // for await (const chunk of stream.toReadableStream()) {
    //   res.write(chunk);
    // }

    // res.end();
  } catch (e) {
    console.error(e);
  }
});




app.listen(port, () => {
  console.log(`Connected to server at port ${port}`);
});
