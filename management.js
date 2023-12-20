
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import contentful from 'contentful';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = process.env.PORT || 8081;

let credentials;
if (fs.existsSync('./credentials.json')) {
  credentials = JSON.parse(fs.readFileSync('./credentials.json'));
}

// TODO: set completed checkbox field here on this ID's Dish?
console.log(id)
const entry = await client.getEntry(id);
entry.fields.userAnswered = true;
entry.update();
// .then((entry) => {
//   console.log({entry})
//   entry.fields.userAnswered = true;
//   return entry.update()
// })
// .then((entry) => console.log(`Entry ${entry.sys.id} updated.`))
// .catch(console.error)


const contentfulManagament = require('contentful-management')

const clientManagement = contentfulManagament.createClient({
  space: process.env.space ? process.env.space : credentials.space,
  accessToken: process.env.accessToken ? process.env.accessToken : credentials.accessToken
})
clientManagement.getEntry('<entry_id>')
.then((entry) => {
  entry.fields.title['en-US'] = 'New entry title'
  return entry.update()
})
.then((entry) => console.log(`Entry ${entry.sys.id} updated.`))
.catch(console.error)
// Update entry
// clientManagement.getSpace('<space_id>')
// .then((space) => space.getEnvironment('<environment-id>'))
// .then((environment) => 
