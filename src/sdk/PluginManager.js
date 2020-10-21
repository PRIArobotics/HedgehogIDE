// @flow

import { fs } from 'filer';

import Executor, { type Task } from '../components/ide/Executor';
import { Project } from '../core/store/projects';
import { type ConsoleType } from '../components/ide/Console';
import { Simulation } from '../components/ide/Simulator/simulation';
import initMiscSdk from './misc';
import initHedgehogSdk from './hedgehog';
import initBlocklySdk from './blockly';
import initSimulationSdk from './simulation';

class PluginManager {
  executor: Executor;
  plugins: Task[] = [];
  pluginReadyResolvers: (() => void)[] = [];

  getConsole: () => Promise<ConsoleType>;
  getSimulation: () => Promise<Simulation>;
  sdk: any;

  constructor(
    executor: Executor,
    getConsole: () => Promise<ConsoleType>,
    getSimulation: () => Promise<Simulation>,
  ) {
    this.executor = executor;
    this.getConsole = getConsole;
    this.getSimulation = getSimulation;
  }

  async initSdk() {
    const { executor, getConsole, getSimulation } = this;

    // TODO: add on exit handler
    this.sdk = {
      misc: await initMiscSdk({
        getConsole,
        onExit: () => {},
        pluginManager: this,
        executor,
      }),
      hedgehog: await initHedgehogSdk({
        getSimulation,
      }),
      blockly: await initBlocklySdk(),
      simulation: await initSimulationSdk({
        executor,
        getSimulation,
      }),
    };
  }

  async loadFromProjectMetadata(project: Project) {
    const pluginFolderPath = project.resolve('.metadata', 'plugins');
    try {
      const stat = await fs.promises.stat(pluginFolderPath);
      if (!stat.isDirectory()) {
        return;
      }
    } catch (e) {
      if (e?.code === 'ENOENT') {
        return;
      } else {
        throw e;
      }
    }

    const sh = new fs.Shell();
    const pluginFiles = await sh.promises.ls(pluginFolderPath);
    this.plugins.push(
      ...(await Promise.all(
        pluginFiles
          .filter((pluginFile) => pluginFile.name.endsWith('.js'))
          .map(async (pluginFile) => {
            const code = await fs.promises.readFile(
              project.resolve('.metadata', 'plugins', pluginFile.name),
              'utf8',
            );
            return this.addPlugin(pluginFile.name, code);
          }),
      )),
    );
  }

  async addPlugin(name: string, code: string): Promise<Task> {
    const readyPromise = new Promise((resolve) => {
      this.pluginReadyResolvers.push(resolve);
    });
    const task = this.executor.addTask({
      name,
      code,
      api: {
        ...this.sdk.misc.handlers,
        ...this.sdk.hedgehog.handlers,
        ...this.sdk.blockly.handlers,
        ...this.sdk.simulation.handlers,
      },
    });
    await readyPromise;
    return task;
  }

  simulationAdded(simulation: Simulation) {
    this.sdk.simulation.simulationAdded(simulation);
  }

  // TODO this simply resolves one loading plugin, not the correct one
  onPluginReady = () => this.pluginReadyResolvers.shift()();

  getSdk() {
    return this.sdk;
  }
}
export default PluginManager;
