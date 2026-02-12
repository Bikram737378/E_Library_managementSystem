const fs = require('fs');
const path = require('path');

console.log('\n🔍 DIAGNOSIS TOOL\n');

// 1. Check if route file exists
const routePath = path.join(__dirname, 'routes', 'loanRoutes.js');
console.log(`📁 Checking: ${routePath}`);
if (fs.existsSync(routePath)) {
  console.log('✅ loanRoutes.js exists');
  const content = fs.readFileSync(routePath, 'utf8');
  console.log(`   Size: ${content.length} bytes`);
  console.log(`   Has module.exports: ${content.includes('module.exports')}`);
  console.log(`   Has router.get('/test'): ${content.includes("router.get('/test'")}`);
} else {
  console.log('❌ loanRoutes.js NOT FOUND!');
}

// 2. Check if controller file exists
const controllerPath = path.join(__dirname, 'controllers', 'loanController.js');
console.log(`\n📁 Checking: ${controllerPath}`);
if (fs.existsSync(controllerPath)) {
  console.log('✅ loanController.js exists');
  const content = fs.readFileSync(controllerPath, 'utf8');
  console.log(`   Size: ${content.length} bytes`);
  console.log(`   Has issueBook: ${content.includes('issueBook')}`);
} else {
  console.log('❌ loanController.js NOT FOUND!');
}

// 3. Check server.js for route mounting
const serverPath = path.join(__dirname, 'server.js');
console.log(`\n📁 Checking: ${serverPath}`);
if (fs.existsSync(serverPath)) {
  const content = fs.readFileSync(serverPath, 'utf8');
  console.log(`   Has loanRoutes require: ${content.includes("require('./routes/loanRoutes')")}`);
  console.log(`   Has app.use('/api/loans'): ${content.includes("app.use('/api/loans'") || content.includes('app.use("/api/loans"')}`);
}

console.log('\n✅ Diagnosis complete\n');