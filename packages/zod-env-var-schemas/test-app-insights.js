const { descriptions, messages, constraints, defaults, patterns } = require('./dist/shared/applicationInsights.js');

console.log('✅ Application Insights naming convention test:');
console.log('Descriptions:', Object.keys(descriptions));
console.log('Messages:', Object.keys(messages));
console.log('Constraints:', Object.keys(constraints));
console.log('Defaults:', Object.keys(defaults));
console.log('Patterns:', Object.keys(patterns));

console.log('\n✅ Example values:');
console.log('Description example:', descriptions.connectionString);
console.log('Pattern example:', patterns.connectionString);
console.log('Default example:', defaults.samplingRate);