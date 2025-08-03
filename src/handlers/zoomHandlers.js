/**
 * Zoom Handlers Factory
 * Creates zoom control handlers with closure over viewport manipulation
 * Following the handler-hook-context pattern
 */

/**
 * Zoom Handlers Factory
 * Creates handler functions with closure over zoom state and viewport manipulation
 */
export const createZoomHandlers = () => {
  let currentZoom = 1;
  const minZoom = 0.5;
  const maxZoom = 2;
  const zoomStep = 0.1;

  const getViewportMeta = () => {
    return document.querySelector('meta[name="viewport"]');
  };

  const updateViewportZoom = (zoom) => {
    const viewport = getViewportMeta();
    if (viewport) {
      viewport.content = `width=device-width, initial-scale=${zoom}, minimum-scale=${minZoom}, maximum-scale=${maxZoom}, user-scalable=yes`;
    }
  };

  return {
    handleZoomIn: () => {
      if (currentZoom < maxZoom) {
        currentZoom = Math.min(currentZoom + zoomStep, maxZoom);
        updateViewportZoom(currentZoom);
      }
    },

    handleZoomOut: () => {
      if (currentZoom > minZoom) {
        currentZoom = Math.max(currentZoom - zoomStep, minZoom);
        updateViewportZoom(currentZoom);
      }
    },

    handleResetZoom: () => {
      currentZoom = 1;
      updateViewportZoom(currentZoom);
    },

    getCurrentZoom: () => currentZoom,
    getZoomLimits: () => ({ min: minZoom, max: maxZoom })
  };
};
