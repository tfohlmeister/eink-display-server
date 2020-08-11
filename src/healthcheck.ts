import fetch from 'node-fetch';


fetch('http://localhost:3000/health')
  .then(result => {
    console.info(`Performed health check, result ${result.status}.`);
    if (result.status === 200) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error(`An error occurred while performing health check, error: ${err}`);
    process.exit(1);
  });