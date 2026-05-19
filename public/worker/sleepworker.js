const CHECK_INTERVAL = 3000;
const SLEEP_THRESHOLD = 5000;
let lastCheckTime = Date.now();

const checkIfComputerSlept = () => {
  const currentTime = Date.now();
  const timeDifference = currentTime - lastCheckTime;

  if (timeDifference > SLEEP_THRESHOLD) {
    postMessage('computer-slept');
  }

  lastCheckTime = currentTime;
  setTimeout(checkIfComputerSlept, CHECK_INTERVAL);
};

checkIfComputerSlept();