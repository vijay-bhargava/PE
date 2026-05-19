import { useEffect } from 'react';

const PAGE_RELOAD_DELAY_IN_SEC = 3;

export const useSleepDetector = () => {
  useEffect(() => {
    if (!window.Worker) return;

    const sleepWorker = new Worker('/worker/sleepworker.js');

    sleepWorker.onmessage = (e) => {
      if (e.data === 'computer-slept') {
        console.log(`Detected sleep. Reloading in ${PAGE_RELOAD_DELAY_IN_SEC} seconds.`);
        setTimeout(() => {
          window.location.reload();
        }, PAGE_RELOAD_DELAY_IN_SEC * 1000);
      }
    };

    return () => sleepWorker.terminate(); // Cleanup on unmount
  }, []);
};

