const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();


//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xlp2yoh.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const productsCollection = client.db("emaJohn").collection("products");

    app.get("/products", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      console.log(page, size);
      const query = {}
      const cursor = productsCollection.find(query);
      const products = await cursor.skip(page * size).limit(size).toArray();
      const count = await productsCollection.estimatedDocumentCount();
      res.send({ count, products });
    });

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
      res.send({ token })
    })

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const cursor = await productsCollection.findOne(query);
      res.send(cursor);
    })
  } finally {

  }
}
run().catch(error => console.error(error));

app.get('/', (req, res) => {
  res.send('This server is Running Perfectly...')
});

app.listen(port, (req, res) => {
  console.log(`This node server is Running on ${port}`);
});