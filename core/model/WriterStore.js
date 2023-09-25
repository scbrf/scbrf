class WriterStore {
  async newArticle(params) {
    const { planetID } = params;
    const planet = require("./PlanetStore").getPlanet(planetID);
    let draft;
    if (!planet.drafts.length) {
      draft = await require("./DraftModel").create({ planet });
      planet.drafts.push(draft);
    } else {
      draft = planet.drafts[0];
    }
    draft.initialContentSHA256 = draft.contentSHA256();
    return draft;
  }
}

module.exports = new WriterStore();
