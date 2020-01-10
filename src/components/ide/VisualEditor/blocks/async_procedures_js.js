// @flow

import Blockly from 'blockly';

Blockly.Extensions.registerMixin('requires_async_js_function', {
  requiresAsyncJsFunction: true,
});

// TODO prevent infinite recursion for recursive functions

function requiresAsyncJsFunction(block: Blockly.Block): boolean {
  // eslint-disable-next-line no-use-before-define
  return isAsyncProcedureCall(block) || block.requiresAsyncJsFunction;
}

function isAsyncProcedureCall(block: Blockly.Block): boolean {
  if (
    block.type !== 'procedures_callnoreturn' &&
    block.type !== 'procedures_callreturn'
  )
    return false;

  const defBlock = Blockly.Procedures.getDefinition(
    block.getProcedureCall(),
    block.workspace,
  );
  // eslint-disable-next-line no-use-before-define
  return isAsyncProcedure(defBlock);
}

function isAsyncProcedure(block: Blockly.Block): boolean {
  if (
    block.type !== 'procedures_defnoreturn' &&
    block.type !== 'procedures_defreturn'
  )
    return false;

  // a procedure is async if any descendant is async,
  // i.e. if not every descendant is not async
  return !block
    .getDescendants()
    .every(child => !requiresAsyncJsFunction(child));
}

// eslint-disable-next-line camelcase
const original_procedures_callreturn_generator =
  Blockly.JavaScript.procedures_callreturn;
Blockly.JavaScript.procedures_callreturn = block => {
  let code = original_procedures_callreturn_generator(block)[0];
  if (isAsyncProcedureCall(block)) code = `await ${code}`;
  return [code, Blockly.JavaScript.ORDER_AWAIT];
};

// eslint-disable-next-line camelcase, no-underscore-dangle
const original_scrub_ = Blockly.JavaScript.scrub_;
// eslint-disable-next-line camelcase, no-underscore-dangle
Blockly.JavaScript.scrub_ = (block, code, opt_thisOnly) => {
  const newCode = isAsyncProcedure(block) ? `async ${code}` : code;
  return original_scrub_(block, newCode, opt_thisOnly);
};
