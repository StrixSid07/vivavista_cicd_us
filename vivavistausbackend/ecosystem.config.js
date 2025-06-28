module.exports = {
    apps: [
        {
            name: "vivavista-backend-ca", // same name you're using with PM2
            script: "server.js",          // change this if your entry point is different
            watch: true,
            ignore_watch: [
                "node_modules",
                "uploads",       // ✅ Prevent restart when image is uploaded
                "logs"
            ],
            watch_options: {
                followSymlinks: false
            }
        }
    ]
};

//pm2 start ecosystem.config.js