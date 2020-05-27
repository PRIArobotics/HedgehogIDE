// @flow

import mongoose from 'mongoose';
import { createModelHelper } from './utils';

export const projectSchema: mongoose.Schema<any> = new mongoose.Schema({
  name: String,
  isPublic: Boolean,
  createdAt: Date,
  fileTreeRoot: { type: mongoose.Schema.Types.ObjectId, ref: 'FileTree' },
});

export const fileTreeSchema: mongoose.Schema<any> = new mongoose.Schema({
  name: String,
  contents: [
    {
      name: String,
      type: { type: String, enum: ['File', 'Tree'] },
      ref: mongoose.Schema.Types.ObjectId,
    },
  ],
});

export const fileSchema: mongoose.Schema<any> = new mongoose.Schema({
  data: Buffer,
});

export const createProjectModel = createModelHelper('Project', projectSchema);
export const createFileTreeModel = createModelHelper('FileTree', projectSchema);
export const createFileModel = createModelHelper('File', projectSchema);
