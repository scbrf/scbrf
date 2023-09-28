const { Readable } = require("stream");
jest.mock("fs");
jest.mock("../ipfs", () => ({
  pin() {},
  resolveIPNSorDNSLink() {
    return "123";
  },
  gateway: "http://127.0.0.1:3456",
}));
jest.mock("../ENSUtils", () => ({
  getCID() {
    return "123";
  },
}));

class ReadableString extends Readable {
  sent = false;

  constructor(str) {
    super();
    this.str = str;
  }
  _read() {
    if (!this.sent) {
      this.push(Buffer.from(this.str));
      this.sent = true;
    } else {
      this.push(null);
    }
  }
}

const FollowingPlanetModel = require("./FollowingPlanetModel");
test("ens follow planet", async () => {
  require("ethers").contenthash = "ipns://abc";
  require("ethers").avatar = "http://123";
  global.fetch = () => ({
    json: () => ({
      name: "test",
      articles: [],
    }),
  });
  await FollowingPlanetModel.follow("planetable.eth");
});

test("ens follow rss", async () => {
  require("ethers").contenthash = "ipns://abc";
  require("ethers").avatar = "http://123";
  global.fetch = (url) => {
    if (url.endsWith(".xml")) {
      return {
        status: 200,
        body: new ReadableString(`
      <?xml version="1.0" ?>
      <rss version="2.0">
      <channel>
        <title>Vitalik Buterin's website</title>
        <link>https://vitalik.ca/</link>
        <description>Vitalik Buterin's website</description>
        <image>
            <url>http://vitalik.ca/images/icon.png</url>
            <title>Vitalik Buterin's website</title>
            <link>https://vitalik.ca/</link>
        </image>
      
      <item>
      <title>What do I think about Community Notes?</title>
      <link>https://vitalik.ca/general/2023/08/16/communitynotes.html</link>
      <guid>https://vitalik.ca/general/2023/08/16/communitynotes.html</guid>
      <pubDate>Wed, 16 Aug 2023 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>What do I think about biometric proof of personhood?</title>
      <link>https://vitalik.ca/general/2023/07/24/biometric.html</link>
      <guid>https://vitalik.ca/general/2023/07/24/biometric.html</guid>
      <pubDate>Mon, 24 Jul 2023 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Deeper dive on cross-L2 reading for wallets and other use cases</title>
      <link>https://vitalik.ca/general/2023/06/20/deeperdive.html</link>
      <guid>https://vitalik.ca/general/2023/06/20/deeperdive.html</guid>
      <pubDate>Tue, 20 Jun 2023 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>The Three Transitions</title>
      <link>https://vitalik.ca/general/2023/06/09/three_transitions.html</link>
      <guid>https://vitalik.ca/general/2023/06/09/three_transitions.html</guid>
      <pubDate>Fri, 09 Jun 2023 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Don't overload Ethereum's consensus</title>
      <link>https://vitalik.ca/general/2023/05/21/dont_overload.html</link>
      <guid>https://vitalik.ca/general/2023/05/21/dont_overload.html</guid>
      <pubDate>Sun, 21 May 2023 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Travel time ~= 750 * distance ^ 0.6</title>
      <link>https://vitalik.ca/general/2023/04/14/traveltime.html</link>
      <guid>https://vitalik.ca/general/2023/04/14/traveltime.html</guid>
      <pubDate>Fri, 14 Apr 2023 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>How will Ethereum's multi-client philosophy interact with ZK-EVMs?</title>
      <link>https://vitalik.ca/general/2023/03/31/zkmulticlient.html</link>
      <guid>https://vitalik.ca/general/2023/03/31/zkmulticlient.html</guid>
      <pubDate>Fri, 31 Mar 2023 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Some personal user experiences</title>
      <link>https://vitalik.ca/general/2023/02/28/ux.html</link>
      <guid>https://vitalik.ca/general/2023/02/28/ux.html</guid>
      <pubDate>Tue, 28 Feb 2023 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>An incomplete guide to stealth addresses</title>
      <link>https://vitalik.ca/general/2023/01/20/stealth.html</link>
      <guid>https://vitalik.ca/general/2023/01/20/stealth.html</guid>
      <pubDate>Fri, 20 Jan 2023 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>What even is an institution?</title>
      <link>https://vitalik.ca/general/2022/12/30/institutions.html</link>
      <guid>https://vitalik.ca/general/2022/12/30/institutions.html</guid>
      <pubDate>Fri, 30 Dec 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Updating my blog: a quick GPT chatbot coding experiment</title>
      <link>https://vitalik.ca/general/2022/12/06/gpt3.html</link>
      <guid>https://vitalik.ca/general/2022/12/06/gpt3.html</guid>
      <pubDate>Tue, 06 Dec 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>What in the Ethereum application ecosystem excites me</title>
      <link>https://vitalik.ca/general/2022/12/05/excited.html</link>
      <guid>https://vitalik.ca/general/2022/12/05/excited.html</guid>
      <pubDate>Mon, 05 Dec 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Having a safe CEX: proof of solvency and beyond</title>
      <link>https://vitalik.ca/general/2022/11/19/proof_of_solvency.html</link>
      <guid>https://vitalik.ca/general/2022/11/19/proof_of_solvency.html</guid>
      <pubDate>Sat, 19 Nov 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>我在加密世界的一些个人体验</title>
      <link>https://vitalik.ca/general/2022/10/28/ux_zhCN.html</link>
      <guid>https://vitalik.ca/general/2022/10/28/ux_zhCN.html</guid>
      <pubDate>Fri, 28 Oct 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>收入-邪恶曲线：思考“公共物品融资优先”的另一种方式</title>
      <link>https://vitalik.ca/general/2022/10/28/revenue_evil_zhCN.html</link>
      <guid>https://vitalik.ca/general/2022/10/28/revenue_evil_zhCN.html</guid>
      <pubDate>Fri, 28 Oct 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>The Revenue-Evil Curve: a different way to think about prioritizing public goods funding</title>
      <link>https://vitalik.ca/general/2022/10/28/revenue_evil.html</link>
      <guid>https://vitalik.ca/general/2022/10/28/revenue_evil.html</guid>
      <pubDate>Fri, 28 Oct 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>DAOs are not corporations: where decentralization in autonomous organizations matters</title>
      <link>https://vitalik.ca/general/2022/09/20/daos.html</link>
      <guid>https://vitalik.ca/general/2022/09/20/daos.html</guid>
      <pubDate>Tue, 20 Sep 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>What kind of layer 3s make sense?</title>
      <link>https://vitalik.ca/general/2022/09/17/layer_3.html</link>
      <guid>https://vitalik.ca/general/2022/09/17/layer_3.html</guid>
      <pubDate>Sat, 17 Sep 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Should there be demand-based recurring fees on ENS domains?</title>
      <link>https://vitalik.ca/general/2022/09/09/ens.html</link>
      <guid>https://vitalik.ca/general/2022/09/09/ens.html</guid>
      <pubDate>Fri, 09 Sep 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>不同類型的 ZK-EVM</title>
      <link>https://vitalik.ca/general/2022/08/29/zkevm_zhTW.html</link>
      <guid>https://vitalik.ca/general/2022/08/29/zkevm_zhTW.html</guid>
      <pubDate>Mon, 29 Aug 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>The different types of ZK-EVMs</title>
      <link>https://vitalik.ca/general/2022/08/04/zkevm.html</link>
      <guid>https://vitalik.ca/general/2022/08/04/zkevm.html</guid>
      <pubDate>Thu, 04 Aug 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>「网络国家」之我见</title>
      <link>https://vitalik.ca/general/2022/07/13/networkstates_zhCN.html</link>
      <guid>https://vitalik.ca/general/2022/07/13/networkstates_zhCN.html</guid>
      <pubDate>Wed, 13 Jul 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>What do I think about network states?</title>
      <link>https://vitalik.ca/general/2022/07/13/networkstates.html</link>
      <guid>https://vitalik.ca/general/2022/07/13/networkstates.html</guid>
      <pubDate>Wed, 13 Jul 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>My 40-liter backpack travel guide</title>
      <link>https://vitalik.ca/general/2022/06/20/backpack.html</link>
      <guid>https://vitalik.ca/general/2022/06/20/backpack.html</guid>
      <pubDate>Mon, 20 Jun 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Some ways to use ZK-SNARKs for privacy</title>
      <link>https://vitalik.ca/general/2022/06/15/using_snarks.html</link>
      <guid>https://vitalik.ca/general/2022/06/15/using_snarks.html</guid>
      <pubDate>Wed, 15 Jun 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Where to use a blockchain in non-financial applications?</title>
      <link>https://vitalik.ca/general/2022/06/12/nonfin.html</link>
      <guid>https://vitalik.ca/general/2022/06/12/nonfin.html</guid>
      <pubDate>Sun, 12 Jun 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Two thought experiments to evaluate automated stablecoins</title>
      <link>https://vitalik.ca/general/2022/05/25/stable.html</link>
      <guid>https://vitalik.ca/general/2022/05/25/stable.html</guid>
      <pubDate>Wed, 25 May 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>In Defense of Bitcoin Maximalism</title>
      <link>https://vitalik.ca/general/2022/04/01/maximalist.html</link>
      <guid>https://vitalik.ca/general/2022/04/01/maximalist.html</guid>
      <pubDate>Fri, 01 Apr 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>The roads not taken</title>
      <link>https://vitalik.ca/general/2022/03/29/road.html</link>
      <guid>https://vitalik.ca/general/2022/03/29/road.html</guid>
      <pubDate>Tue, 29 Mar 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>How do trusted setups work?</title>
      <link>https://vitalik.ca/general/2022/03/14/trustedsetup.html</link>
      <guid>https://vitalik.ca/general/2022/03/14/trustedsetup.html</guid>
      <pubDate>Mon, 14 Mar 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Encapsulated vs systemic complexity in protocol design</title>
      <link>https://vitalik.ca/general/2022/02/28/complexity.html</link>
      <guid>https://vitalik.ca/general/2022/02/28/complexity.html</guid>
      <pubDate>Mon, 28 Feb 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Soulbound</title>
      <link>https://vitalik.ca/general/2022/01/26/soulbound.html</link>
      <guid>https://vitalik.ca/general/2022/01/26/soulbound.html</guid>
      <pubDate>Wed, 26 Jan 2022 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>The bulldozer vs vetocracy political axis</title>
      <link>https://vitalik.ca/general/2021/12/19/bullveto.html</link>
      <guid>https://vitalik.ca/general/2021/12/19/bullveto.html</guid>
      <pubDate>Sun, 19 Dec 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Endgame</title>
      <link>https://vitalik.ca/general/2021/12/06/endgame.html</link>
      <guid>https://vitalik.ca/general/2021/12/06/endgame.html</guid>
      <pubDate>Mon, 06 Dec 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Review of Optimism retro funding round 1</title>
      <link>https://vitalik.ca/general/2021/11/16/retro1.html</link>
      <guid>https://vitalik.ca/general/2021/11/16/retro1.html</guid>
      <pubDate>Tue, 16 Nov 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Halo and more: exploring incremental verification and SNARKs without pairings</title>
      <link>https://vitalik.ca/general/2021/11/05/halo.html</link>
      <guid>https://vitalik.ca/general/2021/11/05/halo.html</guid>
      <pubDate>Fri, 05 Nov 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Crypto Cities</title>
      <link>https://vitalik.ca/general/2021/10/31/cities.html</link>
      <guid>https://vitalik.ca/general/2021/10/31/cities.html</guid>
      <pubDate>Sun, 31 Oct 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>On Nathan Schneider on the limits of cryptoeconomics</title>
      <link>https://vitalik.ca/general/2021/09/26/limits.html</link>
      <guid>https://vitalik.ca/general/2021/09/26/limits.html</guid>
      <pubDate>Sun, 26 Sep 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Alternatives to selling at below-market-clearing prices for achieving fairness (or community sentiment, or fun)</title>
      <link>https://vitalik.ca/general/2021/08/22/prices.html</link>
      <guid>https://vitalik.ca/general/2021/08/22/prices.html</guid>
      <pubDate>Sun, 22 Aug 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Moving beyond coin voting governance</title>
      <link>https://vitalik.ca/general/2021/08/16/voting3.html</link>
      <guid>https://vitalik.ca/general/2021/08/16/voting3.html</guid>
      <pubDate>Mon, 16 Aug 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Against overuse of the Gini coefficient</title>
      <link>https://vitalik.ca/general/2021/07/29/gini.html</link>
      <guid>https://vitalik.ca/general/2021/07/29/gini.html</guid>
      <pubDate>Thu, 29 Jul 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Verkle trees</title>
      <link>https://vitalik.ca/general/2021/06/18/verkle.html</link>
      <guid>https://vitalik.ca/general/2021/06/18/verkle.html</guid>
      <pubDate>Fri, 18 Jun 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Blockchain voting is overrated among uninformed people but underrated among informed people</title>
      <link>https://vitalik.ca/general/2021/05/25/voting2.html</link>
      <guid>https://vitalik.ca/general/2021/05/25/voting2.html</guid>
      <pubDate>Tue, 25 May 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>The Limits to Blockchain Scalability</title>
      <link>https://vitalik.ca/general/2021/05/23/scaling.html</link>
      <guid>https://vitalik.ca/general/2021/05/23/scaling.html</guid>
      <pubDate>Sun, 23 May 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Why sharding is great: demystifying the technical properties</title>
      <link>https://vitalik.ca/general/2021/04/07/sharding.html</link>
      <guid>https://vitalik.ca/general/2021/04/07/sharding.html</guid>
      <pubDate>Wed, 07 Apr 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Gitcoin Grants Round 9: The Next Phase of Growth</title>
      <link>https://vitalik.ca/general/2021/04/02/round9.html</link>
      <guid>https://vitalik.ca/general/2021/04/02/round9.html</guid>
      <pubDate>Fri, 02 Apr 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>El recurso escaso más importante es la legitimidad</title>
      <link>https://vitalik.ca/general/2021/03/23/legitimacy_ES.html</link>
      <guid>https://vitalik.ca/general/2021/03/23/legitimacy_ES.html</guid>
      <pubDate>Tue, 23 Mar 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>The Most Important Scarce Resource is Legitimacy</title>
      <link>https://vitalik.ca/general/2021/03/23/legitimacy.html</link>
      <guid>https://vitalik.ca/general/2021/03/23/legitimacy.html</guid>
      <pubDate>Tue, 23 Mar 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Prediction Markets: Tales from the Election</title>
      <link>https://vitalik.ca/general/2021/02/18/election.html</link>
      <guid>https://vitalik.ca/general/2021/02/18/election.html</guid>
      <pubDate>Thu, 18 Feb 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>An approximate introduction to how zk-SNARKs are possible</title>
      <link>https://vitalik.ca/general/2021/01/26/snarks.html</link>
      <guid>https://vitalik.ca/general/2021/01/26/snarks.html</guid>
      <pubDate>Tue, 26 Jan 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Why we need wide adoption of social recovery wallets</title>
      <link>https://vitalik.ca/general/2021/01/11/recovery.html</link>
      <guid>https://vitalik.ca/general/2021/01/11/recovery.html</guid>
      <pubDate>Mon, 11 Jan 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>An Incomplete Guide to Rollups</title>
      <link>https://vitalik.ca/general/2021/01/05/rollup.html</link>
      <guid>https://vitalik.ca/general/2021/01/05/rollup.html</guid>
      <pubDate>Tue, 05 Jan 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>La Guía Incompleta de los Rollups</title>
      <link>https://vitalik.ca/general/2021/01/05/rollup_ES.html</link>
      <guid>https://vitalik.ca/general/2021/01/05/rollup_ES.html</guid>
      <pubDate>Tue, 05 Jan 2021 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Endnotes on 2020: Crypto and Beyond</title>
      <link>https://vitalik.ca/general/2020/12/28/endnotes.html</link>
      <guid>https://vitalik.ca/general/2020/12/28/endnotes.html</guid>
      <pubDate>Mon, 28 Dec 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Convex and Concave Dispositions</title>
      <link>https://vitalik.ca/general/2020/11/08/concave.html</link>
      <guid>https://vitalik.ca/general/2020/11/08/concave.html</guid>
      <pubDate>Sun, 08 Nov 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>為什麼權益證明棒棒的（2020 年十一月）</title>
      <link>https://vitalik.ca/general/2020/11/06/pos2020_zhTW.html</link>
      <guid>https://vitalik.ca/general/2020/11/06/pos2020_zhTW.html</guid>
      <pubDate>Fri, 06 Nov 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Why Proof of Stake (Nov 2020)</title>
      <link>https://vitalik.ca/general/2020/11/06/pos2020.html</link>
      <guid>https://vitalik.ca/general/2020/11/06/pos2020.html</guid>
      <pubDate>Fri, 06 Nov 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title> 7ème tour des subventions Gitcoin - Rétrospective </title>
      <link>https://vitalik.ca/general/2020/10/18/round7_FR.html</link>
      <guid>https://vitalik.ca/general/2020/10/18/round7_FR.html</guid>
      <pubDate>Sun, 18 Oct 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Gitcoin Grants Round 7 Retrospective</title>
      <link>https://vitalik.ca/general/2020/10/18/round7.html</link>
      <guid>https://vitalik.ca/general/2020/10/18/round7.html</guid>
      <pubDate>Sun, 18 Oct 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Coordination, Good and Bad</title>
      <link>https://vitalik.ca/general/2020/09/11/coordination.html</link>
      <guid>https://vitalik.ca/general/2020/09/11/coordination.html</guid>
      <pubDate>Fri, 11 Sep 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Trust Models</title>
      <link>https://vitalik.ca/general/2020/08/20/trust.html</link>
      <guid>https://vitalik.ca/general/2020/08/20/trust.html</guid>
      <pubDate>Thu, 20 Aug 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>A Philosophy of Blockchain Validation</title>
      <link>https://vitalik.ca/general/2020/08/17/philosophy.html</link>
      <guid>https://vitalik.ca/general/2020/08/17/philosophy.html</guid>
      <pubDate>Mon, 17 Aug 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Gitcoin Grants Round 6 Retrospective</title>
      <link>https://vitalik.ca/general/2020/07/22/round6.html</link>
      <guid>https://vitalik.ca/general/2020/07/22/round6.html</guid>
      <pubDate>Wed, 22 Jul 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Exploring Fully Homomorphic Encryption</title>
      <link>https://vitalik.ca/general/2020/07/20/homomorphic.html</link>
      <guid>https://vitalik.ca/general/2020/07/20/homomorphic.html</guid>
      <pubDate>Mon, 20 Jul 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Gitcoin Grants Round 5 Retrospective</title>
      <link>https://vitalik.ca/general/2020/04/30/round5.html</link>
      <guid>https://vitalik.ca/general/2020/04/30/round5.html</guid>
      <pubDate>Thu, 30 Apr 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>A Quick Garbled Circuits Primer</title>
      <link>https://vitalik.ca/general/2020/03/21/garbled.html</link>
      <guid>https://vitalik.ca/general/2020/03/21/garbled.html</guid>
      <pubDate>Sat, 21 Mar 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>預測市場：一個選舉小故事（2021年 二月）</title>
      <link>https://vitalik.ca/general/2020/02/18/election_zhTW.html</link>
      <guid>https://vitalik.ca/general/2020/02/18/election_zhTW.html</guid>
      <pubDate>Tue, 18 Feb 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Review of Gitcoin Quadratic Funding Round 4</title>
      <link>https://vitalik.ca/general/2020/01/28/round4.html</link>
      <guid>https://vitalik.ca/general/2020/01/28/round4.html</guid>
      <pubDate>Tue, 28 Jan 2020 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Base Layers And Functionality Escape Velocity</title>
      <link>https://vitalik.ca/general/2019/12/26/mvb.html</link>
      <guid>https://vitalik.ca/general/2019/12/26/mvb.html</guid>
      <pubDate>Thu, 26 Dec 2019 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Christmas Special</title>
      <link>https://vitalik.ca/general/2019/12/24/christmas.html</link>
      <guid>https://vitalik.ca/general/2019/12/24/christmas.html</guid>
      <pubDate>Tue, 24 Dec 2019 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Quadratic Payments: A Primer</title>
      <link>https://vitalik.ca/general/2019/12/07/quadratic.html</link>
      <guid>https://vitalik.ca/general/2019/12/07/quadratic.html</guid>
      <pubDate>Sat, 07 Dec 2019 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Hard Problems in Cryptocurrency: Five Years Later</title>
      <link>https://vitalik.ca/general/2019/11/22/progress.html</link>
      <guid>https://vitalik.ca/general/2019/11/22/progress.html</guid>
      <pubDate>Fri, 22 Nov 2019 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Review of Gitcoin Quadratic Funding Round 3</title>
      <link>https://vitalik.ca/general/2019/10/24/gitcoin.html</link>
      <guid>https://vitalik.ca/general/2019/10/24/gitcoin.html</guid>
      <pubDate>Thu, 24 Oct 2019 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>In-person meatspace protocol to prove unconditional possession of a private key</title>
      <link>https://vitalik.ca/general/2019/10/01/story.html</link>
      <guid>https://vitalik.ca/general/2019/10/01/story.html</guid>
      <pubDate>Tue, 01 Oct 2019 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Understanding PLONK</title>
      <link>https://vitalik.ca/general/2019/09/22/plonk.html</link>
      <guid>https://vitalik.ca/general/2019/09/22/plonk.html</guid>
      <pubDate>Sun, 22 Sep 2019 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>The Dawn of Hybrid Layer 2 Protocols</title>
      <link>https://vitalik.ca/general/2019/08/28/hybrid_layer_2.html</link>
      <guid>https://vitalik.ca/general/2019/08/28/hybrid_layer_2.html</guid>
      <pubDate>Wed, 28 Aug 2019 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Sidechains vs Plasma vs Sharding</title>
      <link>https://vitalik.ca/general/2019/06/12/plasma_vs_sharding.html</link>
      <guid>https://vitalik.ca/general/2019/06/12/plasma_vs_sharding.html</guid>
      <pubDate>Wed, 12 Jun 2019 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Fast Fourier Transforms</title>
      <link>https://vitalik.ca/general/2019/05/12/fft.html</link>
      <guid>https://vitalik.ca/general/2019/05/12/fft.html</guid>
      <pubDate>Sun, 12 May 2019 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Control as Liability</title>
      <link>https://vitalik.ca/general/2019/05/09/control_as_liability.html</link>
      <guid>https://vitalik.ca/general/2019/05/09/control_as_liability.html</guid>
      <pubDate>Thu, 09 May 2019 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>On Free Speech</title>
      <link>https://vitalik.ca/general/2019/04/16/free_speech.html</link>
      <guid>https://vitalik.ca/general/2019/04/16/free_speech.html</guid>
      <pubDate>Tue, 16 Apr 2019 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>On Collusion</title>
      <link>https://vitalik.ca/general/2019/04/03/collusion.html</link>
      <guid>https://vitalik.ca/general/2019/04/03/collusion.html</guid>
      <pubDate>Wed, 03 Apr 2019 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>[Mirror] Cantor was Wrong: debunking the infinite set hierarchy</title>
      <link>https://vitalik.ca/general/2019/04/01/cantor.html</link>
      <guid>https://vitalik.ca/general/2019/04/01/cantor.html</guid>
      <pubDate>Mon, 01 Apr 2019 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>A CBC Casper Tutorial</title>
      <link>https://vitalik.ca/general/2018/12/05/cbc_casper.html</link>
      <guid>https://vitalik.ca/general/2018/12/05/cbc_casper.html</guid>
      <pubDate>Wed, 05 Dec 2018 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>[Mirror] Central Planning as Overfitting</title>
      <link>https://vitalik.ca/general/2018/11/25/central_planning.html</link>
      <guid>https://vitalik.ca/general/2018/11/25/central_planning.html</guid>
      <pubDate>Sun, 25 Nov 2018 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Layer 1 Should Be Innovative in the Short Term but Less in the Long Term</title>
      <link>https://vitalik.ca/general/2018/08/26/layer_1.html</link>
      <guid>https://vitalik.ca/general/2018/08/26/layer_1.html</guid>
      <pubDate>Sun, 26 Aug 2018 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>A Guide to 99% Fault Tolerant Consensus</title>
      <link>https://vitalik.ca/general/2018/08/07/99_fault_tolerant.html</link>
      <guid>https://vitalik.ca/general/2018/08/07/99_fault_tolerant.html</guid>
      <pubDate>Tue, 07 Aug 2018 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>STARKs, Part 3: Into the Weeds</title>
      <link>https://vitalik.ca/general/2018/07/21/starks_part_3.html</link>
      <guid>https://vitalik.ca/general/2018/07/21/starks_part_3.html</guid>
      <pubDate>Sat, 21 Jul 2018 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>On Radical Markets</title>
      <link>https://vitalik.ca/general/2018/04/20/radical_markets.html</link>
      <guid>https://vitalik.ca/general/2018/04/20/radical_markets.html</guid>
      <pubDate>Fri, 20 Apr 2018 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Governance, Part 2: Plutocracy Is Still Bad</title>
      <link>https://vitalik.ca/general/2018/03/28/plutocracy.html</link>
      <guid>https://vitalik.ca/general/2018/03/28/plutocracy.html</guid>
      <pubDate>Wed, 28 Mar 2018 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Proof of Stake FAQ</title>
      <link>https://vitalik.ca/general/2017/12/31/pos_faq.html</link>
      <guid>https://vitalik.ca/general/2017/12/31/pos_faq.html</guid>
      <pubDate>Sun, 31 Dec 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Sharding FAQ</title>
      <link>https://vitalik.ca/general/2017/12/31/sharding_faq.html</link>
      <guid>https://vitalik.ca/general/2017/12/31/sharding_faq.html</guid>
      <pubDate>Sun, 31 Dec 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Notes on Blockchain Governance</title>
      <link>https://vitalik.ca/general/2017/12/17/voting.html</link>
      <guid>https://vitalik.ca/general/2017/12/17/voting.html</guid>
      <pubDate>Sun, 17 Dec 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>A Quick Gasprice Market Analysis</title>
      <link>https://vitalik.ca/general/2017/12/14/gas_analysis.html</link>
      <guid>https://vitalik.ca/general/2017/12/14/gas_analysis.html</guid>
      <pubDate>Thu, 14 Dec 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>STARKs, Part II: Thank Goodness It's FRI-day</title>
      <link>https://vitalik.ca/general/2017/11/22/starks_part_2.html</link>
      <guid>https://vitalik.ca/general/2017/11/22/starks_part_2.html</guid>
      <pubDate>Wed, 22 Nov 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>STARKs, Part I: Proofs with Polynomials</title>
      <link>https://vitalik.ca/general/2017/11/09/starks_part_1.html</link>
      <guid>https://vitalik.ca/general/2017/11/09/starks_part_1.html</guid>
      <pubDate>Thu, 09 Nov 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>On Medium-of-Exchange Token Valuations</title>
      <link>https://vitalik.ca/general/2017/10/17/moe.html</link>
      <guid>https://vitalik.ca/general/2017/10/17/moe.html</guid>
      <pubDate>Tue, 17 Oct 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>A Prehistory of the Ethereum Protocol</title>
      <link>https://vitalik.ca/general/2017/09/14/prehistory.html</link>
      <guid>https://vitalik.ca/general/2017/09/14/prehistory.html</guid>
      <pubDate>Thu, 14 Sep 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>A Note on Metcalfe's Law, Externalities and Ecosystem Splits</title>
      <link>https://vitalik.ca/general/2017/07/27/metcalfe.html</link>
      <guid>https://vitalik.ca/general/2017/07/27/metcalfe.html</guid>
      <pubDate>Thu, 27 Jul 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>The Triangle of Harm</title>
      <link>https://vitalik.ca/general/2017/07/16/triangle_of_harm.html</link>
      <guid>https://vitalik.ca/general/2017/07/16/triangle_of_harm.html</guid>
      <pubDate>Sun, 16 Jul 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>On Path Independence</title>
      <link>https://vitalik.ca/general/2017/06/22/marketmakers.html</link>
      <guid>https://vitalik.ca/general/2017/06/22/marketmakers.html</guid>
      <pubDate>Thu, 22 Jun 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Analyzing Token Sale Models</title>
      <link>https://vitalik.ca/general/2017/06/09/sales.html</link>
      <guid>https://vitalik.ca/general/2017/06/09/sales.html</guid>
      <pubDate>Fri, 09 Jun 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Engineering Security Through Coordination Problems</title>
      <link>https://vitalik.ca/general/2017/05/08/coordination_problems.html</link>
      <guid>https://vitalik.ca/general/2017/05/08/coordination_problems.html</guid>
      <pubDate>Mon, 08 May 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Hard Forks, Soft Forks, Defaults and Coercion</title>
      <link>https://vitalik.ca/general/2017/03/14/forks_and_markets.html</link>
      <guid>https://vitalik.ca/general/2017/03/14/forks_and_markets.html</guid>
      <pubDate>Tue, 14 Mar 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>A Note On Charity Through Marginal Price Discrimination</title>
      <link>https://vitalik.ca/general/2017/03/11/a_note_on_charity.html</link>
      <guid>https://vitalik.ca/general/2017/03/11/a_note_on_charity.html</guid>
      <pubDate>Sat, 11 Mar 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>[Mirror] Zk-SNARKs: Under the Hood</title>
      <link>https://vitalik.ca/general/2017/02/01/zk_snarks.html</link>
      <guid>https://vitalik.ca/general/2017/02/01/zk_snarks.html</guid>
      <pubDate>Wed, 01 Feb 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>[Mirror] Exploring Elliptic Curve Pairings</title>
      <link>https://vitalik.ca/general/2017/01/14/exploring_ecp.html</link>
      <guid>https://vitalik.ca/general/2017/01/14/exploring_ecp.html</guid>
      <pubDate>Sat, 14 Jan 2017 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>[Mirror] A Proof of Stake Design Philosophy</title>
      <link>https://vitalik.ca/general/2016/12/29/pos_design.html</link>
      <guid>https://vitalik.ca/general/2016/12/29/pos_design.html</guid>
      <pubDate>Thu, 29 Dec 2016 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>[Mirror] Bir Proof of Stake Tasarım Felsefesi</title>
      <link>https://vitalik.ca/general/2016/12/29/pos_design_TR.html</link>
      <guid>https://vitalik.ca/general/2016/12/29/pos_design_TR.html</guid>
      <pubDate>Thu, 29 Dec 2016 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>[Mirror] Quadratic Arithmetic Programs: from Zero to Hero</title>
      <link>https://vitalik.ca/general/2016/12/10/qap.html</link>
      <guid>https://vitalik.ca/general/2016/12/10/qap.html</guid>
      <pubDate>Sat, 10 Dec 2016 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Na colusão</title>
      <link>https://vitalik.ca/general/2000/01/01/On_Collusion_Portuguese.html</link>
      <guid>https://vitalik.ca/general/2000/01/01/On_Collusion_Portuguese.html</guid>
      <pubDate>Sat, 01 Jan 2000 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Über Kollusion</title>
      <link>https://vitalik.ca/general/2000/01/01/On_Collusion_DE.html</link>
      <guid>https://vitalik.ca/general/2000/01/01/On_Collusion_DE.html</guid>
      <pubDate>Sat, 01 Jan 2000 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Zmowa</title>
      <link>https://vitalik.ca/general/2000/01/01/On_Collusion_Polish.html</link>
      <guid>https://vitalik.ca/general/2000/01/01/On_Collusion_Polish.html</guid>
      <pubDate>Sat, 01 Jan 2000 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      
      <item>
      <title>Situazioni di collusione</title>
      <link>https://vitalik.ca/general/2000/01/01/On_Collusion_IT.html</link>
      <guid>https://vitalik.ca/general/2000/01/01/On_Collusion_IT.html</guid>
      <pubDate>Sat, 01 Jan 2000 00:00:00 +0000</pubDate>
      <description></description>
      </item>
      
      </channel>
      </rss>`),
      };
    }
    return {
      status: 200,
      headers: {
        "content-type": "text/html",
      },
      text: () => `<!DOCTYPE html>
      <html>
      <meta charset="UTF-8">
      <style>
      @media (prefers-color-scheme: dark) {
          body {
              background-color: #1c1c1c;
              color: white;
          }
          .markdown-body table tr {
              background-color: #1c1c1c;
          }
          .markdown-body table tr:nth-child(2n) {
              background-color: black;
          }
      }
      </style>
      
      
      
      <link rel="alternate" type="application/rss+xml" href="./feed.xml" title="Vitalik Buterin's website">
      
      
      
      <link rel="stylesheet" type="text/css" href="./css/common-vendor.b8ecfc406ac0b5f77a26.css">
      <link rel="stylesheet" type="text/css" href="./css/fretboard.f32f2a8d5293869f0195.css">
      <link rel="stylesheet" type="text/css" href="./css/pretty.0ae3265014f89d9850bf.css">
      <link rel="stylesheet" type="text/css" href="./css/pretty-vendor.83ac49e057c3eac4fce3.css">
      <link rel="stylesheet" type="text/css" href="./css/global.css">
      <link rel="stylesheet" type="text/css" href="./css/misc.css">
      
      <script type="text/x-mathjax-config">
      <script>
      MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\(', '\)']]
        },
        svg: {
          fontCache: 'global',
        }
      };
      </script>
      <script type="text/javascript" id="MathJax-script" async
        src="./scripts/tex-svg.js">
      </script>
      
      <style>
      </style>
      
      <div id="doc" class="container-fluid markdown-body comment-enabled" data-hard-breaks="true">`,
    };
  };
  await FollowingPlanetModel.follow("vitalik.eth");
});

