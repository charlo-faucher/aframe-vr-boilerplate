import { defineConfig } from "vite";
import ngrok from "ngrok";
import { exec } from "child_process";
import commonjs from "vite-plugin-commonjs";

export default defineConfig({
    server: {
        port: 3000,
        strictPort: true,
        host: "0.0.0.0",
        allowedHosts: [".ngrok-free.app", "localhost"],
        cors: true,
    },
    plugins: [
        {
            name: "ngrok-adb",
            configureServer(server) {
                server.httpServer?.on("listening", async () => {
                    console.log("Starting ngrok...");

                    try {
                        const url = await ngrok.connect({
                            addr: 3000,
                            region: "us", // Set your ngrok region if needed
                        });

                        console.log("ngrok URL:", url);

                        // Open the link in the Quest 2 browser using ADB
                        exec(`adb shell am start -a android.intent.action.VIEW -d "${url}"`, (err) => {
                            if (err) {
                                console.warn("Failed to open URL on Quest 2 (is it connected?)");
                            } else {
                                console.log("Opened URL on Quest 2");
                            }
                        });
                    } catch (error) {
                        console.error("Error starting ngrok:", error);
                    }
                });
            },
        },
        commonjs(),
    ],
    optimizeDeps: {
        include: ["aframe-extras"],
    },
    build: {
        commonjsOptions: {
            include: [/node_modules/, /aframe-extras/]
        }
    }
});
