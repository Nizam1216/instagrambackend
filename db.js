const mongoose = require("mongoose");

const connectToMongo = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`connected to mongo DB ${mongoose.connection.host}`);
};
module.exports = connectToMongo;
