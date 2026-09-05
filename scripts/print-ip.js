const os = require("os");

for (const interfaces of Object.values(os.networkInterfaces())) {
  for (const iface of interfaces ?? []) {
    if (iface.family === "IPv4" && !iface.internal) {
      console.log(`http://${iface.address}:3000`);
    }
  }
}
