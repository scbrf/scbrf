// 关注一个新的站点
module.exports = async (params) => {
  const { link } = params;
  const planet = await FollowingPlanetModel.follow(link);
  require("../../model/PlanetStore").state.followingPlanets.splice(
    0,
    0,
    planet
  );
};
