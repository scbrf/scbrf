function exportJS(base, path) {
  base = require("path").join(base, path);
  return require("fs")
    .readdirSync(base)
    .reduce((r, i) => {
      const name = i.slice(0, -3);
      r[
        `${base}${name[0].toUpperCase()}${name.slice(1)}`
      ] = require(`${base}/${i}`);
      return r;
    }, {});
}

async function getPortRange(from, to) {
  const { default: getPort, portNumbers } = await import("get-port");
  return await getPort({ port: portNumbers(from, to) });
}

module.exports = {
  exportJS,
  getPortRange,
  timeFromReferenceDate(v) {
    const ReferenceDate = new Date("2001-01-01").getTime();
    return new Date(Math.round(v * 1000 + ReferenceDate));
  },
  timeToReferenceDate(v) {
    const ReferenceDate = new Date("2001-01-01").getTime();
    return (v.getTime() - ReferenceDate) / 1000.0;
  },
};
