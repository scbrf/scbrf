const { observable } = require("mobx");
const S = require("../setting");
class PlanetStore {
  constructor() {
    this.state = observable({
      myPlanets: [],
      followingPlanets: [],
    });
  }
  async saveMyPlanetsOrder() {
    const ids = this.myPlanets.map((p) => p.id);
    await S.set(S.myPlanetsOrderKey, ids);
  }
  getPlanet(uuid) {
    return this.state.myPlanets.filter((p) => p.id == uuid)[0];
  }
}

module.exports = new PlanetStore();
