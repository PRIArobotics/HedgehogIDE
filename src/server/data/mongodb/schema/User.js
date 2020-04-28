// @flow

import mongoose from 'mongoose';
import { createModelHelper } from './utils';

export const schema: mongoose.Schema<any> = new mongoose.Schema({
  username: String,
});

export const createModel = createModelHelper('User', schema);
