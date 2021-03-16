// @flow
/* eslint-disable */
// DO NOT DELETE GSL TAGS

import { type TaskHandle } from '../components/ide/Executor/Executor';
import baseEmit from './base';
// <GSL customizable: misc-imports>
import PluginManager from './PluginManager';
import Executor from '../components/ide/Executor';
import { type ConsoleType } from '../components/ide/Console';
import { getEffectiveLocale } from '../translations';

// </GSL customizable: misc-imports>

type InitArgs = {
  print: (text: string, stream: string) => void | Promise<void>,
  getInput: () => Promise<string>,
  getPreferredLocales: () => string[],
  onExit: (string | void) => void | Promise<void>,
  pluginManager: PluginManager,
  executor: Executor,
};

export default async function init({
  print,
  getInput,
  getPreferredLocales,
  onExit,
  pluginManager,
  executor,
}: InitArgs) {
  // <default GSL customizable: misc-init>
  // Your module initialization code

  // </GSL customizable: misc-init>

  const emit = baseEmit.bind(null, 'misc');

  async function handlePrint(text: any) {
    // <GSL customizable: misc-body-print>
    return /* await */ print(text.toString(), 'stdout');
    // </GSL customizable: misc-body-print>
  }

  async function handleGetInput() {
    // <GSL customizable: misc-body-getInput>
    return /* await */ getInput();
    // </GSL customizable: misc-body-getInput>
  }

  async function handleGetBestLocale(localeOptions: string[]) {
    // <GSL customizable: misc-body-getBestLocale>
    const locales = getPreferredLocales();
    const supported = Array.prototype.includes.bind(localeOptions);
    return getEffectiveLocale(locales, supported);
    // </GSL customizable: misc-body-getBestLocale>
  }

  async function exit(error: string | void) {
    // <GSL customizable: misc-body-exit>
    // Your function code goes here
    if (error) {
      await print(error, 'stderr');
    }
    await onExit(error);
    // </GSL customizable: misc-body-exit>
  }

  async function pluginReady() {
    // <GSL customizable: misc-body-pluginReady>
    // Your function code goes here
    pluginManager.onPluginReady();
    // </GSL customizable: misc-body-pluginReady>
  }

  return {
    // <default GSL customizable: misc-extra-return>
    // Space for extra exports

    // </GSL customizable: misc-extra-return>
    emit,
    handlers: {
      'misc_print': ({ text }: { text: any }) => handlePrint(text),
      'misc_getInput': async ({  }: {  }, taskHandle: TaskHandle) => {
        return taskHandle.withReply(null, handleGetInput.bind(null, ));
      },
      'misc_getBestLocale': async ({ localeOptions }: { localeOptions: string[] }, taskHandle: TaskHandle) => {
        return taskHandle.withReply(null, handleGetBestLocale.bind(null, localeOptions));
      },
      'misc_exit': ({ error }: { error: string | void }) => exit(error),
      'misc_pluginReady': ({  }: {  }) => pluginReady(),
    },
  };
}
