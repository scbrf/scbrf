module.exports = async (params) => {
  const planet = await require("../../model/MyPlanetModel").create(params);
  const store = require("../../model/PlanetStore");
  store.state.myPlanets.splice(0, 0, planet);
  await store.saveMyPlanetsOrder();
  planet.save();
  await planet.savePublic();
};
