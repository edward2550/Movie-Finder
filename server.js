const express = require('express')
const app = express()
const cors = require('cors')
const {MongoClient, ObjectId} = require('mongodb')
const { response } = require('express')
require('dotenv').config()
const PORT = 8000
 

let db,
dbConnectionStr= process.env.DB_STRING,
dbName = 'sample_mflix',
collection

MongoClient.connect(dbConnectionStr)
    .then(client => {
        console.log('connected to DB')
        db = client.db(dbName)
        collection = db.collection('movies')
    })


app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cors())


app.get('/search',async(req,res) =>{
    try{
        let result = await collection.aggregate([{
            "$Search" : {
                "autocomplete" : {
                    "query":`${req.query.query}`,
                    "path": "title",
                    "fizzy": {
                        "maxEdits":2,
                        "prefixLength": 3
                    }
                }
            }
        }]).toArray()
        res.send(result)
    } catch(error) {
        res.status(500).send({message: error.message})
    }
})

app.get("/get/:id", async(req, res) =>{
    try{
        let result = await collection.findOne({
            "_id" : ObjectId(req.params.id)
        })
        res.send(result)
    }catch(error) {
        res.status(500).send({message: error.message})
    }
})



app.listen(process.env.PORT || PORT, () =>{
    console.log('server is running on port')
})