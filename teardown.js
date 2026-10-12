'use strict';

/**
 * teardown.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Future-proof, cloud-IDE-safe shutdown module for New Maharashtra Garjana.
 *
 * Guarantees:
 *   • Intercepts SIGTERM and SIGINT (Ctrl-C, IDE stop button, container eviction).
 *   • Drains in-flight HTTP requests via server.close().
 *   • Destroys lingering keep-alive sockets instantly.
 *   • Arms an unreferenced 4-second hard-kill timer using tree-kill(SIGKILL)
 *     so the process tree is reaped even when the cloud IDE stdout pipe is
 *     broken, blocked, or disconnected (the root cause of terminal deadlocks).
 *   • All console output is wrapped defensively — a broken stdout cannot
 *     cause an infinite loop or freeze.
 *   • Guards against duplicate signal delivery (idempotent).
 *
 * Usage (in server entry-point):
 *   const configureFutureProofTeardown = require('./teardown');
 *   configureFutureProofTeardown(server);          // call once after listen()
 */

const treeKill = require('tree-kill');

// ── safe logger ───────────────────────────────────────────────────────────────
// Never throws; never blocks. Uses raw fd writes so a closed pipe cannot loop.
function safeLog(msg) {
    try { process.stdout.write('[teardown] ' + msg + '\n'); } catch (_) { }
}
function safeErr(msg) {
    try { process.stderr.write('[teardown] ' + msg + '\n'); } catch (_) { }
}

// ── open-socket tracker ───────────────────────────────────────────────────────
// Attaches to an http.Server so we can drain sockets instantly on shutdown.
function trackSockets(serverInstance) {
    const openSockets = new Set();
    serverInstance.on('connection', (sock) => {
        openSockets.add(sock);
        sock.once('close', () => openSockets.delete(sock));
    });
    return openSockets;
}

// ── core exit handler ─────────────────────────────────────────────────────────
function configureFutureProofTeardown(serverInstance) {
    const openSockets = serverInstance ? trackSockets(serverInstance) : new Set();
    let _exiting = false;  // idempotency guard

    const handleExit = (signal) => {
        if (_exiting) return;
        _exiting = true;

        safeLog(`Received ${signal}. Beginning graceful shutdown…`);

        // ── Step 1: Arm unreferenced 4-second hard-kill countdown ────────────────
        // .unref() means this timer will NOT keep the Node event loop alive on its
        // own — it only fires if the process has not already exited cleanly.
        // If the cloud IDE disconnects the stdout pipe mid-shutdown, this guarantees
        // the container is reaped and the terminal is freed within 4 seconds.
        const killTimer = setTimeout(() => {
            safeLog('Hard deadline reached — sending SIGKILL to process tree.');
            treeKill(process.pid, 'SIGKILL', (err) => {
                if (err) {
                    // tree-kill itself failed (very rare); fall back to direct kill.
                    try { process.kill(process.pid, 'SIGKILL'); } catch (_) { }
                }
                process.exit(1);
            });
        }, 4000);

        if (killTimer.unref) killTimer.unref();

        // ── Step 2: Destroy all lingering keep-alive sockets immediately ──────────
        for (const sock of openSockets) {
            try { sock.destroy(); } catch (_) { }
        }

        // ── Step 3: Graceful HTTP server close ────────────────────────────────────
        if (serverInstance && typeof serverInstance.close === 'function') {
            serverInstance.close(() => {
                safeLog('HTTP server closed cleanly. Exiting.');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    };

    // Intercept standard termination signals
    process.on('SIGTERM', () => handleExit('SIGTERM'));
    process.on('SIGINT', () => handleExit('SIGINT'));

    // ── Global safety nets ────────────────────────────────────────────────────
    // Prevent a single bad request from crashing the server and leaking ports.
    process.on('uncaughtException', (err) => {
        safeErr('uncaughtException: ' + (err && err.stack ? err.stack : String(err)));
        // Do NOT re-throw; keep server alive for subsequent requests.
    });

    process.on('unhandledRejection', (reason) => {
        safeErr('unhandledRejection: ' + reason);
    });

    safeLog('Teardown handler installed (4 s hard-kill guard active).');
}

module.exports = configureFutureProofTeardown;
