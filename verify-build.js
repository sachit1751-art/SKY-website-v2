async function verify() {
  try {
    process.env.NODE_ENV = 'production';
    // Dynamic import of the bundled server
    await import('./dist/server.cjs');
    console.log('SUCCESS: Successfully dynamically imported the server bundle.');
    console.log('No /src/data or browser-specific modules crashed the runtime.');
    process.exit(0);
  } catch (err) {
    console.error('FAILURE: Failed to dynamically import the server bundle.');
    console.error(err);
    process.exit(1);
  }
}
verify();
