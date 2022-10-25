<style>
	body {
		background-color: white;
		color: DarkSlateGray;
		font-family: Noto Sans Condensed;
		font-size: 18px;
		max-width: 1000px;
		margin: auto;
	}
	a {
		color: teal;
	}
	h1 {
		/* border: 4px solid CadetBlue; */
		background-color: Teal;
		font-weight: bold;
		font-size: 28px;
		color: White;
		border-radius: 6px;
		padding: 0px 10px 3px;
	}
	h2 {
		/* border: 2px solid DarkCyan; */
		background-color: #00808050;
		font-weight: bold;
		font-size: 24px;
		color: Teal;
		border-radius: 6px;
		padding: 0px 20px 1px;
	}
	h3 {
		/* border: 3px solid LightBlue; */
		background-color: #00808020;
		font-weight: bold;
		font-size: 20px;
		color: Teal;
		border-radius: 6px;
		padding: 0px 30px 1px;
	}
	p {
		margin-left: 20px;
	}
	pre {
		border: 3px solid DimGray;
		background-color: Grey;
		border-radius: 6px;
		padding: 10px 20px;
		font-family: Consolas;
		white-space: pre-wrap;
		word-break: break-all;
	}
	pre code {
		background-color: Grey;
		color: white;
		font-size: 16px;
	}
	code {
		background-color: rgba(188, 143, 143, 0.2);
		color: DarkRed;
		border-radius: 6px;
		padding: 0px 3px;
	}
	img {
		/* border: 3px solid DimGray; */
		margin-left: -8px;
		width: 100%;
	}
</style>

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

	coreLogger.trace("", { className: "SomeClass", instanceName: "someInstanceName", funcName: 'someFunctionName', data: { foo: "bar", ["something else"] }});


<br>
