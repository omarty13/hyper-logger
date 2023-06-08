import process                          from 'node:process';
import * as readline                    from 'node:readline/promises';
import { stdin, stdout, }               from 'node:process';
import { HyperLogger, }                 from './index.mjs';


const rl = readline.createInterface({
	input: stdin,
	output: stdout,
});

runMenu();

async function runMenu(msg) {
	const msgtxt = 
	(msg ? msg : "")
	+	"~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n"
	+	" Menu\n"
	+	"~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n"
	+	"1 - Test error.\n"
	+	"2 - Test colors.\n"
	+	"3 - Test long text.\n"

	const answer = await rl.question(msgtxt);

	if (answer == "1") {
		test_1();
	}
	else if (answer == "2") {
		test_2();
		await runMenu();
	}
	else if (answer == "3") {
		test_3();
		await runMenu();
	}
	else {
		await runMenu("Not valid answer. Try again...\n\n");
		return;
	}
}

const logger = new HyperLogger({
	levels: [ "fatal", "error", "warn", "info", "debug", "trace", ],
	level: "trace",
	dirname: "./logs",
	filename: "logfile.log",
	maxSize: 100 * 1024* 1024, // 100Mb
	maxFiles: 20,
});

logger.on("error", (err) => {
	console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
	console.log(err.stack);
});

// If installing the listener the process will not crash.
// process.on('uncaughtException', (err, origin) => {
// 	logger.fatal(err.stack, { className: "test.js", instanceName: "instanceName", funcName: "process.on('uncaughtExceptionMonitor')", data: { err, origin, } });
// });

// The process will still crash.
process.on('uncaughtExceptionMonitor', (err, origin) => {
	logger.fatal(err.stack, { className: "test.js", instanceName: "instanceName", funcName: "process.on('uncaughtExceptionMonitor')", data: { err, origin, } });
});


/**
 * Test 1 - Test uncaught exception.
 */
function test_1() {
	stdout.write("Wait.");

	setInterval(() => {
		stdout.write(".");
	}, 100);

	setInterval(() => {
		throw new Error("Is test error!");
	}, 1000);
}

/**
 * Test 2 - Colors.
 */
function test_2() {
	logger.fatal("This is fatal message.", { className: "test.js", instanceName: "instanceName", funcName: "funcFatal()", data: { a: 1, } });
	logger.error("This is error message.", { className: "test.js", instanceName: "instanceName", funcName: "funcError()", messageColors: [ "fgGreen", ], });
	logger.warn("This is warn message.", { className: "test.js", instanceName: "instanceName", funcName: "funcWarn()", messageColors: [ "bgBlue", ], });
	logger.info("This is info message.", { className: "test.js", instanceName: "instanceName", funcName: "funcInfo()", messageColors: [ "fgBlue", ], });
	logger.debug("This is debug message.", { className: "test.js", instanceName: "instanceName", funcName: "funcDebug()", messageColors: [ "underscore", "bgGray", ], });
	logger.trace("This is trace message.", { className: "test.js", instanceName: "instanceName", funcName: "funcTrace()", messageColors: [ "bright", ], });	
}

/**
 * Test 3 - Long text.
 */
function test_3() {
	for (let i = 0; i < 100; i++) {
		logger.trace(
			"Warning: Synchronous writes block the event loop until the write has completed. This can be near instantaneous in the case of output to a file, but under high system load, pipes that are not being read at the receiving end, or with slow terminals or file systems, it's possible for the event loop to be blocked often enough and long enough to have severe negative performance impacts. This may not be a problem when writing to an interactive terminal session, but consider this particularly careful when doing production logging to the process output streams.",
			{ className: "test.js", instanceName: "instanceName", funcName: "funcTrace()", },
		);	
	}
}

// logger.stop(() => process.exit());