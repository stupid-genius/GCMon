const { default: Logger } = require('log-ng');

const logger = new Logger('GCMon.js');

/**
 * GC Monitor
 * @description A simple garbage collector monitor
 * @module GCMon
 * @example
 * const GCMon = require('./GCMon');
 * const gcMon = new GCMon();
 * const obj = Object.create(null);
 * console.log(gcMon.report());
 */
function GCMon(){
	if(GCMon.instance instanceof GCMon){
		return GCMon.instance;
	}
	if(!new.target){
		return new GCMon(...arguments);
	}
	Object.defineProperty(GCMon, 'instance', {
		writable: true,
		value: this
	});

	const objects = new WeakMap();
	const keys = [];

	const originalObjectCreate = Object.create;
	const originalReflectConstruct = Reflect.construct;

	// TODO
	// - figure out how to track more object creation methods
	// - track object access and keep stats
	// - perhaps also track events and correlate, eg. objects created since last event
	// - maybe utilize FinalizationRegistry to track object destruction
	const instrumentedObjectCreate = new Proxy(Object.create, {
		apply: function(target, thisArg, args){
			const obj = Reflect.apply(target, thisArg, args);
			objects.set(obj, {
				created: new Date(),
				type: obj.constructor?.name ?? 'Object (no prototype)'
			});
			keys.push(new WeakRef(obj));
			return obj;
		}
	});
	Object.create = instrumentedObjectCreate;

	const instrumentedReflectConstruct = new Proxy(Reflect.construct, {
		apply: function(target, thisArg, args){
			const obj = Reflect.apply(target, thisArg, args);
			objects.set(obj, {
				created: new Date(),
				type: obj.constructor?.name ?? 'Object (no constructor)'
			});
			keys.push(new WeakRef(obj));
			return obj;
		}
	});
	Reflect.construct = instrumentedReflectConstruct;

	Object.defineProperties(this, {
		report: {
			value: function(){
				// TODO refine the membership of each generation
				const report = {
					eden: [], // newly created objects
					survivor: [], // objects that are ~5 mins
					oldGen: [], // objects that are older and are accessed less
					permGen: [] // objects that are older and are accessed a lot
				};
				keys.forEach((key) => {
					const object = key.deref();
					if(object){
						const meta = objects.get(object);
						const age = new Date() - meta.created;
						if(age < 1000){
							report.eden.push({
								object,
								meta
							});
						}else if(age < 300000){
							report.survivor.push({
								object,
								meta
							});
						}else if(age > 300000){
							report.oldGen.push({
								object,
								meta
							});
						}else{
							logger.info('not implemented');
							// report.permGen.push({
							// 	object,
							// 	meta
							// });
						}
					}else{
						logger.info('object has been collected');
						keys.splice(keys.indexOf(key), 1);
					}
				});
				return report;
			}
		},
		uninstall: {
			value: function(){
				Object.create = originalObjectCreate;
				Reflect.construct = originalReflectConstruct;
				logger.info('uninstalled');
				delete GCMon.instance;
			}
		}
	});
}

module.exports = GCMon;
