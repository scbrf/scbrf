let isDev = true;
for (let arg of process.argv) {
  if (arg == "mas") {
    isDev = false;
    break;
  }
}
const app = require("./package.json");
module.exports = {
  mac: {
    appId: app.appId,
    category: app.category,
    icon: app.icon,
    files: ["**/*", "!src"],
    entitlements: "build/entitlements.mas.plist",
    entitlementsInherit: "build/entitlements.mas.inherit.plist",
    target: isDev ? "mas-dev" : "mas",
    type: isDev ? "development" : "distribution",
    timestamp: isDev ? "none" : undefined,
    provisioningProfile: isDev
      ? "build/mas-dev.provisionprofile"
      : "build/mas-dist.provisionprofile",
  },
};
