const { observable } = require("mobx");
class PlanetStore {
  constructor() {
    this.state = observable({
      myPlanets: [],
    });
  }
}

module.exports = new PlanetStore();
