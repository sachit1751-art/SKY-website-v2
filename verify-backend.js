async function verify() {
  try {
    process.env.NODE_ENV = 'production';
    // Dynamic import of the bundled server
    await import('./dist/server.cjs');
    console.log('\n--- VERIFICATION SUCCESS ---');
    console.log('Successfully dynamically imported the server bundle.');
    console.log('No ERR_MODULE_NOT_FOUND related to /var/task/src/data or browser-specific modules occurred.');
    process.exit(0);
  } catch (err) {
    console.error('\n--- VERIFICATION FAILURE ---');
    console.error('Failed to dynamically import the server bundle.');
    console.error(err);
    process.exit(1);
  }
}
verify();
