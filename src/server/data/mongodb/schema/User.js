import mongoose from 'mongoose';

export const schema = new mongoose.Schema({ username: String });

export const createModel = connection => connection.model('User', schema);
