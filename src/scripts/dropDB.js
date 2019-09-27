const mongoose = require('mongoose');

mongoose.connect(`mongodb://${process.env.MONGO_URL}`, { useNewUrlParser: true })
  .then(() => {
    mongoose.connection.db.dropDatabase(() => console.log('Dropped battlesimulator DB') || process.exit());
  })
  .catch(() => console.error('Error while connecting to MongoDB'));
