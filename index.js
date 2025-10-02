const express = require('express');
const app = express();
const cors = require('cors');
//make jswon token start paret 1
const jwt = require('jsonwebtoken');
//make jswon token end paret 1 note: upora const cors ar pora

//for .env import
require('dotenv').config();

const port = process.env.PORT || 3000;

//middlewares start >
app.use(cors());
app.use(express.json());

//for mongo cennect start

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    //for user collection start
    const userCollection = client.db("foundation").collection("users");
    //for menu collection start
    const menuCollection = client.db("foundation").collection("menu");
    //for review collection start
    const reviewCollection = client.db("foundation").collection("review");
    //for cart collection start
    const cartCollection = client.db("foundation").collection("cart");


    //for menu data input in server start
    //data get
    app.get('/menu', async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    })
    //for menu data input in server end

    //for review data input in server start
    //data get
    app.get('/review', async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })
    //for review data input in server end

    //for cart data collection start
    //carta data sent in client st
    app.get('/carts', async (req, res) => {
      const result = await cartCollection.find().toArray();
      res.send(result);
    })
    //carts celloction post api
    app.post('/carts', async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    })
    //for cart data collection end

    //for make user data collection and store api start
    //for api
    app.post('/users', async (req, res) => {
      const user = req.body;

      //you can do this many ways (1.email uniqe,2.upsert, 3.simple checking) str
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ messege: 'user already exists', insertedId: null })
      }
      //you can do this many ways (1.email uniqe,2.upsert, 3.simple checking)end

      const result = await userCollection.insertOne(user);
      res.send(result);
    })
    //for make user data collection store api end


    //for user get api end
    //make middle weres for varify token start
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }
    //make middle weres for verify token end

    //use verify admin after verify token start 
   const verifyAdmin = async(req, res, next)=>{
    const email = req.decoded.email;
    const query = {email:email};
    const user = await userCollection.findOne(query);
    const isAdmin = user?.role === 'admin';
    if(!isAdmin){
      return res.status(403).send({message: 'forbidden access'});
    }
    next();
   }
   //use verify admin after verify token end 

    //for user get api start
    app.get('/users', verifyToken,verifyAdmin, async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    //for get user admin api start>
    app.get('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;

      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })
    //for get user admin api end>


    //make user admin start
    app.patch('/users/admin/:id',verifyToken,verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updateDoc)
      res.send(result);
    })
    //make user admin end
    
    //for user delete api start
    app.delete('/users/:id',verifyToken,verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })
    //for user delete api end

    //fro make cart delete api start>
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    })
    //fro make delete api end>

    //for jwt token api start 2
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      res.send({ token });
    })
    //for jwt token api end 2

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

app.get('/', (req, res) => {
  res.send('foundation is sitting')
});

app.listen(port, () => {
  console.log(`fundation  is sitting on port ${port}`);
})