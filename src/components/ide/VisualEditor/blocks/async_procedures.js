// @flow

import Blockly from 'blockly';

function isAsyncProcedure(block: Blockly.Block): boolean {
  if (block.type !== 'procedures_defnoreturn' && block.type !== 'procedures_defreturn')
    return false;
  // TODO determine whether await is used
  return false;
}

const original_procedures_callreturn_generator = Blockly.JavaScript['procedures_callreturn'];
Blockly.JavaScript['procedures_callreturn'] = block => {
  const defBlock = Blockly.Procedures.getDefinition(block.getProcedureCall(), block.workspace);
  console.log(defBlock);
  let code = original_procedures_callreturn_generator(block)[0];
  if (isAsyncProcedure(defBlock))
    code = `await ${code}`;
  return [code, Blockly.JavaScript.ORDER_AWAIT];
}

const original_scrub_ = Blockly.JavaScript.scrub_;
Blockly.JavaScript.scrub_ = (block, code, opt_thisOnly) => {
  if (isAsyncProcedure(block))
    code = `async ${code}`;
  return original_scrub_(block, code, opt_thisOnly);
}
