class AsyncLock {
  constructor() {
    this.queue = Promise.resolve();
  }

  runExclusive(task) {
    const next = this.queue.then(() => task());
    this.queue = next.catch(() => undefined);
    return next;
  }
}

module.exports = AsyncLock;