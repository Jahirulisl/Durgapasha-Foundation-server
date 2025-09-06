const express = require('express');
const app = express();
const cors = require('cors')
//for .env import
require('dotenv').config();

const port = process.env.PORT || 3000;

//middlewares start >
app.use(cors());
app.use(express.json());

//for mongo cennect start

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i5ort.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//for mongo cennect end

//for menu data input in server start
const menuCellection = client.db("foundation").collection("menu");

       //data get
 app.get('/menu', async(req,res)=>{
  const result = await menuCellection.find().toArray();
  res.send(result);
 })
//for menu data input in server start

app.get('/', (req, res) => {
  res.send('foundation is sitting')
});

app.listen(port, () => {
  console.log(`fundation  is sitting on port ${port}`);
})