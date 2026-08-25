export function executeAction(element, hass, object, config) {
  const action = config?.action || "none";
  const entityId = config?.entity || object.entity_id;

  if (action === "toggle" && entityId) {
    const domain = entityId.split(".")[0];
    hass.callService(domain, "toggle", { entity_id: entityId });
    return;
  }
  if (action === "call-service" && config.service) {
    const [domain, service] = config.service.split(".");
    hass.callService(domain, service, {
      ...(config.service_data || config.data || {}),
      ...(entityId ? { entity_id: entityId } : {}),
    });
    return;
  }
  if (action === "more-info" && entityId) {
    element.dispatchEvent(new CustomEvent("hass-more-info", {
      bubbles: true,
      composed: true,
      detail: { entityId },
    }));
    return;
  }
  if (action === "navigate" && config.navigation_path) {
    history.pushState(null, "", config.navigation_path);
    window.dispatchEvent(new Event("location-changed"));
    return;
  }
  if (action === "url" && config.url_path) {
    window.open(config.url_path, config.new_tab === false ? "_self" : "_blank");
  }
}
