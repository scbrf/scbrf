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
  fs = {};
  constructor() {
    this.fs = {};
  }
  existsSync(path) {
    return this.fs[path];
  }
  mkdirSync(path) {
    this.fs[path] = true;
  }
  readFileSync(path) {
    if (path.endsWith("RSS.xml")) return mockRSS;
  }
  statSync() {
    return { size: 1 };
  }
  cpSync() {}
  writeFileSync(path, cnt) {
    this.fs[path] = cnt;
  }
}

module.exports = new MockFS();
