/**
 * App version, injected at BUILD time by Vite from the env var VITE_APP_VERSION.
 * Set via Dockerfile.prod's `ARG IMAGE_TAG` → `ENV VITE_APP_VERSION=$IMAGE_TAG`,
 * itself passed from the CI as `--build-arg IMAGE_TAG=prod-v1.0.11`.
 *
 * Local dev: defaults to "dev".
 */
export const APP_VERSION = import.meta.env.IMAGE_TAG || 'dev';

/**
 * Display-friendly version: strips a leading "prod-" so we show "v1.0.11"
 * instead of "prod-v1.0.11" in the UI.
 */
export const APP_VERSION_DISPLAY = APP_VERSION.replace(/^prod-/, '');
