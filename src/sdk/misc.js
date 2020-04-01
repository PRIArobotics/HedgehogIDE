// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import ExecutorTask from '../components/ide/Executor/ExecutorTask';
// <default GSL customizable: misc-imports>
// Put your imports tags here

// </GSL customizable: misc-imports>

export default async function init(getConsole: () => Promise<Console>, onExit: () => void | Promise<void>) {
  // <default GSL customizable: misc-init>
  // Your module initialization code

  // </GSL customizable: misc-init>

  async function print(text: string) {
    // <GSL customizable: misc-body-print>
    (await getConsole()).consoleOut(text, 'stdout');
    // </GSL customizable: misc-body-print>
  }

  async function exit(error: any) {
    // <GSL customizable: misc-body-exit>
    // Your function code goes here
    if (error) {
      (await getConsole()).consoleOut(error, 'stderr');
    }
    return onExit();
    // </GSL customizable: misc-body-exit>
  }

  return {
    'misc_print': ({ text }) => print(text),
    'misc_exit': ({ error }) => exit(error),
  };
};
