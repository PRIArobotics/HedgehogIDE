/* eslint-disable import/prefer-default-export */

export const createModelHelper = (name, schema) => connection => {
  if (__DEV__ && connection.models[name]) {
    // we're probably hot-reloading, so can't re-compile the model!
    console.warn(`Trying to re-compile schema for '${name}'; keeping the original model.`);
    return connection.models[name];
  }
  return connection.model(name, schema);
};
