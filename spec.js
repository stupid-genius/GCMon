const { assert } = require('chai');
const { default: Logger } = require('log-ng');
const GCMon = require('./GCMon');

const logger = new Logger('spec.js');

describe('GCMon', function(){
	before(function(){
		Logger.setLogLevel('debug');
		this.gcMon = new GCMon();
	});
	it.only('should create a new instance', function(){
		const { gcMon } = this;
		assert.ok(gcMon);
	});
	it('should generate a report', function(){
		const { gcMon } = this;
		const obj = Object.create();
		logger.debug(JSON.stringify(gcMon.report()));
		assert.ok(gcMon);
	});
	it('should correctly categorize objects by gen', function(){
		// this.timeout(10000);
		// need to create a lot of objects to test this
		// in different scopes with different lifetimes
		const { gcMon } = this;
		assert.ok(gcMon);
	});
	it('should successfully uninstall', function(){
		const { gcMon } = this;
		assert.ok(gcMon);
	});
});
