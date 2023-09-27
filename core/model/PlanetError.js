class PlanetError {
  static PlanetExistsError = new Error("Planet Exists Error");
  static InvalidPlanetURLError = new Error("Invalid Planet URL Error");
  static EthereumError = new Error("Ethereum Error");
  static ENSNoContentHashError = new Error("ENS No Content Hash Error");
  static NetworkError = new Error("Network Error");
}

module.exports = PlanetError;
