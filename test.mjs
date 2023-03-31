import process                          from 'node:process';
import { HyperLogger, }                 from './index.mjs';


const logger = new HyperLogger({
	levels: [ "fatal", "error", "warn", "info", "debug", "trace", ],
	level: "trace",
	dirname: "./logs",
	filename: "logfile.log",
	maxSize: 100 * 1024* 1024, // 100Mb
	maxFiles: 20,
});

logger.on("error", (err) => {
	console.log("________________________________________");
	console.log(err.stack);
});

// process.on('uncaughtException', (err, origin) => {
// 	logger.fatal(err.stack, { className: "test.js", instanceName: "instanceName", funcName: "process.on('uncaughtExceptionMonitor')", data: { err, origin, } });
// });

process.on('uncaughtExceptionMonitor', (err, origin) => {
	logger.fatal(err.stack, { className: "test.js", instanceName: "instanceName", funcName: "process.on('uncaughtExceptionMonitor')", data: { err, origin, } });
});

setInterval(() => {
	throw new Error("New err!");
}, 1000);

logger.fatal("This is fatal message.", { className: "test.js", instanceName: "instanceName", funcName: "funcFatal()", data: { a: 1, } });
logger.error("This is error message.", { className: "test.js", instanceName: "instanceName", funcName: "funcError()", messageColors: [ "fgGreen", ], });
logger.warn("This is warn message.", { className: "test.js", instanceName: "instanceName", funcName: "funcWarn()", messageColors: [ "bgBlue", ], });
logger.info("This is info message.", { className: "test.js", instanceName: "instanceName", funcName: "funcInfo()", messageColors: [ "fgBlue", ], });
logger.debug("This is debug message.", { className: "test.js", instanceName: "instanceName", funcName: "funcDebug()", messageColors: [ "underscore", "bgGray", ], });
logger.trace("This is trace message.", { className: "test.js", instanceName: "instanceName", funcName: "funcTrace()", messageColors: [ "bright", ], });

// logger.stop(() => process.exit());