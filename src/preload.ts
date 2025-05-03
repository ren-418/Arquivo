import exposeContexts from "./helpers/ipc/context-exposer";

console.log('Preload script starting...');
exposeContexts();
console.log('Preload script completed');
