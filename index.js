'use strict';

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import contentful from 'contentful';
import contentfulManagament from 'contentful-management';
import { get } from 'http';

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
const clientManagement = contentfulManagament.createClient({
  accessToken: process.env.cmaToken ? process.env.cmaToken : credentials.cmaToken
});

app.use(express.static(`${__dirname}/views`)); // html
app.use(express.static(`${__dirname}/public`)); // js, css, images
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.set('view engine', 'ejs');


async function getAllDishes() {
  const entries = await client.getEntries({ 
    content_type: 'dish',
    'fields.userAnswered': false
    // 'sys.id[nin]': dishesCompleted.join(','),
  });
  return entries.items
}

async function getCountry(id="") {
  const entries = await client.getEntries({ 
    content_type: 'dish',
    'sys.id': id
  });
  return entries.items
}

async function checkCountry(countryInput="", id="") {
  const entries = await client.getEntries({ 
    content_type: 'dish',
    'sys.id': id,
    'fields.country': countryInput
    // 'query': countryInput
  });
  
  if(entries.total != 0) {

    const entryUpdated = await clientManagement.getSpace(process.env.space ? process.env.space : credentials.space)
      .then((space) => space.getEnvironment('master'))
      .then((environment) => environment.getEntry(id))
      .then((entry) => {
        entry.fields.userAnswered['en-US'] = true;
        // console.log('preupdate '+entry)
        return entry.update();
      })
      .then((entry) => { 
        // console.log('postupdate '+entry)
        entry.publish();
        return true;
      })
      .catch((err) => console.log(err));

    if(entryUpdated) {
      return true;
    } else {
      console.log('err entryUpdated')
    }
    
  } else {
    return false;
  }
}


// homepage 
app.get('/', async (req, res) => {
  if (res.statusCode === 200) {
    const data = await getAllDishes();
    if(data) {
      // get random dish from data array
      const randomIndex = Math.floor(Math.random() * data.length);
      const { tipOne, tipTwo, tipThree, image, name } = data[randomIndex].fields;
      const id = data[randomIndex].sys.id;
      const tips = [];
      tips.push(tipOne, tipTwo, tipThree);
      
      // get all countries from data array
      const selectList = data.map(x => x.fields.country);

      res.render('index', {
        name: name, 
        img: image, 
        id: id, 
        tips: tips,
        selectList: selectList
      });

    } else {
      res.render('index', {img: '', id: ''})
    }

  } else {
    res.sendStatus(404);
  }
});


app.post('/check-country', async (req, res) => {
  try {
    const { country, id } = req.body;
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

app.post('/get-country', async (req, res) => {
  try {
    const { id } = req.body;
    const response = await getCountry(id);
    console.log(response);
    if (response) {
      res.json({name: response[0].fields.name, country: response[0].fields.country})
      // res.send(true)
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

// app.get('/new-dish', async (req, res) => {
//   if (res.statusCode === 200) {
//     const data = await getAllDishes();
//     const randomIndex = Math.floor(Math.random() * data.length);
//     if(data.length > 0){
//       const img = data[randomIndex].fields.image;
//       const id = data[randomIndex].sys.id;
//       const name = data[randomIndex].fields.name;
//       res.render('index', {name: name, img: img, id: id})
//     } else {
//       res.send(false);
//     }

//   } else {
//     res.sendStatus(404);
//   }
// });