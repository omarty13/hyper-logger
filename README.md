<h1 id="anch_up">Hyper Logger</h1>

Simple logger for node.js without dependencies.

--------------------------------------------------------------------------------

- [1 - Install](#anch_1)
- [2 - Usage](#anch_2)


<br>


--------------------------------------------------------------------------------
<!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->
<h1 id="anch_1">
	1 - Install <a href="#anch_up">↑</a>
</h1>

	npm i @omarty13/hyper-logger --save


<br>


--------------------------------------------------------------------------------
<!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->
<h1 id="anch_1">
	2 - Usage <a href="#anch_up">↑</a>
</h1>

	import { HyperLogger, }                 from './index.mjs';


	const logger = new HyperLogger({
		levels: [ "fatal", "error", "warn", "info", "debug", "trace", ],
		level: "trace",
		dirname: "../Logs",
		filename: "server-node.log",
		maxSize: 100 * 1024* 1024, // 100Mb
		maxFiles: 20,
	});

	logger.on("error", (err) => {
		console.log(err.stack);
	});

	logger.trace("", {
		className: "SomeClass",
		instanceName: "someInstanceName",
		funcName: 'someFunctionName',
		data: { foo: "bar", someArray: ["one", "two"] }
	});

	// [25-10-2022 22:50:04.975] [trace] [SomeClass::someInstanceName] someFunctionName : {"foo":"bar","someArray":["one","two"]}

	logger.fatal("This is fatal message.", { className: "index.js", instanceName: "instanceName", funcName: "funcFatal()", data: { a: 1, } });
	logger.error("This is error message.", { className: "index.js", instanceName: "instanceName", funcName: "funcError()", messageColors: [ "fgGreen", ], });
	logger.warn("This is warn message.", { className: "index.js", instanceName: "instanceName", funcName: "funcWarn()", messageColors: [ "bgBlue", ], });
	logger.info("This is info message.", { className: "index.js", instanceName: "instanceName", funcName: "funcInfo()", messageColors: [ "fgBlue", ], });
	logger.debug("This is debug message.", { className: "index.js", instanceName: "instanceName", funcName: "funcDebug()", messageColors: [ "underscore", "bgGray", ], });
	logger.trace("This is trace message.", { className: "index.js", instanceName: "instanceName", funcName: "funcTrace()", messageColors: [ "bright", ], });

	// Call stop() to write the latest logs to a file. If no callback is passed, it will work like an async function.
	logger.stop(() => process.exit());
<br>
