const express = require('express')
const cors = require('cors')
const {
    MongoClient
} = require('mongodb')

const app = express()
// app.use(express.urlencoded({
//     extended: true
// }))
app.use(express.json())
app.use(cors())

const port = 3000

const dbUrl = 'mongodb://localhost:27017'
const dbClient = new MongoClient(dbUrl)
const dbName = 'employee-management-db'
const dbCollectionName = 'employees'

async function connectToDb() {
    await dbClient.connect()
    console.log('Connected successfully to server')
    const db = dbClient.db(dbName)
    return db.collection(dbCollectionName)
}

async function getEmployees() {
    const collection = await connectToDb()
    return await collection.find({})
}

async function insertUpdateEmployee(req) {
    const collection = await connectToDb()
    const filter = {
        name: req.body.name
    };
    const options = {
        upsert: true
    };
    const updateDoc = {
        $set: {
            name: req.body.name,
            age: req.body.age,
            place: req.body.place
        }
    };
    return await collection.updateOne(filter, updateDoc, options);
}

async function deleteEmployee(req) {

    console.log('On Delete')
    console.log(req.body)

    const collection = await connectToDb()
    console.log("Collection : " + collection)
    const query = {
        name: req.body.name
    };
    return await collection.deleteOne(query);
}

app.post('/insertUpdate', async (req, res) => {

    console.log('On Insert Update')
    console.log(req.body)

    res.setHeader('Content-Type', 'application/json')
    //TODO : Use try catch mechnaism
    const insertionResult = await insertUpdateEmployee(req)
    console.log(
        `${insertionResult.matchedCount} document(s) matched the filter, updated ${insertionResult.modifiedCount} document(s)`,
    );
    if (insertionResult.upsertedCount > 0 || insertionResult.matchedCount > 0) {
        res.end(JSON.stringify({
            result: "success"
        }))
    } else {
        res.end(JSON.stringify({
            result: "failure"
        }))
    }
})

app.post('/delete', async (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    //TODO : Use try catch mechnaism
    const deletionResult = await deleteEmployee(req)
    if (deletionResult.deletedCount === 1) {
        res.end(JSON.stringify({
            result: "success"
        }))
    } else {
        res.end(JSON.stringify({
            result: "failure"
        }))
    }
})

app.get('/', async (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    //TODO : Use try-catch-finally mechnaism
    employeeCursor = await getEmployees()
    if ((await employeeCursor.count()) === 0) {
        res.end(JSON.stringify([]))
    } else {
        var employees = [];
        await employeeCursor.forEach((employee) => {
            employees.push(employee)
        });
        res.end(JSON.stringify(employees))
    }
})

app.listen(port, () => {
    console.log(`App. listening at http://localhost:${port}`)
})
