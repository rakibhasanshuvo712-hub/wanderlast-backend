import express from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import 'dotenv/config'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors())
app.use(express.json())

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

async function startServer() {
  try {
    await client.connect()
    console.log('You successfully connected to MongoDB!')
    const db = client.db('wanderlust')
    const destinationCollection = db.collection('destination')
    const bookingCollection = db.collection('bookings')

    app.post('/app-destination', async (req, res) => {
      try {
        const data = req.body
        const result = await destinationCollection.insertOne(data)
        console.log(result)
        console.log(data)
        res.send({ message: 'api working........' })
      } catch (err) {
        console.error(err)
        res.status(500).send({ message: 'error inserting data' })
      }
    })
    app.get('/destination', async (req, res) => {
      try {
        const result = await destinationCollection.find().toArray()
        res.send(result)
      } catch (err) {
        console.error(err)
        res.status(500).send({ message: 'error fetching destinations' })
      }
    })

    app.get('/app-destination', async (req, res) => {
      try {
        const result = await destinationCollection.find().toArray()
        res.send(result)
      } catch (err) {
        console.error(err)
        res.status(500).send({ message: 'error fetching destinations' })
      }
    })

    app.post('/app-destination/seed', async (req, res) => {
      try {
        const sampleData = [
          { name: 'Paris', country: 'France', description: 'City of light' },
          { name: 'Tokyo', country: 'Japan', description: 'Modern metropolis' },
          { name: 'New York', country: 'USA', description: 'The big apple' },
          { name: 'London', country: 'UK', description: 'Historic capital' },
          { name: 'Sydney', country: 'Australia', description: 'Harbor city' },
        ]
        const result = await destinationCollection.insertMany(sampleData)
        console.log('Seeded:', result)
        res.send({ message: 'Seeded successfully', insertedCount: result.insertedCount })
      } catch (err) {
        console.error(err)
        res.status(500).send({ message: 'error seeding data' })
      }
    })


    app.get('/destination/:id', async (req, res) => {
      try {
        const { id } = req.params
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: 'invalid id' })
        }
        const result = await destinationCollection.findOne({ _id: new ObjectId(id) })
        if (!result) {
          return res.status(404).send({ message: 'destination not found' })
        }
        res.send(result)
      } catch (err) {
        console.error(err)
        res.status(500).send({ message: 'error fetching destination' })
      }
    })

    app.patch('/destination/:id', async (req, res) => {
      try {
        const { id } = req.params
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: 'invalid id' })
        }
        const updatedData = req.body
        const result = await destinationCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        )
        if (result.matchedCount === 0) {
          return res.status(404).send({ message: 'destination not found' })
        }
        res.json(result)
      } catch (err) {
        console.error(err)
        res.status(500).send({ message: 'error updating destination' })
      }
    })

    app.delete('/destination/:id', async (req, res) => {
      try {
        const { id } = req.params
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: 'invalid id' })
        }
        const result = await destinationCollection.deleteOne({ _id: new ObjectId(id) })
        if (result.deletedCount === 0) {
          return res.status(404).send({ message: 'destination not found' })
        }
        res.json(result)
      } catch (err) {
        console.error(err)
        res.status(500).send({ message: 'error deleting destination' })
      }
    })
     app.post('/booking',async(req,res)=>{

const data=req.body
const result= await bookingCollection.insertOne(data)
res.send(result)
     })
     app.get('/my-bookings', async (req, res) => {
      try {
        const { email } = req.query
        const request = await bookingCollection.find({ email: email }).toArray()
        res.send(request)
      } catch (err) {
        console.error(err)
        res.status(500).send({ message: 'error fetching bookings' })
      }
    })
    app.get('/', (req, res) => {
      res.send({ message: 'server is fine!' })
    })

    app.listen(PORT, () => {
      console.log(`server is running at ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err)
    process.exit(1)
  }
}

startServer()
