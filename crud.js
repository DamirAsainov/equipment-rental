const { MongoClient, ObjectId, ServerApiVersion} = require('mongodb');
// const url = 'mongodb://localhost:27017';
const url = "mongodb+srv://damirasainov:y6UH2PG11MUYGg0w@sktst-rental.6stklnx.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const dbName = 'myProject';


const getAllCategories = async () => {
    try{
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('categories');
        const documents = await collection.find({}).toArray();
        return documents;
        // const titlesArray = documents.map(document => document.title);
        // return titlesArray;
    } catch (error){
        console.error("Get All Categories Error:",error);
        return null;
    } finally {
        await client.close;
    }
}
const getAllCategoriesWithImg = async () => {
    try{
        await client.connect();
        const db = client.db(dbName);
        let collection = db.collection('categories');
        const documents = await collection.find({}).toArray();
        collection = db.collection('images')
        for (const doc of documents) {
            doc.image = await collection.findOne({_id: doc.imageID});
        }
        return  documents;
    } catch (error){
        console.error("Get All Categories Error:",error);
        return null;
    } finally {
        await client.close;
    }
}
const getAllCategoriesWithEquip = async () =>{
    try{
        await client.connect();
        const db = client.db(dbName);
        let collection = db.collection('categories');
        const documents = await collection.find({}).toArray();
        collection = db.collection('equipments');
        for(const doc of documents){
            doc.equip = await collection.find({category: doc.title}).toArray();
        }
        return documents;
    } catch (error){
        console.error("Get all categories with equipments error", error);
    } finally {
        await client.close();
    }
}
async function addEquip(req, res){
    try{
        await client.connect();
        const database = client.db(dbName);
        let collection = database.collection('images');
        const result = await collection.insertOne({
            filename: req.file.filename,
            path: req.file.path
        });

        console.log(`File uploaded with ID: ${result.insertedId}`);
        console.log(req.body.productName);

        collection = database.collection('equipments');
        await collection.insertOne({
            productName: req.body.productName,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            category: req.body.category,
            imageID: result.insertedId,
            imagePath: req.file.path
        })
        res.send('File uploaded successfully!');
    } catch (error){
        console.error('Error uploading file', error);
        res.status(500).send('Error uploading file.');
    } finally {
        await client.close();
    }
}
async function addCategory(req,res){
    try{
        await client.connect();
        const database = client.db(dbName);
        let collection = database.collection('images');

        const result = await collection.insertOne({
            filename: req.file.filename,
            path: req.file.path
        });
        collection = database.collection('categories')
        await collection.insertOne({
            title: req.body.categoryTitle,
            imageID: result.insertedId
        });
        console.log(`Category add with ID: ${result.insertedId}`);
        res.json({message: "Category successfully added"});
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).send('Error adding category.');
    } finally {
        await client.close();
    }
}
async function getEquip(id){
    try{
        await client.connect();
        const db = client.db(dbName);
        let collection = db.collection('equipments');
        const document = await collection.findOne({_id: new ObjectId(id)});
        return document;
    }catch (error){
        console.error(error);
        return null;
    }finally {
        await client.close();
    }
}

async function getUser(id){
    try{
        await client.connect();
        const db = client.db(dbName);
        let collection = db.collection('users');
        return await collection.findOne({_id: new ObjectId(id)});
    }catch (error){
        console.error(error);
        return null;
    }finally {
        await client.close();
    }
}
async function searchEquip(query, page){
    try{
        let limit = 6;
        let skip = (page - 1) * limit
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('equipments');

        return await collection.find({
            $or: [
                { productName: { $regex: query, $options: 'i' } }, // Case-insensitive search for equipment name
                { description: { $regex: query, $options: 'i' } } // Case-insensitive search for equipment description
            ]
        }).skip(skip).limit(limit).toArray();
    } catch (e){
        console.error(e);
        return null;
    }
}
async function queryLen(query){
    try{
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('equipments');
        const equips =  await collection.find({
            $or: [
                { productName: { $regex: query, $options: 'i' } }, // Case-insensitive search for equipment name
                { description: { $regex: query, $options: 'i' } } // Case-insensitive search for equipment description
            ]
        }).toArray();
        return equips.length;
    } catch (e){
        console.error(e);
        return 0;
    }
}

async function updateEquip(req, res) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection('equipments');
        const equipId = req.params.id;
        const updateFields = {
            $set: {
                productName: req.body.productName,
                description: req.body.description,
                price: req.body.price,
                quantity: req.body.quantity,
                category: req.body.category,
            }
        };
        const result = await collection.updateOne({ _id: ObjectId(equipId) }, updateFields);

        if (result.modifiedCount === 1) {
            res.send('Equipment updated successfully!');
        } else {
            res.status(404).send('Equipment not found or no changes were made.');
        }
    } catch (error) {
        console.error('Error updating equipment:', error);
        res.status(500).send('Error updating equipment.');
    } finally {
        // Close the database connection
        await client.close();
    }
}
async function deleteEquip(req, res) {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection('equipments');
        const equipId = req.params.id;
        const result = await collection.deleteOne({ _id: ObjectId(equipId) });

        if (result.deletedCount === 1) {
            res.send('Equipment deleted successfully!');
        } else {
            res.status(404).send('Equipment not found.');
        }
    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).send('Error deleting equipment.');
    } finally {
        // Close the database connection
        await client.close();
    }
}

module.exports.deleteEquip = deleteEquip
module.exports.updateEquip = updateEquip
module.exports.addEquip = addEquip;
module.exports.getAllCategories = getAllCategories;
module.exports.getAllCategoriesWithImg = getAllCategoriesWithImg;
module.exports.getAllCategoriesWithEquip = getAllCategoriesWithEquip;
module.exports.getEquip = getEquip;
module.exports.addCategory = addCategory;
module.exports.addEquip = addEquip;
module.exports.getUser = getUser;
module.exports.searchEquip = searchEquip;
module.exports.queryLen = queryLen;