'use strict';

const path                              = require('path');
const fs                                = require('fs');
const fsPromises                        = require('fs').promises;
const EventEmitter                      = require('events');


module.exports = class HyperLogger extends EventEmitter
{
	/**
	* HyperLogger constructor.
	*
	* @constructor
	* @param {String} params.filename - Filename of logs.
	* @param {String} [params.dirname=__dirname] - dirname of logs.
	* @param {Number} [params.maxSize=(50 * 1024 * 1024)] - Maximum size of log file.
	* @param {Number} [params.maxFiles=10] - Maximum number of log files.
	* @param {Array} [params.levels] - Array of Levels => ["error", "debug", "info"]. By default is [ "fatal", "error", "warn", "info", "debug", "trace", ].
	* @param {String} [params.level] - Current level. If no value is specified, then the last one from the "params.levels" array will be set.
	*/
	constructor(params)
	{
		super();

		// ---------------------------------------------------------
		if (typeof params.filename != "string" || params.filename.length < 1) {
			throw new Error('Parameter "filename" not valid.');
		}
		const _ptr = params.filename.lastIndexOf(".");
		if (_ptr > -1) {
			this._fileExt = params.filename.slice(_ptr + 1);
			this._fileName = params.filename.slice(0, _ptr);
		} else {
			this._fileExt = "";
			this._fileName = params.filename;
		}

		// ---------------------------------------------------------
		this._dirname = params.dirname ? path.normalize(params.dirname) : __dirname;

		// ---------------------------------------------------------
		if (params.maxSize == undefined) {
			this._maxSize = 50 * 1024 * 1024; // 50Mb by default
		} else if (typeof params.maxSize == "number") {
			if (params.maxSize < 100) {
				throw new Error('Parameter "maxSize" parameter cannot be less than 100.');
			} else {
				this._maxSize = params.maxSize;
			}
		} else {
			throw new Error('Parameter "maxSize" can only be a number.');
		}

		// ---------------------------------------------------------
		if (params.maxFiles == undefined) {
			this._maxFiles = 10;
		} else if (typeof params.maxFiles == "number") {
			if (params.maxFiles < 1) {
				throw new Error('Parameter "maxFiles" parameter cannot be less than 1.');
			} else {
				this._maxFiles = params.maxFiles;
			}
		} else {
			throw new Error('Parameter "maxFiles" can only be a number.');
		}

		// ---------------------------------------------------------
		this._levels = params.levels || [ "fatal", "error", "warn", "info", "debug", "trace", ];
		this._level = params.level || this._levels.slice(-1)[0];

		// ---------------------------------------------------------
		this._curfilePtr = 0;
		this._curfileSize = 0;
		this._queue = [];

		// ---------------------------------------------------------
		this._createFunctions({
			levels: this._levels,
			level: this._level,
		});

		// ---------------------------------------------------------
		this._start();

		// setInterval(() => {
		// 	console.log(this._formatLog("__________", " DEV ", { className: "HyperLogger", funcName: "constructor", data: { "this._curfileSize": this._curfileSize, }, }));
		// }, 2000);
	}

	/**
	 * Async function for start.
	 * @return {undefined}
	 */
	async _start() {
		const logStats = await this._getLogStats();

		// -----------------------------------------------------------------------------
		let filename;

		if (logStats.length > 0) {
			const logStatLast = logStats.slice(-1)[0];
			
			if (logStatLast.stat.size >= this._maxSize) {
				filename = `${this._fileName}${logStatLast.num+1}${this._fileExt ? ("."+this._fileExt) : ""}`;
				this._curfilePtr = logStatLast.num + 1;
			}
			else {
				filename = logStatLast.name;
				this._curfilePtr = logStatLast.num;
			}

			this._curfileSize = logStatLast.stat.size;
			// console.log(this._formatLog("", " DEV ", { className: "HyperLogger", funcName: "_start", data: { size: logStatLast.stat.size, }, }));
		}
		else {
			filename = `${this._fileName}${0}${this._fileExt ? ("."+this._fileExt) : ""}`;
			this._curfilePtr = 0;
			this._curfileSize = 0;
		}

		// -----------------------------------------------------------------------------
		this._wstream = new fs.createWriteStream(path.normalize(`${this._dirname}/${filename}`), { flags: 'a', });

		this._wstream.on("error", (err) => {
			this.emit("error", err);
		});

		setImmediate(() => this._deleteTail());

		// -----------------------------------------------------------------------------
		if (this._queue.length > 0) {
			for (let i = 0; i < this._queue.length; i++) {
				const args = this._queue[i];
				this[args.level](args.message, args.params);
			}

			this._queue = [];
		}
	}

	/**
	 * Function for get log stats.
	 * @return {Array} Returns array of objects => [{ name:<String>, stat:<fs.Stats>, num:<Number>, }]
	 */
	async _getLogStats() {
		let fileNames;
		try {
			fileNames = await fsPromises.readdir(this._dirname);
		} catch (err) {
			if (err.code != "ENOENT") {
				this.emit("error", err);
				return [];
			}
			try {
				await fsPromises.mkdir(this._dirname);
				fileNames = [];
			} catch (err) {
				this.emit("error", err);
				return [];
			}
		}

		const logStats = [];
		const re1 = new RegExp(`^${this._fileName}[0-9]{0,}${this._fileExt ? ("."+this._fileExt) : ""}$`);
		const re2 = new RegExp(`[0-9]{0,}${this._fileExt ? ("."+this._fileExt) : ""}$`);

		for (let i = 0; i < fileNames.length; i++) {
			if (re1.test(fileNames[i]) == false) {
				continue;
			}

			let stat;
			try {
				stat = await fsPromises.stat(path.normalize(`${this._dirname}/${fileNames[i]}`));
			} catch (err) {
				if (err.code == "ENOENT") {
					continue;
				} else {
					this.emit("error", err);
					return [];
				}
			}

			const rslt = fileNames[i].match(re2);
			const num = Number(rslt[0].split(".")[0]);

			logStats.push({ name: fileNames[i], stat, num, });
		}

		if (logStats.length > 1) {
			this._sortLogStats(logStats);
		}

		// console.log(this._formatLog("", " DEV ", { className: "HyperLogger", funcName: "_getLogStats", }), logStats);

		return logStats;
	}

	/**
	 * Function for delete tail of logs.
	 * @return {undefined}
	 */
	async _deleteTail() {
		const logStats = await this._getLogStats();
		// console.log(this._formatLog("", " DEV ", { className: "HyperLogger", funcName: "_deleteTail", data: { "logStats.length": logStats.length, }, }));

		if (logStats.length <= this._maxFiles) {
			return;
		}

		const logStatsTail = logStats.slice(0, (logStats.length - this._maxFiles));

		// console.log(this._formatLog("", " DEV ", { className: "HyperLogger", funcName: "_deleteTail", data: { "logStatsTail.length": logStatsTail.length, }, }));

		for (let i = 0; i < logStatsTail.length; i++) {
			try {
				await fsPromises.unlink(`${this._dirname}/${logStatsTail[i].name}`);
			} catch (err) {
				this.emit("error", err);
			}
		}
	}

	/**
	* Function for sort logs.
	* @param {Array} logStats - Array with objects { stat <fs.Stats>, name <String>, }
	*/
	_sortLogStats(logstatList) {
		logstatList.sort((a, b) => {
			const t1 = a.stat.birthtime.getTime();
			const t2 = b.stat.birthtime.getTime();

			if (t1 < t2) {
				return -1
			} else if (t1 > t2) {
				return 1
			} else {
				return 0;
			}
		});
	}

	/**
	 * Function for set current log level.
	 * @param {String} level - Log level.
	 */
	setLevel(level) {
		this._levelIndex = this._levels.indexOf(level);
	}

	/**
	 * Function for get log levels.
	 * @param {Array} levels - Array of log levels.
	 */
	getLevels() {
		return this._levels;
	}

	/**
	 * Function for create functions of levels to instance of logger.
	 * @param {*} { level, levels, }
	 */
	_createFunctions({ level, levels, }) {
		this.setLevel(level);

		for (let i = 0; i < levels.length; i++) {
			const indx = i;
			const level = levels[i];

			this[levels[i]] = (message, params) => {
				if (this._wstream == null) {
					this._queue.push({ message, level, params, });
					return;
				}

				if (this._curfileSize >= this._maxSize) {
					this._wstream.end();

					this._curfilePtr += 1;
					this._curfileSize = 0;

					const filename = `${this._fileName}${this._curfilePtr}${this._fileExt ? ("."+this._fileExt) : ""}`;
					
					this._wstream = new fs.createWriteStream(path.normalize(`${this._dirname}/${filename}`), { flags: 'a', });

					this._wstream.on("error", (err) => {
						this.emit("error", err);
					});

					setImmediate(() => this._deleteTail());
				}

				if (indx <= this._levelIndex && this._wstream.writable == true) {
					const log = this._formatLog(message, level, params);

					if (params.isNotConsole !== true) {
						console.log(log);
					}

					const buf = Buffer.from((log +"\n"), "utf-8");
					this._wstream.write(buf);
					this._curfileSize += buf.length;
					
					// console.log(this._formatLog("", " DEV ", { className: "HyperLogger", funcName: "_createFunctions", data: { "writableLength": this._wstream.writableLength, "this._curfileSize": this._curfileSize, }, }));
				}
			}
			
		}
	}
	
	/**
	* Function for building log.
	* @param {object} params - Parameters.
	* @param {string} message - Message of log.
	* @param {string} [params.className] - Class name which make log record.
	* @param {string} [params.instanceName] - Instance name which make log record.
	* @param {string} [params.funcName] - Function name which make log record.
	* @param {object} [params.data] - Any data for information.
	* @param {boolean} [params.isOnlyMessage] - If true show in log string only message, with out other parameters.
	* @returns {string} Returns string.
	*/
	_formatLog(message, level, params) {
		if (params.isOnlyMessage == true) {
			return message;
		}

		let millisec = String(new Date().getUTCMilliseconds());

		if (millisec.length == 3) {}
		else if (millisec.length == 2) millisec = "0" + millisec;
		else if (millisec.length == 1) millisec = "00" + millisec;
		
		let classInstanceName = " ";
		if (params.className && params.instanceName) {
			classInstanceName += "["+ params.className +"::"+ params.instanceName +"]";
		} else if (params.className) {
			classInstanceName += "["+ params.className +"]";
		} else if (params.instanceName) {
			classInstanceName += "["+ params.instanceName +"]";
		}

		let funcName = "";
		if (params.funcName) {
			funcName = " "+ params.funcName;
		}
		
		let _message = "";
		if (message.length > 0) {
			_message = " : "+ message;
		}
		
		let data = "";
		if (params.data) {
			data = " : "+ JSON.stringify(params.data);
		}

		if (level.length < 5) {
			while (level.length < 5) level += " ";
		} else if (level.length > 5) {
			level = level.substr(0, 5);
		}

		let logtext = `[${HyperLogger.createTimestamp()}] [${level}]${classInstanceName}${funcName}${_message}${data}`;

		return logtext;
	}

	/**
	* Create timestamp
	* @static
	* @returns {String} Returns timestamp.
	*/
	static createTimestamp() {
		var date = new Date();

		var day = String(date.getDate());
		var month = String(date.getMonth() + 1);
		var year = date.getFullYear();
		var hours = String(date.getHours());
		var minutes = String(date.getMinutes());
		var seconds = String(date.getSeconds());
		var millisec = String(date.getUTCMilliseconds());
		
		if (millisec.length == 2) millisec = "0" + millisec;
		else if (millisec.length == 1) millisec = "00" + millisec;

		return (
			((day.length < 2) ? ("0"+day) : (day)) +
			"-" +
			((month.length < 2) ? ("0"+month) : (month)) +
			"-" +
			year +
			" " +
			((hours.length < 2) ? ("0"+hours) : (hours)) +
			":" +
			((minutes.length < 2) ? ("0"+minutes) : (minutes)) +
			":" +
			((seconds.length < 2) ? ("0"+seconds) : (seconds)) +
			"." +
			millisec
		)
	}
}