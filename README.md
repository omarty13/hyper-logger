<h1 id="anch_up">Hyper Logger</h1>

Simple logger for node.js without dependencies

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

	const HyperLogger                       = require("../logs/HyperLogger");


	const hyperLogger = new HyperLogger({
		levels: [ "fatal", "error", "warn", "info", "debug", "trace", ],
		level: "trace",
		dirname: "../Logs",
		filename: "server-node.log",
		maxSize: 100 * 1024* 1024, // 100Mb
		maxFiles: 20,
	});

	hyperLogger.on("error", (err) => {
		console.log(err.stack);
	});

	coreLogger.trace("", {
		className: "SomeClass",
		instanceName: "someInstanceName",
		funcName: 'someFunctionName',
		data: { foo: "bar", someArray: ["one", "two"] }
	});

	// [25-10-2022 22:50:04.975] [trace] [SomeClass::someInstanceName] someFunctionName : {"foo":"bar","someArray":["one","two"]}
<br>
