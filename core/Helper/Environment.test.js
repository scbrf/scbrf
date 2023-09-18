const Environment = require("./Environment");
test("render rss", () => {
  const env = new Environment();
  expect(
    env.renderTemplate({
      string: "<title>{{ planet.name|escape }}</title>",
      context: { planet: { name: "test" } },
    })
  ).toBe("<title>test</title>");
  expect(
    env.renderTemplate({
      string: "<pubDate>{{ article.created|rfc822 }}</pubDate>",
      context: { article: { created: 716646480.79928899 } },
    })
  ).toBe("<pubDate>Sep 17,2023 at 8:28:00 PM</pubDate>");
  expect(
    env
      .renderTemplate({
        string:
          "{{ article.content|md2html|absoluteImageURL:root_prefix,article.id }}",
        context: {
          root_prefix: "a.b",
          article: { id: "test", content: `# hello` },
        },
      })
      .trim()
  ).toBe("<h1>hello</h1>");
});
