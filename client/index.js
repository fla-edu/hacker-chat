import Events from 'events'
import CliConfig from './src/cliConfig.js';
import SocketClient from './src/socket.js';
import TerminalController from "./src/terminalController.js";

const [nodePath, filePath, ...commands] = process.argv

const config = CliConfig.parseArguments(commands)
console.log('config', config)
const componentEmitter = new Events()
const socketCliente = new SocketClient(config)
await socketCliente.initialize()
// const controller = new TerminalController()
// await controller.initializeTable(componentEmitter)