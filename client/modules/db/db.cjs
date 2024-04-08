const mongoose = require('mongoose');
require('dotenv').config()

async function connect() {
    const uri = process.env.MONGO;
    mongoose
        .connect(uri, {
            serverSelectionTimeoutMS: 5000,
        })
        .then(() => {
            console.log('Connected');
        })
        .catch((err) => console.log(err));
}

module.exports = { connect };
