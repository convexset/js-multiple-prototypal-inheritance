MultiplePrototypalInheritance = require('./multiple-prototypal-inheritance.js')


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

console.log(
	'[' + new Date() + ']',
	Object.getOwnPropertyNames(MultiplePrototypalInheritance)
);

var p1 = MultiplePrototypalInheritance.createNode({
	a: 1
});
var p2 = MultiplePrototypalInheritance.createNode({
	a: 0,
	b: 2
});
var p3 = MultiplePrototypalInheritance.createNode({
	c: 3
}, [p1, p2]);

var p1_instance = p1.createLinkedObject();
var p2_instance = p2.createLinkedObject();
var p3_instance = p3.createLinkedObject();

console.log('p1', Object.getOwnPropertySymbols(p1));
console.log('');
console.log('');
console.log('p1', Object.getOwnPropertyNames(p1), dumpObject(Object.getPrototypeOf(p1_instance), '', '   '), '\n# Children: ', p1.childNodes.length);
console.log('p2', Object.getOwnPropertyNames(p1), dumpObject(Object.getPrototypeOf(p2_instance), '', '   '), '\n# Children: ', p2.childNodes.length);
console.log('p3', Object.getOwnPropertyNames(p1), dumpObject(Object.getPrototypeOf(p3_instance), '', '   '), '\n# Children: ', p3.childNodes.length);
console.log('');
console.log('');
p1.updatePrototype('a', 100);
p2.updatePrototypeViaDescriptor('b', {
	enumerable: true,
	writable: true,
	configurable: false,
	value: 999
});
console.log('');
console.log('');
console.log('p1', Object.getOwnPropertyNames(p1), dumpObject(Object.getPrototypeOf(p1_instance), '', '   '), '\n# Children: ', p1.childNodes.length);
console.log('p2', Object.getOwnPropertyNames(p1), dumpObject(Object.getPrototypeOf(p2_instance), '', '   '), '\n# Children: ', p2.childNodes.length);
console.log('p3', Object.getOwnPropertyNames(p1), dumpObject(Object.getPrototypeOf(p3_instance), '', '   '), '\n# Children: ', p3.childNodes.length);
console.log('');
console.log('');
p3.updatePrototypeViaDescriptor('b', {
	enumerable: true,
	writable: true,
	configurable: false,
	value: 500
});
console.log('');
console.log('');
console.log('p1', Object.getOwnPropertyNames(p1), dumpObject(Object.getPrototypeOf(p1_instance), '', '   '), '\n# Children: ', p1.childNodes.length);
console.log('p2', Object.getOwnPropertyNames(p1), dumpObject(Object.getPrototypeOf(p2_instance), '', '   '), '\n# Children: ', p2.childNodes.length);
console.log('p3', Object.getOwnPropertyNames(p1), dumpObject(Object.getPrototypeOf(p3_instance), '', '   '), '\n# Children: ', p3.childNodes.length);
console.log('');
console.log('');
p3.updatePrototype('c', 'now a string');
console.log('');
console.log('');
console.log('p1', Object.getOwnPropertyNames(p1), dumpObject(Object.getPrototypeOf(p1_instance), '', '   '), '\n# Children: ', p1.childNodes.length);
console.log('p2', Object.getOwnPropertyNames(p1), dumpObject(Object.getPrototypeOf(p2_instance), '', '   '), '\n# Children: ', p2.childNodes.length);
console.log('p3', Object.getOwnPropertyNames(p1), dumpObject(Object.getPrototypeOf(p3_instance), '', '   '), '\n# Children: ', p3.childNodes.length);

var p3_instance2 = p3.createLinkedObject();

// console.log((Object.getPrototypeOf(p3_instance) === Object.getPrototypeOf(p3_instance2)).toString())

console.log('---------------------------------------');