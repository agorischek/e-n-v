# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bookworm

# Install Bun using the official installer
RUN curl -fsSL https://bun.sh/install | bash \
    && mv /root/.bun/bin/bun /usr/local/bin/bun \
    && rm -rf /root/.bun

# Ensure Bun is available via PATH for all users
ENV PATH="/usr/local/bin:${PATH}"
