FROM selenium/standalone-chrome:4.19.1-20240402

# Switch to root to install packages
USER root

# Install curl for health checks and other utilities
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Switch back to seluser
USER seluser

# Set environment variables for Railway
ENV SE_OPTS="--host 0.0.0.0 --port 4444"
ENV SE_NODE_MAX_SESSIONS=5
ENV SE_NODE_SESSION_TIMEOUT=300
ENV SE_START_XVFB=true
ENV DBUS_SESSION_BUS_ADDRESS=/dev/null

# Expose the port
EXPOSE 4444

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:4444/wd/hub/status || exit 1

# Use the default entry point from the base image
CMD ["/opt/bin/entry_point.sh"]