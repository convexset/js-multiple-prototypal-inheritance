Package.describe({
	name: 'convexset:multiple-prototypal-inheritance',
	version: '0.0.4',
	summary: 'Multple prototypal inheritance',
	git: 'https://github.com/convexset/js-multiple-prototypal-inheritance',
	documentation: 'README.md'
});

Package.onUse(function(api) {
	api.versionsFrom('1.2.1');
	api.use(['ecmascript', 'underscore', 'convexset:package-utils@0.1.12']);
	api.addFiles('multiple-prototypal-inheritance.js');
    api.export('MultiplePrototypalInheritance');
});

Package.onTest(function(api) {
	api.use(['tinytest', 'test-helpers']);
	api.use(['ecmascript', 'underscore', 'convexset:multiple-prototypal-inheritance']);
	api.addFiles(['tests.js']);
});