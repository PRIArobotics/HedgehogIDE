// @flow

import Blockly from 'blockly';

Blockly.Extensions.registerMixin('requires_async_js_function', {
  requiresAsyncJsFunction: true,
});

function isAsyncProcedureCall(block: Blockly.Block): boolean {
  if (block.type !== 'procedures_callnoreturn' && block.type !== 'procedures_callreturn')
    return false;

  const defBlock = Blockly.Procedures.getDefinition(block.getProcedureCall(), block.workspace);
  return isAsyncProcedure(defBlock);
}

function isAsyncProcedure(block: Blockly.Block): boolean {
  if (block.type !== 'procedures_defnoreturn' && block.type !== 'procedures_defreturn')
    return false;

  // a procedure is async if any descendant is async,
  // i.e. if not every descendant is not async
  return !block.getDescendants().every(child => {
    return !(isAsyncProcedureCall(child) || child.requiresAsyncJsFunction);
  });
}

const original_procedures_callreturn_generator = Blockly.JavaScript['procedures_callreturn'];
Blockly.JavaScript['procedures_callreturn'] = block => {
  let code = original_procedures_callreturn_generator(block)[0];
  if (isAsyncProcedureCall(block))
    code = `await ${code}`;
  return [code, Blockly.JavaScript.ORDER_AWAIT];
}

const original_scrub_ = Blockly.JavaScript.scrub_;
Blockly.JavaScript.scrub_ = (block, code, opt_thisOnly) => {
  if (isAsyncProcedure(block))
    code = `async ${code}`;
  return original_scrub_(block, code, opt_thisOnly);
}