test("ens follow homepage", async () => {
  require("ethers").contenthash = "ipns://abc";
  require("ethers").avatar = "http://123";
  global.fetch = (url) => {
    return {
      status: 200,
      headers: {
        "content-type": "text/html",
      },
      text: () => `<!DOCTYPE html>
      <html>
      <meta charset="UTF-8">
      <style>
      @media (prefers-color-scheme: dark) {
          body {
              background-color: #1c1c1c;
              color: white;
          }
          .markdown-body table tr {
              background-color: #1c1c1c;
          }
          .markdown-body table tr:nth-child(2n) {
              background-color: black;
          }
      }
      </style>      
      
      <link rel="stylesheet" type="text/css" href="./css/common-vendor.b8ecfc406ac0b5f77a26.css">
      <link rel="stylesheet" type="text/css" href="./css/fretboard.f32f2a8d5293869f0195.css">
      <link rel="stylesheet" type="text/css" href="./css/pretty.0ae3265014f89d9850bf.css">
      <link rel="stylesheet" type="text/css" href="./css/pretty-vendor.83ac49e057c3eac4fce3.css">
      <link rel="stylesheet" type="text/css" href="./css/global.css">
      <link rel="stylesheet" type="text/css" href="./css/misc.css">
      
      <script type="text/x-mathjax-config">
      <script>
      MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\(', '\)']]
        },
        svg: {
          fontCache: 'global',
        }
      };
      </script>
      <script type="text/javascript" id="MathJax-script" async
        src="./scripts/tex-svg.js">
      </script>
      
      <style>
      </style>
      
      <div id="doc" class="container-fluid markdown-body comment-enabled" data-hard-breaks="true">`,
    };
  };
  await FollowingPlanetModel.follow("vitalik.eth");
});
