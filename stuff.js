/* global MultiplePrototypalInheritance: true */

(function() {
	function dumpObject(o, name, sep) {
		if (typeof o !== "object") {
			return "[" + (!!name ? (name + " ") : "") + "NOT AN OBJECT]";
		}
		var s = [];
		Object.getOwnPropertyNames(o)
			.forEach(function(key) {
				if (key === "___prototype_tree_node___") {
					return;
				}

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

				var zz = '';
				var src;
				if (!!o.___prototype_tree_node___) {
					src = o.___prototype_tree_node___.itemSource(key);
					zz = ' (Src: ' + (src === -1 ? 'Here' : src) + ')';
				}

				s.push("  [" + attrs.join('|') + ']: ' + propDesc.value.toString() + zz);
			});

		return (!!name ? ('[' + name + '] ') : "") + "{\n" + s.join(sep) + "\n}";
	}

	var p1 = MultiplePrototypalInheritance.createNode({
		a: 1,
		f: function fn(x) {
			return x + (this.b || this.a)
		}
	});
	var p2 = MultiplePrototypalInheritance.createNode({
		a: 0,
		b: 2
	});
	var p3 = MultiplePrototypalInheritance.createNode({
		c: 3
	}, [p1, p2], {
		customSourceSelection: {
			a: p2
		}
	});
	var p4 = MultiplePrototypalInheritance.createNode({
		x: "x"
	});
	var p5 = MultiplePrototypalInheritance.createNode({
		y: "y"
	}, [p3, p4]);

	var p1_instance = p1.createLinkedObject();
	var p2_instance = p2.createLinkedObject();
	var p3_instance = p3.createLinkedObject();
	var p4_instance = p4.createLinkedObject();
	var p5_instance = p5.createLinkedObject();

	console.log('p1', Object.getOwnPropertySymbols(p1));
	console.log('');
	console.log(' ~~~ ');
	console.log('');
	console.log('p1', dumpObject(p1.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p1_instance), '', '   '), '\n# Children: ', p1.childNodes.length);
	console.log('p2', dumpObject(p2.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p2_instance), '', '   '), '\n# Children: ', p2.childNodes.length);
	console.log('p3', dumpObject(p3.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p3_instance), '', '   '), '\n# Children: ', p3.childNodes.length);
	console.log('p4', dumpObject(p4.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p4_instance), '', '   '), '\n# Children: ', p4.childNodes.length);
	console.log('p5', dumpObject(p5.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p5_instance), '', '   '), '\n# Children: ', p5.childNodes.length);
	console.log('p1_instance.f(10000):', p1_instance.f(10000));
	console.log('p3_instance.f(10000):', p3_instance.f(10000));
	console.log('');
	console.log('p1.a <-- 100');
	p1.updatePrototype('a', 100);
	console.log('p2.b <-- 999');
	p2.updatePrototypeViaDescriptor('b', {
		enumerable: true,
		writable: true,
		configurable: true,
		value: 999
	});
	console.log('p3#customSourceSelection <-- {}');
	p3.setCustomSourceSelection({});

	console.log('');
	console.log('p1', dumpObject(p1.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p1_instance), '', '   '), '\n# Children: ', p1.childNodes.length);
	console.log('p2', dumpObject(p2.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p2_instance), '', '   '), '\n# Children: ', p2.childNodes.length);
	console.log('p3', dumpObject(p3.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p3_instance), '', '   '), '\n# Children: ', p3.childNodes.length);
	console.log('p4', dumpObject(p4.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p4_instance), '', '   '), '\n# Children: ', p4.childNodes.length);
	console.log('p5', dumpObject(p5.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p5_instance), '', '   '), '\n# Children: ', p5.childNodes.length);
	console.log('p1_instance.f(10000):', p1_instance.f(10000));
	console.log('p3_instance.f(10000):', p3_instance.f(10000));
	console.log('');
	console.log('p2.a <-- 888');
	p2.updatePrototypeViaDescriptor('a', {
		enumerable: true,
		writable: true,
		configurable: true,
		value: 888
	});
	console.log('p3.b <-- 500');
	p3.updatePrototypeViaDescriptor('b', {
		enumerable: true,
		writable: true,
		configurable: false,
		value: 500
	});
	console.log('');
	console.log('p1', dumpObject(p1.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p1_instance), '', '   '), '\n# Children: ', p1.childNodes.length);
	console.log('p2', dumpObject(p2.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p2_instance), '', '   '), '\n# Children: ', p2.childNodes.length);
	console.log('p3', dumpObject(p3.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p3_instance), '', '   '), '\n# Children: ', p3.childNodes.length);
	console.log('p4', dumpObject(p4.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p4_instance), '', '   '), '\n# Children: ', p4.childNodes.length);
	console.log('p5', dumpObject(p5.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p5_instance), '', '   '), '\n# Children: ', p5.childNodes.length);
	console.log('p1_instance.f(10000):', p1_instance.f(10000));
	console.log('p3_instance.f(10000):', p3_instance.f(10000));
	console.log('');
	console.log('p2.a removed');
	p2.removeFromNodePrototype('a');
	console.log('p3.c <-- (some string)');
	p3.updatePrototype('c', 'now a string');
	console.log('');
	console.log('p1', dumpObject(p1.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p1_instance), '', '   '), '\n# Children: ', p1.childNodes.length);
	console.log('p2', dumpObject(p2.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p2_instance), '', '   '), '\n# Children: ', p2.childNodes.length);
	console.log('p3', dumpObject(p3.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p3_instance), '', '   '), '\n# Children: ', p3.childNodes.length);
	console.log('p4', dumpObject(p4.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p4_instance), '', '   '), '\n# Children: ', p4.childNodes.length);
	console.log('p5', dumpObject(p5.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p5_instance), '', '   '), '\n# Children: ', p5.childNodes.length);
	console.log('p1_instance.f(10000):', p1_instance.f(10000));
	console.log('p3_instance.f(10000):', p3_instance.f(10000));
	console.log('');

	var p3_instance2 = p3.createLinkedObject();

	function ConstructP3(b) {
		this.b = b;
	}

	console.log('var p3_instance3 = p3.constructObject(ConstructP3, 777);');
	var p3_instance3 = p3.constructObject(ConstructP3, 777);

	console.log('p3_instance2.f(10000):', p3_instance2.f(10000));
	console.log('p3_instance3.f(10000):', p3_instance3.f(10000));

	console.log('');
	console.log('p2.b removed');
	p2.removeFromNodePrototype('b');

	console.log('p1', dumpObject(p1.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p1_instance), '', '   '), '\n# Children: ', p1.childNodes.length);
	console.log('p2', dumpObject(p2.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p2_instance), '', '   '), '\n# Children: ', p2.childNodes.length);
	console.log('p3', dumpObject(p3.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p3_instance), '', '   '), '\n# Children: ', p3.childNodes.length);
	console.log('p4', dumpObject(p4.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p4_instance), '', '   '), '\n# Children: ', p4.childNodes.length);
	console.log('p5', dumpObject(p5.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p5_instance), '', '   '), '\n# Children: ', p5.childNodes.length);
	console.log('p3_instance.f(10000):', p3_instance.f(10000));
	console.log('p3_instance2.f(10000):', p3_instance2.f(10000));
	console.log('p3_instance3.f(10000):', p3_instance3.f(10000));

	console.log('');
	var p3Proto = Object.getPrototypeOf(p3_instance);
	console.log('p3_proto:', dumpObject(p3.localPrototypeCopy));
	console.log('p3 instances have proto p3:', [p3_instance, p3_instance2, p3_instance3].map(x => p3.isPrototypeNodeOf(x)).toString())
	console.log('p3 instances have same prototype:', ((Object.getPrototypeOf(p3_instance2) === p3Proto) && (Object.getPrototypeOf(p3_instance3) === p3Proto)).toString())

	console.log('');
	console.log('p1.isAncestorPrototypeNodeOf(p1_instance): ' + p1.isAncestorPrototypeNodeOf(p1_instance).toString());
	console.log('p2.isAncestorPrototypeNodeOf(p1_instance): ' + p2.isAncestorPrototypeNodeOf(p1_instance).toString());
	console.log('p3.isAncestorPrototypeNodeOf(p1_instance): ' + p3.isAncestorPrototypeNodeOf(p1_instance).toString());
	console.log('p1.isPrototypeNodeOf(p1_instance): ' + p1.isPrototypeNodeOf(p1_instance).toString());
	console.log('p2.isPrototypeNodeOf(p1_instance): ' + p2.isPrototypeNodeOf(p1_instance).toString());
	console.log('p3.isPrototypeNodeOf(p1_instance): ' + p3.isPrototypeNodeOf(p1_instance).toString());

	console.log('');
	console.log('p1.isAncestorPrototypeNodeOf(p2_instance): ' + p1.isAncestorPrototypeNodeOf(p2_instance).toString());
	console.log('p2.isAncestorPrototypeNodeOf(p2_instance): ' + p2.isAncestorPrototypeNodeOf(p2_instance).toString());
	console.log('p3.isAncestorPrototypeNodeOf(p2_instance): ' + p3.isAncestorPrototypeNodeOf(p2_instance).toString());
	console.log('p1.isPrototypeNodeOf(p2_instance): ' + p1.isPrototypeNodeOf(p2_instance).toString());
	console.log('p2.isPrototypeNodeOf(p2_instance): ' + p2.isPrototypeNodeOf(p2_instance).toString());
	console.log('p3.isPrototypeNodeOf(p2_instance): ' + p3.isPrototypeNodeOf(p2_instance).toString());

	console.log('');
	console.log('p1.isAncestorPrototypeNodeOf(p3_instance): ' + p1.isAncestorPrototypeNodeOf(p3_instance).toString());
	console.log('p2.isAncestorPrototypeNodeOf(p3_instance): ' + p2.isAncestorPrototypeNodeOf(p3_instance).toString());
	console.log('p3.isAncestorPrototypeNodeOf(p3_instance): ' + p3.isAncestorPrototypeNodeOf(p3_instance).toString());
	console.log('p1.isPrototypeNodeOf(p3_instance): ' + p1.isPrototypeNodeOf(p3_instance).toString());
	console.log('p2.isPrototypeNodeOf(p3_instance): ' + p2.isPrototypeNodeOf(p3_instance).toString());
	console.log('p3.isPrototypeNodeOf(p3_instance): ' + p3.isPrototypeNodeOf(p3_instance).toString());


	console.log('---------------------------------------');
})();