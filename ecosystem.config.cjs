module.exports = {
  apps: [
    {
      name: "mmtreasure",
      script: "npm",
      args: "run start", // Remove the --prefix mmtreasure
      cwd: "/home/mmtreasure/htdocs/mmtreasure.com", // Set the correct working directory
      watch: true, // Enable watching for backend
      autorestart: true,
      max_restarts: 10,
      restart_delay: 1000,
      env: {
        PORT: 5000,
        NODE_ENV: "production",
      },
    },
  ],
};
