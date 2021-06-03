require('dotenv').config();

const express = require('express');
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const CONNECTION_URL = process.env.MONGO_CONNECTION_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;

const app = express();
const port = 3000;

app.listen(port, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collectionButtonClicks = database.collection("button_clicks");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});

app.get('/', (req, res) => res.send('Hello World!'));



app.get('/products', (req,res) => {
    const products = [
        {
            id:1,
            name: "hammer",
        },
        {
            id:2,
            name: "screwdriver",
        },
        {
            id:3,
            name:"wrench",
        },
    ];
    res.json(products)
})

app.get('/products', (req,res) => {
    const products = [
        {
            id:1,
            name: "hammer",
        },
        {
            id:2,
            name: "screwdriver",
        },
        {
            id:3,
            name:"wrench",
        },
    ];
    res.json(products)
})