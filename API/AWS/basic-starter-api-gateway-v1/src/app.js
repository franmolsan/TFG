const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const { getCurrentInvoke } = require('@vendia/serverless-express')
const ejs = require('ejs').__express
const app = express()


const MongoClient = require("mongodb").MongoClient;
const CONNECTION_URL = "mongodb+srv://admin:cjlnQkcojogSotoS@cluster0.gzt07.mongodb.net/buttons?retryWrites=true&w=majority" //process.env.MONGO_CONNECTION_URL;
const DATABASE_NAME = "buttons" //process.env.DATABASE_NAME;

app.set('view engine', 'ejs')
app.engine('.ejs', ejs)

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

const router = express.Router()
router.use(compression())

router.use(cors())

// NOTE: tests can't find the views directory without this
app.set('views', path.join(__dirname, 'views'))

router.get('/', (req, res) => {
  const currentInvoke = getCurrentInvoke()
  const { event = {} } = currentInvoke
  const {
    requestContext = {},
    multiValueHeaders = {}
  } = event
  const { stage = '' } = requestContext
  const {
    Host = ['localhost:3000']
  } = multiValueHeaders
  const apiUrl = `https://${Host[0]}/${stage}`
  res.render('index', {
    apiUrl,
    stage
  })
})

router.get('/vendia', (req, res) => {
  res.sendFile(path.join(__dirname, 'vendia-logo.png'))
})

router.get('/users', (req, res) => {
  res.json(users)
})

router.get('/users/:userId', (req, res) => {
  const user = getUser(req.params.userId)

  if (!user) return res.status(404).json({})

  return res.json(user)
})

router.post('/users', (req, res) => {
  const user = {
    id: ++userIdCounter,
    name: req.body.name
  }
  users.push(user)
  res.status(201).json(user)
})

router.put('/users/:userId', (req, res) => {
  const user = getUser(req.params.userId)

  if (!user) return res.status(404).json({})

  user.name = req.body.name
  res.json(user)
})

router.delete('/users/:userId', (req, res) => {
  const userIndex = getUserIndex(req.params.userId)

  if (userIndex === -1) return res.status(404).json({})

  users.splice(userIndex, 1)
  res.json(users)
})

router.get('/cookie', (req, res) => {
  res.cookie('Foo', 'bar')
  res.cookie('Fizz', 'buzz')
  res.json({})
})

const getUser = (userId) => users.find(u => u.id === parseInt(userId))
const getUserIndex = (userId) => users.findIndex(u => u.id === parseInt(userId))

// Ephemeral in-memory data store
const users = [{
  id: 1,
  name: 'Joe'
}, {
  id: 2,
  name: 'Jane'
}]
let userIdCounter = users.length

MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
  if(error) {
      throw error;
  }
  database = client.db(DATABASE_NAME);
  collectionButtonClicks = database.collection("button_clicks");
  collectionQR = database.collection("qr");
  console.log("Connected to `" + DATABASE_NAME + "`!");
});

router.get('/', (req, res) => res.send('Hello World!'));


router.get("/get-button-clicks/:id", (request, response) => {

  var buttonID = request.params.id;
  console.log(buttonID)
  
  collectionButtonClicks.findOne({"buttonID": buttonID}, (error, result) => {
      if (error) {
          return response.status(500).send(error);
      }
      if (result == null) {
          response.send("Ese botón no ha sido encontrado");
      }
      else {
          response.send(result);
      }
  });

});

router.get("/get-button-clicks/:id/type/:clickType", (request, response) => {

  var buttonID = request.params.id;
  var clickType = request.params.clickType;
  console.log(buttonID + " " + clickType)

  collectionButtonClicks.findOne({"buttonID": buttonID},{projection: {[clickType]:1, _id:0}} , (error, result) => {
      if (error) {
          return response.status(500).send(error);
      }
      if (result == null) {
          response.send("Ese botón no ha sido encontrado");
      }
      else {
          //console.log(result[clickType])
          response.send(result);
      }
  });

});

router.post("/button-click", (request, response) => {

  var clickType = request.body.clickType;

  console.log(clickType)
  
  collectionButtonClicks.updateOne({ "serialNumber":request.body.serialNumber }, {$inc: { [clickType] : 1} }, (error, result) => {
      if (error) {
          return response.status(500).send(error);
      }
      if (result == null) {
          response.send("No se pudo incrementar correctamente");
      }
      else {
          response.send("Incremento correcto del botón " + request.body.serialNumber + " en click tipo " + clickType);
      }
  });

});

router.post("/qr-read", (request, response) => {

  var qrID = request.body.qrID;

  console.log("lectura qr " + qrID)
  
  collectionQR.updateOne({ "qrID":request.body.qrID }, { $inc: { "timesRead": 1 } }, (error, result) => {
      if (error) {
          return response.status(500).send(error);
      }
      if (result == null) {
          response.send("No se pudo incrementar correctamente");
      }
      else {
          response.send("Incremento correcto");
      }
  });

});


router.get("/get-qr-read/:id", (request, response) => {

  var qrID = request.params.id;
  console.log(qrID)
  
  collectionQR.findOne({"qrID": qrID}, {projection: {"timesRead":1, _id:0}}, (error, result) => {
      if (error) {
          return response.status(500).send(error);
      }
      if (result == null) {
          response.send("Ese botón no ha sido encontrado");
      }
      else {
          response.send(result);
      }
  });

});


// The serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use('/', router)

// Export your express server so you can import it in the lambda function.
module.exports = app
