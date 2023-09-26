class PlanetType {
  value = 0;
  static planet = new PlanetType(0);
  static ens = new PlanetType(1);
  static dnslink = new PlanetType(2);
  static dns = new PlanetType(3);
  static dotbit = new PlanetType(4);
  constructor(value) {
    this.value = value;
  }
  toJSON() {
    return this.value;
  }
}

module.exports = PlanetType;
