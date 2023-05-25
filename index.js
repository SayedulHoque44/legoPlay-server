const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const cors = require('cors')
require('dotenv').config()
// PORT
const port = process.env.PORT || 5000

// midleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASS}@cluster0.501jhgk.mongodb.net/?retryWrites=true&w=majority`;

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
     client.connect();
    const allToysCollection = client.db("legoDb").collection("AllToys")

    app.get("/allToys",async(req,res)=>{
        
      const limit = parseInt(req.query.limit) || 10
      const toyName = req.query.name
      let query = {}
      if(toyName){
        query={name:toyName}
      }
      const cursor = allToysCollection.find(query).limit(limit)
      const result = await cursor.toArray();
      res.send(result)
    })

    // category
    app.get("/toys",async(req,res)=>{
        const limit = parseInt(req.query.limit) || 21
        const categoryName = req.query.category
        let query = {}
        if(categoryName){
            query ={category:categoryName}
        }
        
        const options = {
            // Include donly the `title` and `imdb` fields in each returned document
            projection: { _id: 1, picture: 1, name: 1,price:1,ratings:1 },
          };
          const cursor = allToysCollection.find(query,options).limit(limit)
      const result = await cursor.toArray();
      res.send(result)
    })

    // single Toy Find by id
    app.get("/toys/:id",async(req,res)=>{
        const id = req.params.id
        const query = {_id:new ObjectId(id)}
        const result = await allToysCollection.findOne(query)
        res.send(result)

    })

    // add a toy
    app.post("/toys",async(req,res)=>{
      const newToy = req.body
      const result = await allToysCollection.insertOne(newToy)
      res.send(result)
      // console.log(newToy)
    })
    // get all mytoys
    app.get("/myToys",async(req,res)=>{
      const email = req.query.email
      let query = {seller_email:email}
      // const sortValue = req.query.sortValue
      
      const sortValu = req.query.sortValue ? {price:parseInt(req.query.sortValue)} : {price:1}
      const cursor = allToysCollection.find(query).sort(sortValu)
      const result = await cursor.toArray();
      res.send(result)
    })
    
    // delete a toy
    app.delete("/myToys/:id",async(req,res)=>{
      id = req.params.id
      const query = {_id:new ObjectId(id)}
      
      const result = await allToysCollection.deleteOne(query)
      res.send(result)
    })

    // update toy
    app.put("/myToys/:id",async(req,res)=>{
      const updateToy = req.body
      const id = req.params.id
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name:updateToy.name ,
          picture:updateToy.picture ,
          category:updateToy.category ,
          seller_name:updateToy.seller_name ,
          seller_email:updateToy.seller_email ,
          price:updateToy.price ,
          ratings:updateToy.ratings ,
          available_quantity:updateToy.available_quantity ,
          details:updateToy.details ,
        },
      };
      // console.log(updateToy)
      const result = await allToysCollection.updateOne(filter, updateDoc, options);
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/",(req,res)=>{
    res.send("Lego Play is running")
})

app.listen(port,()=>{
    console.log(`Lego Play server running on port: ${port}`)
})