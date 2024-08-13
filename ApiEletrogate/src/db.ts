const mongoose = require("mongoose")
const connectionString = 'mongodb://root:root@ac-e4h7djv-shard-00-00.5ushhnj.mongodb.net:27017,ac-e4h7djv-shard-00-01.5ushhnj.mongodb.net:27017,ac-e4h7djv-shard-00-02.5ushhnj.mongodb.net:27017/?ssl=true&replicaSet=atlas-mbm64t-shard-0&authSource=admin&retryWrites=true&w=majority&appName=ProjetoDadosEsp32'

const connectDB = async () => {
  try {
    await mongoose.connect(connectionString);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export default connectDB;