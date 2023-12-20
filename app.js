'use strict';

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import contentful from 'contentful';
import contentfulManagament from 'contentful-management';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = process.env.PORT || 8081;

let credentials;
if (fs.existsSync('./credentials.json')) {
  credentials = JSON.parse(fs.readFileSync('./credentials.json'));
}

// connect to contentful
const client = contentful.createClient({
  space: process.env.space ? process.env.space : credentials.space,
  accessToken: process.env.accessToken ? process.env.accessToken : credentials.accessToken
});

// connect to contentful management
// const clientManagement = contentfulManagament.createClient(  
//   {
//     // This is the access token for this space. Normally you get the token in the Contentful web app
//     accessToken: process.env.cmaToken ? process.env.cmaToken : credentials.cmaToken,
//   },
//   {
//     type: 'plain',
//     defaults: {
//       spaceId: process.env.space ? process.env.space : credentials.space,
//       environmentId: 'master',
//     },
//   }
// );

const clientManagement = contentfulManagament.createClient({
  accessToken: process.env.cmaToken ? process.env.cmaToken : credentials.cmaToken
});
const space = await clientManagement.getSpace(credentials.space);

app.use(express.static(`${__dirname}/views`)); // html
app.use(express.static(`${__dirname}/public`)); // js, css, images
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.set('view engine', 'ejs');


async function getRandomDish() {
  const entries = await client.getEntries({ 
    content_type: 'dish',
    'fields.userAnswered': false
    // 'sys.id[nin]': dishesCompleted.join(','),
  });
  return entries.items
}

async function checkCountry(countryInput="", id="") {
  const entries = await client.getEntries({ 
    content_type: 'dish',
    'sys.id': id,
    'query': countryInput
  });
  
  if(entries.total != 0) {

    // TODO: call management
    console.log(space)
    space.getEntry(id)
    .then(async (entry) => {
      console.log('entry.fields before', entry)
      entry.fields.userAnswered['en-US'] = true;
      console.log('entry.fields after', entry.fields)
      return entry.update();
      // return await clientManagement.entry.update({entryId: id})
    })
    .then((res) => console.log(`entry ${res.sys.id} updated.`))
    .catch(console.error)

    
    return true;
  } else {
    return false;
  }
}


// homepage 
app.get('/', async (req, res) => {
  if (res.statusCode === 200) {
    const data = await getRandomDish();
    console.log(data);
    if(data) {
      const randomIndex = Math.floor(Math.random() * data.length);
      const img = data[randomIndex].fields.image;
      const id = data[randomIndex].sys.id;

      // TODO: send tips
      res.render('index', {img: img, id: id})
    } else {
      res.render('index', {img: '', id: ''})
    }

  } else {
    res.sendStatus(404);
  }
});

app.get('/new-dish', async (req, res) => {
  if (res.statusCode === 200) {
    const data = await getRandomDish();
    const randomIndex = Math.floor(Math.random() * data.length);
    // console.log(randomIndex);
    // console.log('new dish', data)
    if(data.length > 0){
      const img = data[randomIndex].fields.image;
      const id = data[randomIndex].sys.id;
      res.json({img: img, id: id})
    } else {
      res.send(false);
    }

  } else {
    res.sendStatus(404);
  }
});

app.post('/check-country', async (req, res) => {
  try {
    const { country, id } = req.body;
    console.log('Received request:', country);
    const response = await checkCountry(country, id);
    if (response) {
      res.send(true)
    } else {
      res.send(false)
    }

  } catch (e) {
    console.error(e);
  }
});



app.listen(port, () => {
  console.log(`Connected to server at port ${port}`);
});



// const capitlizeFirstLetter = (word) => {
//   const firstLetter = word.charAt(0);
//   const firstLetterCap = firstLetter.toUpperCase();
//   const remainingLetters = word.slice(1);
//   const capitalizedWord = firstLetterCap + remainingLetters;
//   return capitalizedWord;
// }

// async function checkCountryTest(countryInput="", id="") {
//   // const country = capitlizeFirstLetter(countryInput)
//   // console.log(countryInput);
//   const entries = await client.getEntries({ 
//     content_type: 'dish',
//     'sys.id': id,
//     'query': countryInput
//     // 'fields.country': country
//   });

//   if(entries.total != 0) {
//     return true;
//   } else {
//     return false;
//   }
// }
