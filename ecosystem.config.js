module.exports = {
  apps: [
    {
      name: "rate-cluster",
      script: "dist/main.js",
      exec_mode: "cluster",
      instances: "1",
      watch_delay: 500,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD",
      max_memory_restart: "1024M",
      ignore_watch: ["node_modules"],
      log_type: "json",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "rate-cluster-dev",
      script: "dist/main.js",
      exec_mode: "cluster",
      instances: "1",
      watch_delay: 5000,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD",
      max_memory_restart: "1024M",
      ignore_watch: ["node_modules"],
      log_type: "json",
      error_file: "logs/pm2_error.log",
      log_file: "logs/pm2_all.log",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
