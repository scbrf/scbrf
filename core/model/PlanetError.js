class PlanetError {
  static PlanetExistsError = new Error("Planet Exists Error");
  static InvalidPlanetURLError = new Error("Invalid Planet URL Error");
  static EthereumError = new Error("Ethereum Error");
  static ENSNoContentHashError = new Error("ENS No Content Hash Error");
}

module.exports = PlanetError;
