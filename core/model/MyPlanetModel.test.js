const mockRSS = `
<channel>
    <title>{{ planet.name|escape }}</title>
    <atom:link href="{{ root_prefix }}/{% if podcast %}podcast{% else %}rss{% endif %}.xml" rel="self" type="application/rss+xml" />
    <link>{{ root_prefix }}/</link>
    <description><![CDATA[
    {{ planet.about|md2html }}
    ]]></description>
    {% if podcast %}
    {% if has_podcast_cover_art %}
    <itunes:image href="{{ root_prefix }}/podcastCoverArt.png"/>
    {% endif %}
    <language>{{ planet.podcastLanguage|escape }}</language>
    <itunes:explicit>{% if planet.podcastExplicit %}yes{% else %}no{% endif %}</itunes:explicit>
    {% for category in planet.podcastCategories %}
    <itunes:category text="{{ category|escape }}" />
    {% endfor %}
    {% endif %}
    {% for article in planet.articles %}
    <item>
        <title>{{ article.title|escape }}</title>
        <link>{{ root_prefix }}/{{ article.id }}/</link>
        <guid>{{ root_prefix }}/{{ article.id }}/</guid>
        <pubDate>{{ article.created|rfc822 }}</pubDate>
        {% if article.heroImage %}
        <itunes:image href="{{ article.heroImage }}" />    
        {% endif %}
        {% if podcast %}
        <enclosure url="{{ root_prefix }}/{{ article.id }}/{{ article.audioFilename }}" length="{{ article.audioByteLength }}" type="audio/mpeg" />
        <itunes:duration>{{ article.audioDuration|hhmmss }}</itunes:duration>
        {% endif %}
        <description><![CDATA[
            {{ article.content|md2html|absoluteImageURL:root_prefix,article.id }}
        ]]></description>
    </item>
    {% endfor %}
</channel>
</rss>`;
class MockFS {
  static fs = {};
  constructor() {
    MockFS.fs = {};
  }
  existsSync(path) {
    return MockFS.fs[path];
  }
  mkdirSync(path) {
    MockFS.fs[path] = true;
  }
  readFileSync(path) {
    if (path.endsWith("RSS.xml")) return mockRSS;
  }
  cpSync() {}
  writeFileSync(path, cnt) {
    MockFS.fs[path] = cnt;
  }
}
jest.mock("fs", () => new MockFS());
jest.mock("../ipfs");
jest.mock("../Helper/TemplateStore", () => ({
  get: () => ({
    assetsPath: "",
    renderIndex() {},
  }),
}));
const MyPlanetModel = require("./MyPlanetModel");
const utils = require("../utils");
test("create planet", async () => {
  const planet = await MyPlanetModel.create({
    name: "test",
    about: "about",
    templateName: "plain",
  });
  expect(planet.name).toBe("test");
  expect(planet.template).toBeTruthy();
  planet.save();
  await planet.savePublic();
  const planetInfoJson = Object.keys(MockFS.fs).filter(
    (a) => a.endsWith("planet.json") && a.indexOf("My") >= 0
  )[0];
  const infoJson = JSON.parse(MockFS.fs[planetInfoJson]);
  expect(infoJson.name).toBe("test");
  expect(infoJson.id).toBe(infoJson.id.toUpperCase());
  expect(infoJson.podcastLanguage).toBe("en");
  expect(infoJson.tags).toEqual({});
  expect(infoJson.templateName).toBe("plain");

  expect(
    Math.abs(infoJson.created - utils.timeToReferenceDate(new Date()))
  ).toBeLessThan(1);
  expect(
    Math.abs(infoJson.updated - utils.timeToReferenceDate(new Date()))
  ).toBeLessThan(1);

  const planetPublicInfoJson = Object.keys(MockFS.fs).filter(
    (a) => a.endsWith("planet.json") && a.indexOf("Public") >= 0
  )[0];
  const publicInfoJson = JSON.parse(MockFS.fs[planetPublicInfoJson]);
  expect(
    Math.abs(publicInfoJson.created - utils.timeToReferenceDate(new Date()))
  ).toBeLessThan(1);
  expect(
    Math.abs(publicInfoJson.updated - utils.timeToReferenceDate(new Date()))
  ).toBeLessThan(1);

  const rssPath = Object.keys(MockFS.fs).filter(
    (a) => a.endsWith("rss.xml") && a.indexOf("Public") >= 0
  )[0];
  expect(MockFS.fs[rssPath]).toBeTruthy();
});
