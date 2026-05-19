const CHECK_INTERVAL = 5000; // Every 5 seconds
const TEST_URL = "'https://www.google.com/favicon.ico'"; 

const checkInternetConnection = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetch(TEST_URL, {
      method: "HEAD",
      cache: "no-cache",
      signal: controller.signal,
    });
     
    clearTimeout(timeout);
    postMessage(response.ok ? "online" : "offline");
  } catch {
    postMessage("offline");
  } finally {
    setTimeout(checkInternetConnection, CHECK_INTERVAL);
  }
};

checkInternetConnection();
