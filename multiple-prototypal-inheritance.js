function hasOwnProperty(o, key) {
	return Object.prototype.hasOwnProperty.call(o, key);
}

function dumpObject(o, name, sep) {
	var s = [];
	s.push((!!name ? ('[' + name + '] ') : "") + "{");
	Object.getOwnPropertyNames(o)
		.forEach(function(key) {
			var propDesc = Object.getOwnPropertyDescriptor(o, key);
			var attrs = [key];
			if (!propDesc.enumerable) {
				attrs.push('NE');
			}
			if (!propDesc.configurable) {
				attrs.push('NC');
			}
			if (!propDesc.writable) {
				attrs.push('NW');
			}
			s.push("  [" + attrs.join('|') + ']: ' + propDesc.value.toString());
		});
	s.push("}");
	return s.join(sep);
}

(function(name, factory) {
	"use strict";

	// Find the global object for export to both the browser and web workers.
	var globalObject = (typeof window === 'object') && window ||
		(typeof self === 'object') && self;

	// Setup for different environments
	if (typeof exports !== 'undefined') {
		// Node.js or CommonJS
		factory(exports);
	} else if (globalObject) {
		// Export globally even when using AMD for cases when this script
		// is loaded with others that may still expect a global.
		globalObject[name] = factory({});

		// Register with AMD.
		if (typeof define === 'function' && define.amd) {
			define([], function() {
				return globalObject[name];
			});
		}
	}
})('MultiplePrototypalInheritance', function(_mpi) {

	var REGISTER_CHILD = Symbol('MultiplePrototypalInheritance/registerChild');
	var REGENERATE_MERGED_PROTOTYPE = Symbol('MultiplePrototypalInheritance/regenerateMergedPrototype');

	var id = 0;

	function PrototypeTreeNode(newNodePrototype, parentNodes) {
		if (typeof newNodePrototype === "undefined") {
			newNodePrototype = Object.create(null);
		}
		if (typeof parentNodes === "undefined") {
			parentNodes = [];
		}

		if (Array.isArray(parentNodes)) {
			parentNodes.forEach(function(parentNode) {
				if (Object.getPrototypeOf(parentNode) !== PrototypeTreeNode.prototype) {
					throw new Error('All parent items should be of type PrototypeTreeNode.');
				}
			});
		} else {
			throw new Error('Parent items should be an array of PrototypeTreeNode\'s.');
		}

console.log('~')
id += 1;
console.log("[Creation] Id: ", id, newNodePrototype, parentNodes);
var _id = id;

		var _mergedPrototype = Object.create(null);
		var _localPrototype = Object.create(null);
		Object.getOwnPropertyNames(newNodePrototype).forEach(function(key) {
			var propDesc = Object.getOwnPropertyDescriptor(newNodePrototype, key);
console.log(" - " + key + ":", propDesc)
			Object.defineProperty(_mergedPrototype, key, propDesc);
			Object.defineProperty(_localPrototype, key, propDesc);
		});

		var _parentNodes = parentNodes.map(x => x);
		var _childNodes = [];

		var node = Object.create(nodePrototype, {
_id: {enumerable: true, configurable:true, get: () => _id},
			localPrototype: {
				enumerable: true,
				configurable: false,
				get: () => _localPrototype
			},
			mergedPrototype: {
				enumerable: true,
				configurable: false,
				get: () => _mergedPrototype
			},
			parentNodes: {
				enumerable: true,
				configurable: false,
				get: () => _parentNodes.map(x => x)
			},
			childNodes: {
				enumerable: true,
				configurable: false,
				get: () => _childNodes.map(x => x)
			},
			removeFromPrototype: {
				enumerable: false,
				configurable: false,
				writable: false,
				value: function removeFromPrototype(key) {
					if (hasOwnProperty(this.localPrototype, key)) {
						delete localPrototype[key];
						delete mergedPrototype[key];
						this[REGENERATE_MERGED_PROTOTYPE]();
					} else {
						throw new Error('No such property.');
					}
				}
			},
			updatePrototype: {
				enumerable: false,
				configurable: false,
				writable: false,
				value: function updatePrototype(key, value) {
					var newPropDesc = {
						enumerable: false,
						configurable: false,
						writable: false,
						value: value
					}
					this.updatePrototypeViaDescriptor(key, newPropDesc);
				}
			},
			updatePrototypeViaDescriptor: {
				enumerable: false,
				configurable: false,
				writable: false,
				value: function updatePrototypeViaDescriptor(key, propDesc) {
					var currPropDesc = Object.getOwnPropertyDescriptor(_localPrototype, key);

					if (currPropDesc && !currPropDesc.configurable) {
						throw new Error(key + ' is not configurable.');
					}

console.log("[updatePrototypeViaDescriptor] Id: ", _id, '; [' + key + '] ', currPropDesc, '-->', propDesc)
console.log(dumpObject(_localPrototype, '_localPrototype', '  '));
console.log(dumpObject(_mergedPrototype, '_mergedPrototype', '  '));
console.log("[" + this._id + "] # parents:", this.parentNodes.length);
console.log("[" + this._id + "] # children:", this.childNodes.length);
					Object.defineProperty(_localPrototype, key, propDesc);
					Object.defineProperty(_mergedPrototype, key, propDesc);
console.log(dumpObject(_localPrototype, '_localPrototype', '  '));
console.log(dumpObject(_mergedPrototype, '_mergedPrototype', '  '));
console.log("[" + this._id + "] # parents:", this.parentNodes.length);
console.log("[" + this._id + "] # children:", this.childNodes.length);
					this[REGENERATE_MERGED_PROTOTYPE]();
				}
			},
			[REGISTER_CHILD]: {
				enumerable: false,
				configurable: false,
				writable: false,
				value: function registerChild(childNode) {
console.log("[registerChild] Id: ", _id, node)
console.log(dumpObject(_localPrototype, '_localPrototype', '  '));
console.log(dumpObject(_mergedPrototype, '_mergedPrototype', '  '));
console.log("[" + this._id + "] # parents:", this.parentNodes.length);
console.log("[" + this._id + "] # children:", this.childNodes.length);
					if (!!childNode && (Object.getPrototypeOf(childNode) !== PrototypeTreeNode.prototype)) {
						throw new Error('childNode should be of type PrototypeTreeNode.');
					}
					if ((this === childNode) || (this.allAncestors.indexOf(childNode) !== -1)) {
						throw new Error('Circular dependency');
					}
					_childNodes.push(childNode);
				}
			},
			[REGENERATE_MERGED_PROTOTYPE]: {
				enumerable: false,
				configurable: false,
				writable: false,
				value: function regenerateMergedPrototype() {
					var parentMergedPrototypes = this.parentNodes.map(parentNode => parentNode.mergedPrototype);
console.log("[regenerateMergedPrototype] Id: ", _id, parentMergedPrototypes.map(mp => dumpObject(mp, '', '  ')), '; #PN: ' + this.parentNodes.length, ', #CN: ' + this.childNodes.length)
console.log(dumpObject(_localPrototype, '_localPrototype', '  '));
console.log(dumpObject(_mergedPrototype, '_mergedPrototype', '  '));
console.log("[" + this._id + "] # parents:", this.parentNodes.length);
console.log("[" + this._id + "] # children:", this.childNodes.length);
					var priorItems = Object.getOwnPropertyNames(_localPrototype);
console.log("[init merged] id: " + _id, 'LP:', dumpObject(_localPrototype, '', '  '), 'MP:', dumpObject(_mergedPrototype, '', '  '))
					parentMergedPrototypes.forEach(function(parentMergedPrototype) {
console.log(" * ", dumpObject(parentMergedPrototype, '', '  '), priorItems)
						Object.getOwnPropertyNames(parentMergedPrototype).forEach(function(key) {
							if (priorItems.indexOf(key) !== -1) {
								return;
							}
							var propDesc = Object.getOwnPropertyDescriptor(parentMergedPrototype, key);
console.log("    - " + key + ":", propDesc)
							Object.defineProperty(_mergedPrototype, key, propDesc);
							priorItems.push(key);
						});
					});
	
console.log("[final merged] id: " + _id, dumpObject(node.mergedPrototype, '', '  '))
					// Notify Child Nodes
					this.childNodes.forEach(function(childNode) {
						childNode[REGENERATE_MERGED_PROTOTYPE]();
					});
console.log('~')
				}
			},
		});

		node.parentNodes.forEach(function(parentNode) {
			parentNode[REGISTER_CHILD](node);
		});
		node[REGENERATE_MERGED_PROTOTYPE]();

		return node;
	}

	var nodePrototype = Object.create(null, {
		createLinkedObject: {
			enumerable: false,
			configurable: false,
			writable: false,
			value: function createLinkedObject() {
				return Object.create(this.mergedPrototype);
			}
		},
		allAncestors: {
			enumerable: false,
			configurable: false,
			get: function getAllAncestors() {
				var ancestors = this.parentNodes;
				this.parentNodes.forEach(function(parentNode) {
					ancestors = ancestors.concat(parentNode.allAncestors);
				});
				return ancestors;
			}
		},
		inheritsFrom: {
			enumerable: false,
			configurable: false,
			get: function inheritsFrom(node) {
				return this.allAncestors.indexOf(node) !== -1;
			}
		}
	});
	PrototypeTreeNode.prototype = nodePrototype;

	Object.defineProperty(_mpi, 'createNode', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function createNode(newNodePrototype, parentNodes) {
			return new PrototypeTreeNode(newNodePrototype, parentNodes);
		}
	});

	return _mpi;
});