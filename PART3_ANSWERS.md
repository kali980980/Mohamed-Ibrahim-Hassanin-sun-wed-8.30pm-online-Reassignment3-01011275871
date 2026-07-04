# Part 3: Node Internals (3 Grades)

### 1. What is the Node.js Event Loop? (0.5 Grade)
The Event Loop is the mechanism that lets Node.js perform non-blocking I/O even
though JavaScript itself runs on a single thread. It's a loop that continuously
checks the call stack and various queues (timers, I/O callbacks, immediates,
etc.), picking up completed asynchronous work and running its callback once
the stack is empty. It cycles through fixed phases each iteration ("tick"):
timers -> pending callbacks -> idle/prepare -> poll -> check -> close callbacks,
with microtasks (Promises, `process.nextTick`) drained between phases.

### 2. What is Libuv and What Role Does It Play in Node.js? (0.5 Grade)
Libuv is a C library that Node.js is built on top of. It provides the actual
event loop implementation, an OS-level thread pool, and abstractions for
asynchronous file system access, networking (TCP/UDP), DNS resolution, and
child processes. In short, Node's JavaScript engine (V8) executes your code,
but libuv is what talks to the operating system and schedules asynchronous
work behind the scenes, then reports results back to the event loop.

### 3. How Does Node.js Handle Asynchronous Operations Under the Hood? (0.5 Grade)
When you call an async API (e.g. `fs.readFile`), Node hands the operation off
to libuv. Depending on the type of operation:
- Networking/timers are handled by the OS's async I/O facilities (epoll,
  kqueue, IOCP) directly through the event loop, no extra thread needed.
- File system operations, DNS lookups, and some crypto functions are offloaded
  to libuv's thread pool (since OSes don't provide good async file I/O
  primitives), and a worker thread executes them.
Once the operation completes, libuv queues the associated callback. On the
next matching phase of the event loop, the callback is pulled off the queue
and pushed onto the call stack to run, giving the appearance of asynchronous,
non-blocking execution while JS itself stays single-threaded.

### 4. What is the Difference Between the Call Stack, Event Queue, and Event Loop in Node.js? (0.5 Grade)
- **Call Stack**: Where JavaScript code is actually executed, one frame at a
  time. Synchronous function calls are pushed on and popped off in LIFO order.
- **Event Queue (Callback Queue)**: Holds callbacks for completed asynchronous
  operations (timers, I/O, etc.) that are ready to run but are waiting for the
  call stack to be empty.
- **Event Loop**: The scheduler that connects the two. It repeatedly checks
  whether the call stack is empty, and if so, dequeues the next callback from
  the appropriate queue and pushes it onto the call stack for execution.

In short: the call stack runs code, the event queue holds work waiting to run,
and the event loop is the process that moves work from the queue to the stack.

### 5. What is the Node.js Thread Pool and How to Set the Thread Pool Size? (0.5 Grade)
The thread pool is a pool of worker threads (provided by libuv) used to run
operations that can't be done asynchronously at the OS level, such as file
system calls, DNS lookups (`dns.lookup`), and some `crypto`/`zlib` functions.
By default it contains **4 threads**. You can change its size by setting the
`UV_THREADPOOL_SIZE` environment variable *before* Node starts (libuv reads it
once at startup), for example:

```bash
UV_THREADPOOL_SIZE=8 node server.js
```

or in code, before any thread-pool-using module is required:

```js
process.env.UV_THREADPOOL_SIZE = 8;
```

The maximum allowed size is 1024.

### 6. How Does Node.js Handle Blocking and Non-Blocking Code Execution? (0.5 Grade)
- **Non-blocking (asynchronous) code** — e.g. `fs.readFile`, network calls —
  is delegated to libuv (either the OS's async I/O or the thread pool). The
  main thread continues executing subsequent code immediately, and the
  callback/promise resolves later once the event loop picks it up.
- **Blocking (synchronous) code** — e.g. `fs.readFileSync`, heavy CPU loops,
  or any synchronous function — runs directly on the main thread and holds
  the call stack until it finishes. Nothing else (including the event loop)
  can proceed during that time, so long blocking operations freeze the whole
  application.

Because Node is single-threaded for JS execution, the rule of thumb is: use
asynchronous, non-blocking APIs (or move heavy CPU work to worker_threads /
child_process) so the event loop is never held up for long.
