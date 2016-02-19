function hasOwnProperty(o, key) {
	return Object.prototype.hasOwnProperty.call(o, key);
}

function shallowCopy(o) {
	var oCopy = Object.create(Object.getPrototypeOf(o));
	Object.getOwnPropertyNames(o).forEach(function(key) {
		Object.defineProperty(oCopy, key, Object.getOwnPropertyDescriptor(o, key));
	});
	return oCopy;
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
	var PROTOTYPE_TREE_NODE_KEY = "___prototype_tree_node___";

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

		// Private Data
		var _mergedPrototype = Object.create(null);
		var _localPrototype = Object.create(null);
		var _parentNodes = parentNodes.map(x => x);
		var _childNodes = [];
		var _itemSource = {};

		Object.getOwnPropertyNames(newNodePrototype).forEach(function(key) {
			var propDesc = Object.getOwnPropertyDescriptor(newNodePrototype, key);
			Object.defineProperty(_mergedPrototype, key, propDesc);
			Object.defineProperty(_localPrototype, key, propDesc);
		});

		var node = Object.create(nodePrototype, {
			isPrototypeOf: {
				enumerable: true,
				configurable: false,
				writeable: false,
				value: function isPrototypeOf(o) {
					return Object.getPrototypeOf(o) === _mergedPrototype
				}
			},
			localPrototypeCopy: {
				enumerable: true,
				configurable: false,
				get: () => shallowCopy(_localPrototype)
			},
			mergedPrototypeCopy: {
				enumerable: true,
				configurable: false,
				get: () => shallowCopy(_mergedPrototype)
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
			createLinkedObject: {
				enumerable: false,
				configurable: false,
				writable: false,
				value: function createLinkedObject() {
					return Object.create(_mergedPrototype);
				}
			},
			itemSource: {
				enumerable: false,
				configurable: false,
				writable: false,
				value: function itemSource(key) {
					return _itemSource[key];
				}
			},
			removeFromNodePrototype: {
				enumerable: false,
				configurable: false,
				writable: false,
				value: function removeFromNodePrototype(key) {
					var currPropDesc = Object.getOwnPropertyDescriptor(_localPrototype, key);
					if (!!currPropDesc) {
						if (!currPropDesc.configurable) {
							throw new Error(key + ' is not configurable.');
						}
						delete _localPrototype[key];
						delete _mergedPrototype[key];
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
					};
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

					Object.defineProperty(_localPrototype, key, propDesc);
					Object.defineProperty(_mergedPrototype, key, propDesc);
					this[REGENERATE_MERGED_PROTOTYPE]();
				}
			},
			[REGISTER_CHILD]: {
				enumerable: false,
				configurable: false,
				writable: false,
				value: function registerChild(childNode) {
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
					var parentMergedPrototypes = this.parentNodes.map(parentNode => parentNode.mergedPrototypeCopy);
					var priorItems = Object.getOwnPropertyNames(_localPrototype);

					var propDescPTN = Object.getOwnPropertyDescriptor(_mergedPrototype, PROTOTYPE_TREE_NODE_KEY);
					if (!propDescPTN) {
						Object.defineProperty(_mergedPrototype, PROTOTYPE_TREE_NODE_KEY, {
							enumerable: false,
							configurable: false,
							writable: false,
							value: this
						});
					}

					_itemSource = {};
					priorItems.forEach(function(key) {
						_itemSource[key] = -1;
					});
					priorItems.push(PROTOTYPE_TREE_NODE_KEY);

					parentMergedPrototypes.forEach(function(parentMergedPrototype, idx) {
						Object.getOwnPropertyNames(parentMergedPrototype).forEach(function(key) {
							if (priorItems.indexOf(key) !== -1) {
								return;
							}
							var propDesc = Object.getOwnPropertyDescriptor(parentMergedPrototype, key);
							Object.defineProperty(_mergedPrototype, key, propDesc);
							priorItems.push(key);
							_itemSource[key] = idx;
						});
					});

					// Notify Child Nodes
					this.childNodes.forEach(function(childNode) {
						childNode[REGENERATE_MERGED_PROTOTYPE]();
					});
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
			writable: false,
			value: function inheritsFrom(node) {
				return this.allAncestors.indexOf(node) !== -1;
			}
		},
		constructObject: {
			enumerable: false,
			configurable: false,
			writable: false,
			value: function constructObject(constructor) {
				var args = Array.prototype.slice.call(arguments, 1);
				var newObject = this.createLinkedObject();
				constructor.apply(newObject, args);
				return newObject;
			}
		},
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