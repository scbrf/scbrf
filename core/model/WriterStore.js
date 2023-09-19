class WriterStore {
  async newArticle(params) {
    const { planetUUID } = params;
    const planet = require("./PlanetStore").getPlanet(planetUUID);
    let draft;
    if (!planet.drafts.length) {
      draft = await require("./DraftModel").create(planet);
      planet.drafts.push(draft);
    } else {
      draft = planet.drafts[0];
    }
    draft.initialContentSHA256 = draft.contentSHA256();
    return { id: draft.id };
  }
}

module.exports = new WriterStore();
