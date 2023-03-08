const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017"; 

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4
});

async function getDb() {
    if (!client.topology.isConnected()) {
        await client.connect();
    }
    return client.db("mydb");
}

module.exports = {
    getDb: getDb,
    client: client
};
