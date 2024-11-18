const { assert } = require('chai');
const { default: Logger } = require('log-ng');
const GCMon = require('./GCMon.js');

const logger = new Logger('spec.js');

describe('GCMon', function(){
	before(function(){
		Logger.setLogLevel('debug');
		this.gcMon = new GCMon();
	});
	it('should create a new instance', function(){
		const { gcMon } = this;
		assert.ok(gcMon);
	});
	it('should generate a report', function(){
		const { gcMon } = this;
		const obj = Object.create(null);
		logger.debug(JSON.stringify(gcMon.report()));
		assert.ok(gcMon);
	});
	it('should correctly categorize objects by gen', function(){
		this.timeout(10000);
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

describe.only('Garbage Collector Behavior', function(){
	before(function(){
		Logger.setLogLevel('debug');
	});
	it('should GC un-referenced objects', function(done){
		this.timeout(6e4);

		function test(){
			const obj = {a: 1};
			return new WeakRef(obj);
		}

		const testRef = test();
		const testInterval = setInterval(() => {
			if(testRef.deref()){
				logger.debug('Still waiting');
				console.log(JSON.stringify(testRef.deref()));
			}else{
				logger.info('Garbage collected');
				clearInterval(testInterval);
				done();
			}
		}, 2e4);
	});
});
