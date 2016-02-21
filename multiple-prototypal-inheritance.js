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

function isDate(o) {
	return Object.prototype.toString.call(o) === '[object Date]';
}

function deepCopy(o) {
	// types to "just return"
	if (['Function', 'Boolean', 'String', 'Number', 'RegExp', 'Symbol']
		.filter(function(t) {
			return Object.prototype.toString.call(o) === '[object ' + t + ']';
		})
		.length > 0) {
		return o;
	}
	if (isDate(o)) {
		return new Date(o.getTime());
	}
	if (Array.isArray(o)) {
		return o.map(x => x);
	}

	var oCopy = Object.create(Object.getPrototypeOf(o));
	Object.getOwnPropertyNames(o).forEach(function(key) {
		var props = Object.getOwnPropertyDescriptor(o, key);
		if (typeof props.value !== "undefined") {
			props.value = deepCopy(props.value);
		}
		Object.defineProperty(oCopy, key, props);
	});
	return oCopy;
}

function isUndefined(x) {
	return (typeof x === "undefined");
}

function applyDefaultOptions(options, defaultOptions) {
	if (!options) {
		options = {};
	}
	Object.keys(defaultOptions).forEach(function(optName) {
		if (isUndefined(options[optName])) {
			options[optName] = defaultOptions[optName];
		}
	});
}

// polyfill Array#includes
if (!Array.prototype.includes) {
	Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
		'use strict';
		var O = Object(this);
		var len = parseInt(O.length) || 0;
		if (len === 0) {
			return false;
		}
		var n = parseInt(arguments[1]) || 0;
		var k;
		if (n >= 0) {
			k = n;
		} else {
			k = len + n;
			if (k < 0) {
				k = 0;
			}
		}
		var currentElement;
		while (k < len) {
			currentElement = O[k];
			if (searchElement === currentElement ||
				(searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
				return true;
			}
			k++;
		}
		return false;
	};
}

// polyfill Array.isArray
if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
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

	function PrototypeTreeNode(newNodePrototype, parentNodes, options) {
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
			isPrototypeNodeOf: {
				enumerable: true,
				configurable: false,
				writeable: false,
				value: function isPrototypeOf(o) {
					return Object.getPrototypeOf(o) === _mergedPrototype;
				}
			},
			localPrototypeCopy: {
				enumerable: true,
				configurable: false,
				get: () => deepCopy(_localPrototype)
			},
			mergedPrototypeCopy: {
				enumerable: true,
				configurable: false,
				get: () => deepCopy(_mergedPrototype)
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
			setCustomSourceSelection: {
				enumerable: false,
				configurable: false,
				writable: false,
				value: function setCustomSourceSelection(customSourceSelection) {
					options.customSourceSelection = shallowCopy(customSourceSelection);
					this[REGENERATE_MERGED_PROTOTYPE]();
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
					if (!childNode || (Object.getPrototypeOf(childNode) !== PrototypeTreeNode.prototype)) {
						throw new Error('childNode should be of type PrototypeTreeNode.');
					}
					if ((this === childNode) || this.allAncestors.includes(childNode)) {
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
					var self = this;

					// Figure out from where to get what item: localPrototype items
					_itemSource = {};
					Object.getOwnPropertyNames(_localPrototype).forEach(function(itemName) {
						_itemSource[itemName] = -1;
					});

					// localPrototype items already stuffed into the mergedPrototype
					// in updatePrototypeViaDescriptor and "new PrototypeTreeNode"
					var priorItems = Object.getOwnPropertyNames(_localPrototype);

					// provide back link to this PrototypeTreeNode
					var propDescPTN = Object.getOwnPropertyDescriptor(_mergedPrototype, PROTOTYPE_TREE_NODE_KEY);
					if (!propDescPTN) {
						Object.defineProperty(_mergedPrototype, PROTOTYPE_TREE_NODE_KEY, {
							enumerable: false,
							configurable: false,
							writable: false,
							value: self
						});
					}
					priorItems.push(PROTOTYPE_TREE_NODE_KEY);

					// ... now for the rest
					self.parentNodes.forEach(function(parentNode, idx) {
						var parentMergedPrototype = parentNode.mergedPrototypeCopy;

						Object.getOwnPropertyNames(parentMergedPrototype).forEach(function(key) {
							if (priorItems.includes(key)) {
								return;
							}

							// is there is a custom selection...
							// ... which is valid (in parent list)
							// ... and the key is present in that mergedPrototype
							// ... and it's not this parent
							if (!!options.customSourceSelection[key] &&
								(self.parentNodes.includes(options.customSourceSelection[key])) &&
								!isUndefined(options.customSourceSelection[key].mergedPrototypeCopy[key]) &&
								(parentNode !== options.customSourceSelection[key])
							) {
								return;
							}

							var propDesc = Object.getOwnPropertyDescriptor(parentMergedPrototype, key);
							Object.defineProperty(_mergedPrototype, key, propDesc);
							priorItems.push(key);

							// Note where this item comes from
							_itemSource[key] = idx;
						});
					});

					// Notify Child Nodes
					self.childNodes.forEach(function(childNode) {
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
		allDescendants: {
			enumerable: false,
			configurable: false,
			get: function getAllDescendants() {
				var descendants = this.childNodes;
				this.childNodes.forEach(function(childNode) {
					descendants = descendants.concat(childNode.allDescendants);
				});
				return descendants;
			}
		},
		inheritsFrom: {
			enumerable: false,
			configurable: false,
			writable: false,
			value: function inheritsFrom(node) {
				return (node === this) || (this.allAncestors.indexOf(node) !== -1);
			}
		},
		isAncestorPrototypeNodeOf: {
			enumerable: false,
			configurable: false,
			writable: false,
			value: function isAncestorPrototypeNodeOf(o) {
				var thisAndAllDescendants = ([this]).concat(this.allDescendants);
				for (var i = 0; i < thisAndAllDescendants.length; i++) {
					var ptn = thisAndAllDescendants[i];
					if (ptn.isPrototypeNodeOf(o)) {
						return true;
					}
				}
				return false;
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
		value: function createNode(newNodePrototype, parentNodes, options) {
			if (!options) {
				options = {};
			}
			applyDefaultOptions(options, {
				customSourceSelection: {}
			});

			var opts = shallowCopy(options);
			if (!!opts.customSourceSelection) {
				opts.customSourceSelection = shallowCopy(opts.customSourceSelection);
			}

			return new PrototypeTreeNode(newNodePrototype, parentNodes, opts);
		}
	});

	Object.defineProperty(_mpi, 'PrototypeTreeNodePrototype', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: nodePrototype
	});

	return _mpi;
});