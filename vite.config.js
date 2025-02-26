import { defineConfig } from "vite";
import ngrok from "ngrok";
import { exec } from "child_process";

export default defineConfig({
    server: {
        port: 3000, // Ensure consistent port
        strictPort: true,
        host: "0.0.0.0", // Allows external access (like from Quest 2)
        allowedHosts: [".ngrok-free.app", "localhost"], // Allows any ngrok subdomain
        cors: true, // Ensures proper cross-origin handling
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
                                console.error("Failed to open URL on Quest 2:", err);
                            } else {
                                console.log("Opened URL on Quest 2:", url);
                            }
                        });
                    } catch (error) {
                        console.error("Error starting ngrok:", error);
                    }
                });
            },
        },
    ],
});
