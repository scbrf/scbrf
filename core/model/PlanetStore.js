const { observable } = require("mobx");
const S = require("../setting");
class PlanetStore {
  constructor() {
    this.state = observable({
      myPlanets: [],
    });
  }
  async saveMyPlanetsOrder() {
    const ids = this.myPlanets.map((p) => p.id);
    await S.set(S.myPlanetsOrderKey, ids);
  }
}

module.exports = new PlanetStore();
