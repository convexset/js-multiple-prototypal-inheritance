# MultiplePrototypalInheritance

**Consider this package to be deprecated. Use the version [on npm](https://www.npmjs.com/package/multiple-prototypal-inheritance).**

This package provides for a form of multiple-prototypal inheritance for JavaScript objects.

## Description

In particular:
 - each "class" that inherits from one or more prototypes (which themselves may inherit from other prototypes) is a `PrototypeTreeNode` at the terminal end of an "inverted tree" of `PrototypeTreeNode`'s
 - `PrototypeTreeNode`'s contain "local" prototype elements and may also inherit from none (i.e.: `null`) or some number of other prototypes encapsulated in `PrototypeTreeNode`'s
 - no reference copying or method copying is done in object instantiation
 - whenever a change is made to a `PrototypeTreeNode`, all instances whose prototypes "inherit" from that `PrototypeTreeNode` will have instant access to the changes

The tool may be used to create simple (empty) prototype-linked objects, or to perform more "active" instantiation by creating such (empty) prototype-linked objects and then executing a constructor function binding the newly created prototype-linked objects as the execution context (almost like `new ClassyObject(arg1, arg2, ..., argn)`).


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

- [Description](#description)
- [Install](#install)
  - [Meteor Package](#meteor-package)
  - [npm Package](#npm-package)
- [Usage:](#usage)
  - [By Example](#by-example)
  - [`PrototypeTreeNode` Creation](#prototypetreenode-creation)
  - [Modifying "Local Prototype" Entries](#modifying-local-prototype-entries)
  - ["Inheritance Order"](#inheritance-order)
  - [The Prototype Tree](#the-prototype-tree)
  - [The Prototype on the Prototype Tree Node](#the-prototype-on-the-prototype-tree-node)
- [An Extended Example](#an-extended-example)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

### Meteor Package

This is available as [`convexset:multiple-prototypal-inheritance`](https://atmospherejs.com/convexset/multiple-prototypal-inheritance) on [Atmosphere](https://atmospherejs.com/). (Install with `meteor add convexset:multiple-prototypal-inheritance`.)

### npm Package

... also available as [`multiple-prototypal-inheritance`](https://www.npmjs.com/package/multiple-prototypal-inheritance) on [npm](https://www.npmjs.com/). (Install with `npm install multiple-prototypal-inheritance`.)

## Usage:

### By Example
 
We will create the following inheritance tree of `T_ab_c`, which inherits from
 - `T_a_b` (which contains properties `c` and `d`) inherits from
   * `T_a` (which contains properties `a`, `c` and `f`, but `c` here is not used in `T_a_b` because `T_a_b` has a local property `c`)
   * `T_b` (which contains properties `a` and `b`; but `a` here is not used in `T_a_b` because it appears in `T_a` which is earlier in the list of "parents")
 - `T_c` (which contains property `e`)

So...

```javascript
T_a = MultiplePrototypalInheritance.createNode({
    a: 1,
    c: "not used",
    d: "used",
    f: function fn(x) { return x + (this.b || this.a) }
});

T_b = MultiplePrototypalInheritance.createNode({
    b: 42,
    a: 10
});

T_a_b = MultiplePrototypalInheritance.createNode({
    c: 3
}, [T_a, T_b]);  // gets a from T_a because.... it's first.

T_c = MultiplePrototypalInheritance.createNode({
    e: Math.E
});

T_ab_c = MultiplePrototypalInheritance.createNode({}, [T_a_b, T_c]);
```

Here's how to create instances....

```javascript
var instance = T_a_b.createLinkedObject();
```

... which gives a plain linked object...

Alternatively, suppose you have a constructor `Construct_T_a_b` like....

```javascript
function Construct_T_a_b(name, stuff) {
    this.name = name;
    this.stuff = stuff;
}
```

... you can do...

```javascript
instance = T_a_b.constructObject(Construct_T_a_b, "some name", "some stuff");
```

Supposing one has 1000000 instances in various places, one can do:

```javascript
T_a.updatePrototype('a', 100);
```

... or...

```javascript
T_b.updatePrototypeViaDescriptor('b', {
  enumerable: true,
  writable: true,
  configurable: false,
  value: 999
});
```

... or...

```javascript
T_a_b.removeFromNodePrototype('c');
```

... and all the instances that are derived from the respective `PrototypeTreeNode`'s will have access to the new prototype elements. Immediately. No reference changes or copying.

### `PrototypeTreeNode` Creation

Let's revisit creation. Given a list of parent `PrototypeTreeNode`'s localPrototypeContentsFor_Node_a_b

```javascript
Node_a_b = MultiplePrototypalInheritance.createNode(
    localPrototypeContentsFor_Node_a_b,
    [Node_a, Node_b],
    {
        customSourceSelection: {
            property_a: Node_b
        }  // supposing that property_a exists on both Node_a and Node_b
           // (but not in localPrototypeContentsFor_Node_a_b) then the
           // "merged prototype" will take the property from Node_b as
           // opposed to Node_a, as is the default behavior
    }
);
```

The priority for inclusion of items in the "merged prototype" that instances are linked to is as follows:
 - "local prototype" contents
 - source selection list when specified in options
 - order in the list of parent `PrototypeTreeNode`'s (e.g.: from `Node_a` first, in this case)

### Modifying "Local Prototype" Entries

"Local prototype" entries can be changed. There are two operation types here:
 - create/update (define/redefine)
 - remove

Here are examples:
```javascript
SomePrototypeTreeNode.updatePrototype('a', 100);

SomePrototypeTreeNode.updatePrototypeViaDescriptor('b', {
    enumerable: true,
    writable: true,
    configurable: true,
    value: 999
});

SomePrototypeTreeNode.removeFromNodePrototype('a');
```

Note that exceptions will be thrown in the event that an attempt is made to update/remove a non-configurable property.

For more information on the appropriate notation for `updatePrototypeViaDescriptor`, see [this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) for more information.
 
### "Inheritance Order"

The options for `MultiplePrototypalInheritance.createNode` allows one to set a "`customSourceSelection`" to identify from where to inherit what. This is how to replace that selection with a new one:

```javascript
SomePrototypeTreeNode.setCustomSourceSelection({
    property_A: node_Z,
    property_B: node_Y,
    property_C: node_X,
});
```

### The Prototype Tree

The following methods help one to discern the relationship between `PrototypeTreeNode`'s and instances
 - `SomePrototypeTreeNode.allAncestors`: all ancestors of this `PrototypeTreeNode`
 - `SomePrototypeTreeNode.allDescendants`: all descendants of this `PrototypeTreeNode`
 - `SomePrototypeTreeNode.parentNodes`: direct parent nodes of this `PrototypeTreeNode`
 - `SomePrototypeTreeNode.childNodes`: direct child nodes of this `PrototypeTreeNode`
 - `SomePrototypeTreeNode.inheritsFrom(OtherPrototypeTreeNode)`: returns whether `SomePrototypeTreeNode` inherits from `OtherPrototypeTreeNode`
 - `SomePrototypeTreeNode.isPrototypeNodeOf(instance)`: returns whether `SomePrototypeTreeNode` was used to create `instance`
 - `SomePrototypeTreeNode.isAncestorPrototypeNodeOf(instance)`: returns whether `SomePrototypeTreeNode` was used to create `instance` or is an ancestor of such a `PrototypeTreeNode`

### The Prototype on the Prototype Tree Node

To obtain the information on the prototypes...
 - `SomePrototypeTreeNode.localPrototypeCopy`: returns a copy of the "local prototype"
 - `SomePrototypeTreeNode.mergedPrototypeCopy`: returns a copy of the "merged prototype"

## An Extended Example

```javascript
// for dumping objects with "nuanced" property descriptors
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

// Set some stuff up...
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
// inherit from p1 and p2 and select a from p2
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
// inherit from p3 and p4
var p5 = MultiplePrototypalInheritance.createNode({
    y: "y"
}, [p3, p4]);

// create linked objects (as in Object.create(proto))
var p1_instance = p1.createLinkedObject();
var p2_instance = p2.createLinkedObject();
var p3_instance = p3.createLinkedObject();
var p4_instance = p4.createLinkedObject();
var p5_instance = p5.createLinkedObject();

console.log('');
console.log('p1', dumpObject(p1.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p1_instance), '', '   '), '\n# Children: ', p1.childNodes.length);
/*
p1 {
  [a]: 1,  [f]: function fn(x) {
            return x + (this.b || this.a)
        }
} {
  [a]: 1 (Src: Here)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: Here)
} 
# Children:  1
*/
console.log('p2', dumpObject(p2.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p2_instance), '', '   '), '\n# Children: ', p2.childNodes.length);
/*
p2 {
  [a]: 0,  [b]: 2
} {
  [a]: 0 (Src: Here)     [b]: 2 (Src: Here)
} 
# Children:  1
*/
console.log('p3', dumpObject(p3.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p3_instance), '', '   '), '\n# Children: ', p3.childNodes.length);
/*
p3 {
  [c]: 3
} {
  [c]: 3 (Src: Here)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: 0)     [a]: 0 (Src: 1)     [b]: 2 (Src: 1)
} 
# Children:  1
*/
console.log('p4', dumpObject(p4.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p4_instance), '', '   '), '\n# Children: ', p4.childNodes.length);
/*
p4 {
  [x]: x
} {
  [x]: x (Src: Here)
} 
# Children:  1
*/
console.log('p5', dumpObject(p5.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p5_instance), '', '   '), '\n# Children: ', p5.childNodes.length);
/*
p5 {
  [y]: y
} {
  [y]: y (Src: Here)     [c]: 3 (Src: 0)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: 0)     [a]: 0 (Src: 0)     [b]: 2 (Src: 0)     [x]: x (Src: 1)
} 
# Children:  0
*/
console.log('p1_instance.f(10000):', p1_instance.f(10000));
console.log('p3_instance.f(10000):', p3_instance.f(10000));
/*
p1_instance.f(10000): 10001
p3_instance.f(10000): 10002
*/

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
/*
p1 {
  [a|NE|NC|NW]: 100,  [f]: function fn(x) {
            return x + (this.b || this.a)
        }
} {
  [a|NE|NC|NW]: 100 (Src: Here)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: Here)
} 
# Children:  1
*/
console.log('p2', dumpObject(p2.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p2_instance), '', '   '), '\n# Children: ', p2.childNodes.length);
/*
p2 {
  [a]: 0,  [b]: 999
} {
  [a]: 0 (Src: Here)     [b]: 999 (Src: Here)
} 
# Children:  1
*/
console.log('p3', dumpObject(p3.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p3_instance), '', '   '), '\n# Children: ', p3.childNodes.length);
/*
p3 {
  [c]: 3
} {
  [c]: 3 (Src: Here)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: 0)     [a|NE|NC|NW]: 100 (Src: 0)     [b]: 999 (Src: 1)
} 
# Children:  1
*/
console.log('p4', dumpObject(p4.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p4_instance), '', '   '), '\n# Children: ', p4.childNodes.length);
/*
p4 {
  [x]: x
} {
  [x]: x (Src: Here)
} 
# Children:  1
*/
console.log('p5', dumpObject(p5.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p5_instance), '', '   '), '\n# Children: ', p5.childNodes.length);
/*
p5 {
  [y]: y
} {
  [y]: y (Src: Here)     [c]: 3 (Src: 0)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: 0)     [a|NE|NC|NW]: 100 (Src: 0)     [b]: 999 (Src: 0)     [x]: x (Src: 1)
} 
# Children:  0
*/
console.log('p1_instance.f(10000):', p1_instance.f(10000));
console.log('p3_instance.f(10000):', p3_instance.f(10000));
/*
p1_instance.f(10000): 10100
p3_instance.f(10000): 10999
*/
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
/*
p1 {
  [a|NE|NC|NW]: 100,  [f]: function fn(x) {
            return x + (this.b || this.a)
        }
} {
  [a|NE|NC|NW]: 100 (Src: Here)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: Here)
} 
# Children:  1
*/
console.log('p2', dumpObject(p2.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p2_instance), '', '   '), '\n# Children: ', p2.childNodes.length);
/*
p2 {
  [a]: 888,  [b]: 999
} {
  [a]: 888 (Src: Here)     [b]: 999 (Src: Here)
} 
# Children:  1
*/
console.log('p3', dumpObject(p3.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p3_instance), '', '   '), '\n# Children: ', p3.childNodes.length);
/*
p3 {
  [c]: 3,  [b|NC]: 500
} {
  [c]: 3 (Src: Here)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: 0)     [a|NE|NC|NW]: 100 (Src: 0)     [b|NC]: 500 (Src: Here)
} 
# Children:  1
*/
console.log('p4', dumpObject(p4.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p4_instance), '', '   '), '\n# Children: ', p4.childNodes.length);
/*
p4 {
  [x]: x
} {
  [x]: x (Src: Here)
} 
# Children:  1
*/
console.log('p5', dumpObject(p5.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p5_instance), '', '   '), '\n# Children: ', p5.childNodes.length);
/*
p5 {
  [y]: y
} {
  [y]: y (Src: Here)     [c]: 3 (Src: 0)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: 0)     [a|NE|NC|NW]: 100 (Src: 0)     [b|NC]: 500 (Src: 0)     [x]: x (Src: 1)
} 
# Children:  0
*/
console.log('p1_instance.f(10000):', p1_instance.f(10000));
console.log('p3_instance.f(10000):', p3_instance.f(10000));
/*
p1_instance.f(10000): 10100
p3_instance.f(10000): 10500
*/
console.log('');

console.log('p2.a removed');
p2.removeFromNodePrototype('a');
console.log('p3.c <-- (some string)');
p3.updatePrototype('c', 'now a string');
console.log('');

console.log('p1', dumpObject(p1.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p1_instance), '', '   '), '\n# Children: ', p1.childNodes.length);
/*
p1 {
  [a|NE|NC|NW]: 100,  [f]: function fn(x) {
            return x + (this.b || this.a)
        }
} {
  [a|NE|NC|NW]: 100 (Src: Here)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: Here)
} 
# Children:  1
*/
console.log('p2', dumpObject(p2.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p2_instance), '', '   '), '\n# Children: ', p2.childNodes.length);
/*
p2 {
  [b]: 999
} {
  [b]: 999 (Src: Here)
} 
# Children:  1
*/
console.log('p3', dumpObject(p3.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p3_instance), '', '   '), '\n# Children: ', p3.childNodes.length);
/*
p3 {
  [c|NE|NC|NW]: now a string,  [b|NC]: 500
} {
  [c|NE|NC|NW]: now a string (Src: Here)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: 0)     [a|NE|NC|NW]: 100 (Src: 0)     [b|NC]: 500 (Src: Here)
} 
# Children:  1
*/
console.log('p4', dumpObject(p4.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p4_instance), '', '   '), '\n# Children: ', p4.childNodes.length);
/*
p4 {
  [x]: x
} {
  [x]: x (Src: Here)
} 
# Children:  1
*/
console.log('p5', dumpObject(p5.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p5_instance), '', '   '), '\n# Children: ', p5.childNodes.length);
/*
p5 {
  [y]: y
} {
  [y]: y (Src: Here)     [c|NE|NC|NW]: now a string (Src: 0)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: 0)     [a|NE|NC|NW]: 100 (Src: 0)     [b|NC]: 500 (Src: 0)     [x]: x (Src: 1)
} 
# Children:  0
*/
console.log('p1_instance.f(10000):', p1_instance.f(10000));
console.log('p3_instance.f(10000):', p3_instance.f(10000));
/*
p1_instance.f(10000): 10100
p3_instance.f(10000): 10500
*/
console.log('');

var p3_instance2 = p3.createLinkedObject();

function ConstructP3(b) {
    this.b = b;
}

console.log('var p3_instance3 = p3.constructObject(ConstructP3, 777);');
var p3_instance3 = p3.constructObject(ConstructP3, 777);

console.log('p3_instance2.f(10000):', p3_instance2.f(10000));
console.log('p3_instance3.f(10000):', p3_instance3.f(10000));
/*
p3_instance2.f(10000): 10500
p3_instance3.f(10000): 10777
*/

console.log('');
console.log('p2.b removed');
p2.removeFromNodePrototype('b');

console.log('p1', dumpObject(p1.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p1_instance), '', '   '), '\n# Children: ', p1.childNodes.length);
/*
p1 {
  [a|NE|NC|NW]: 100,  [f]: function fn(x) {
            return x + (this.b || this.a)
        }
} {
  [a|NE|NC|NW]: 100 (Src: Here)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: Here)
} 
# Children:  1
*/
console.log('p2', dumpObject(p2.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p2_instance), '', '   '), '\n# Children: ', p2.childNodes.length);
/*
p2 {

} {

} 
# Children:  1
*/
console.log('p3', dumpObject(p3.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p3_instance), '', '   '), '\n# Children: ', p3.childNodes.length);
/*
p3 {
  [c|NE|NC|NW]: now a string,  [b|NC]: 500
} {
  [c|NE|NC|NW]: now a string (Src: Here)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: 0)     [a|NE|NC|NW]: 100 (Src: 0)     [b|NC]: 500 (Src: Here)
} 
# Children:  1
*/
console.log('p4', dumpObject(p4.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p4_instance), '', '   '), '\n# Children: ', p4.childNodes.length);
/*
p4 {
  [x]: x
} {
  [x]: x (Src: Here)
} 
# Children:  1
*/
console.log('p5', dumpObject(p5.localPrototypeCopy), dumpObject(Object.getPrototypeOf(p5_instance), '', '   '), '\n# Children: ', p5.childNodes.length);
/*
p5 {
  [y]: y
} {
  [y]: y (Src: Here)     [c|NE|NC|NW]: now a string (Src: 0)     [f]: function fn(x) {
            return x + (this.b || this.a)
        } (Src: 0)     [a|NE|NC|NW]: 100 (Src: 0)     [b|NC]: 500 (Src: 0)     [x]: x (Src: 1)
} 
# Children:  0
*/
console.log('p3_instance.f(10000):', p3_instance.f(10000));
console.log('p3_instance2.f(10000):', p3_instance2.f(10000));
console.log('p3_instance3.f(10000):', p3_instance3.f(10000));
/*
p3_instance.f(10000): 10500
p3_instance2.f(10000): 10500
p3_instance3.f(10000): 10777
*/

console.log('');
var p3Proto = Object.getPrototypeOf(p3_instance);
console.log('p3_proto:', dumpObject(p3.localPrototypeCopy));
console.log('p3 instances have proto p3:', [p3_instance, p3_instance2, p3_instance3].map(x => p3.isPrototypeNodeOf(x)).toString())
console.log('p3 instances have same prototype:', ((Object.getPrototypeOf(p3_instance2) === p3Proto) && (Object.getPrototypeOf(p3_instance3) === p3Proto)).toString())
/*
p3_proto: {
  [c|NE|NC|NW]: now a string,  [b|NC]: 500
}
p3 instances have proto p3: true,true,true
p3 instances have same prototype: true
*/

console.log('');
console.log('p1.isAncestorPrototypeNodeOf(p1_instance): ' + p1.isAncestorPrototypeNodeOf(p1_instance).toString());
console.log('p2.isAncestorPrototypeNodeOf(p1_instance): ' + p2.isAncestorPrototypeNodeOf(p1_instance).toString());
console.log('p3.isAncestorPrototypeNodeOf(p1_instance): ' + p3.isAncestorPrototypeNodeOf(p1_instance).toString());
console.log('p1.isPrototypeNodeOf(p1_instance): ' + p1.isPrototypeNodeOf(p1_instance).toString());
console.log('p2.isPrototypeNodeOf(p1_instance): ' + p2.isPrototypeNodeOf(p1_instance).toString());
console.log('p3.isPrototypeNodeOf(p1_instance): ' + p3.isPrototypeNodeOf(p1_instance).toString());
/*
p1.isAncestorPrototypeNodeOf(p1_instance): true
p2.isAncestorPrototypeNodeOf(p1_instance): false
p3.isAncestorPrototypeNodeOf(p1_instance): false
p1.isPrototypeNodeOf(p1_instance): true
p2.isPrototypeNodeOf(p1_instance): false
p3.isPrototypeNodeOf(p1_instance): false
*/

console.log('');
console.log('p1.isAncestorPrototypeNodeOf(p2_instance): ' + p1.isAncestorPrototypeNodeOf(p2_instance).toString());
console.log('p2.isAncestorPrototypeNodeOf(p2_instance): ' + p2.isAncestorPrototypeNodeOf(p2_instance).toString());
console.log('p3.isAncestorPrototypeNodeOf(p2_instance): ' + p3.isAncestorPrototypeNodeOf(p2_instance).toString());
console.log('p1.isPrototypeNodeOf(p2_instance): ' + p1.isPrototypeNodeOf(p2_instance).toString());
console.log('p2.isPrototypeNodeOf(p2_instance): ' + p2.isPrototypeNodeOf(p2_instance).toString());
console.log('p3.isPrototypeNodeOf(p2_instance): ' + p3.isPrototypeNodeOf(p2_instance).toString());
/*
p1.isAncestorPrototypeNodeOf(p2_instance): false
p2.isAncestorPrototypeNodeOf(p2_instance): true
p3.isAncestorPrototypeNodeOf(p2_instance): false
p1.isPrototypeNodeOf(p2_instance): false
p2.isPrototypeNodeOf(p2_instance): true
p3.isPrototypeNodeOf(p2_instance): false
*/

console.log('');
console.log('p1.isAncestorPrototypeNodeOf(p3_instance): ' + p1.isAncestorPrototypeNodeOf(p3_instance).toString());
console.log('p2.isAncestorPrototypeNodeOf(p3_instance): ' + p2.isAncestorPrototypeNodeOf(p3_instance).toString());
console.log('p3.isAncestorPrototypeNodeOf(p3_instance): ' + p3.isAncestorPrototypeNodeOf(p3_instance).toString());
console.log('p1.isPrototypeNodeOf(p3_instance): ' + p1.isPrototypeNodeOf(p3_instance).toString());
console.log('p2.isPrototypeNodeOf(p3_instance): ' + p2.isPrototypeNodeOf(p3_instance).toString());
console.log('p3.isPrototypeNodeOf(p3_instance): ' + p3.isPrototypeNodeOf(p3_instance).toString());
/*
p1.isAncestorPrototypeNodeOf(p3_instance): true
p2.isAncestorPrototypeNodeOf(p3_instance): true
p3.isAncestorPrototypeNodeOf(p3_instance): true
p1.isPrototypeNodeOf(p3_instance): false
p2.isPrototypeNodeOf(p3_instance): false
p3.isPrototypeNodeOf(p3_instance): true
*/
```