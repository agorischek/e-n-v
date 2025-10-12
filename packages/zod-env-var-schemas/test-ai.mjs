import { descriptions, messages, constraints, defaults, patterns } from './src/shared/applicationInsights.js';

console.log('✅ Application Insights naming convention test:');
console.log('Descriptions keys:', Object.keys(descriptions));
console.log('Messages keys:', Object.keys(messages));
console.log('Constraints keys:', Object.keys(constraints));
console.log('Defaults keys:', Object.keys(defaults));
console.log('Patterns keys:', Object.keys(patterns));

console.log('\n✅ Example values:');
console.log('Connection string description:', descriptions.connectionString);
console.log('Pattern example exists:', !!patterns.connectionString);
console.log('Default sampling rate:', defaults.samplingRate);

// Test camelCase naming
console.log('\n✅ Verifying camelCase naming:');
console.log('autoCollectDependencies exists:', 'autoCollectDependencies' in descriptions);
console.log('roleNameMin exists:', 'roleNameMin' in constraints);
console.log('connectionStringFormat exists:', 'connectionStringFormat' in messages);