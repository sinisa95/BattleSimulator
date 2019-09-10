const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/battlesimulator', { useNewUrlParser: true })
  .then(() => {
    mongoose.connection.db.dropDatabase(() => console.log('Dropped battlesimulator DB') || process.exit());
  });
