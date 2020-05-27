import mongoose from 'mongoose';
import config from '../config';

mongoose
  .connect(config.mongodbUrl, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .catch(error => {
    console.error('MongoDB initial connection failed', error);
  });

export default mongoose.connection;
