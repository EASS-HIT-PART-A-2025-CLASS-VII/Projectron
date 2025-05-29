# Create a new folder: selenium-service/
# Create selenium-service/Dockerfile

FROM selenium/standalone-chrome:latest

# Install curl for health checks
USER root
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
USER seluser

# Set environment variables
ENV SE_OPTS="--host 0.0.0.0 --port 4444"
ENV SE_NODE_MAX_SESSIONS=2
ENV SE_NODE_SESSION_TIMEOUT=300

# Expose the port
EXPOSE 4444

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:4444/wd/hub/status || exit 1

# Use the default entry point from the base image
CMD ["/opt/bin/entry_point.sh"]