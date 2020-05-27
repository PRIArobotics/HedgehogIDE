// @flow

import mongoose from 'mongoose';
import { createModelHelper } from './utils';

export const schema: mongoose.Schema<any> = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  createdAt: Date,
});

export const createModel = createModelHelper('User', schema);
