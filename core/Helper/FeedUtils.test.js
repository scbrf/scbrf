jest.mock("fs");
const FeedUtils = require("./FeedUtils");
test("findFeed", async () => {
  global.fetch = () => ({
    status: 200,
    headers: {
      "content-type": "text/html",
    },
    body: "dummy",
    text: () => `

    <!DOCTYPE html>
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
    
    <div id="doc" class="container-fluid markdown-body comment-enabled" data-hard-breaks="true">
    
    <div id="color-mode-switch">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <input type="checkbox" id="switch" />
      <label for="switch">Dark Mode Toggle</label>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </div>
    
    <script type="text/javascript">
      // Update root html class to set CSS colors
      const toggleDarkMode = () => {
        const root = document.querySelector('html');
        root.classList.toggle('dark');
      }
    
      // Update local storage value for colorScheme
      const toggleColorScheme = () => {
        const colorScheme = localStorage.getItem('colorScheme');
        if (colorScheme === 'light') localStorage.setItem('colorScheme', 'dark');
        else localStorage.setItem('colorScheme', 'light');
      }
    
      // Set toggle input handler
      const toggle = document.querySelector('#color-mode-switch input[type="checkbox"]');
      if (toggle) toggle.onclick = () => {
        toggleDarkMode();
        toggleColorScheme();
      }
    
      // Check for color scheme on init
      const checkColorScheme = () => {
        const colorScheme = localStorage.getItem('colorScheme');
        // Default to light for first view
        if (colorScheme === null || colorScheme === undefined) localStorage.setItem('colorScheme', 'light');
        // If previously saved to dark, toggle switch and update colors
        if (colorScheme === 'dark') {
          toggle.checked = true;
          toggleDarkMode();
        }
      }
      checkColorScheme();
    </script>
    
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Vitalik Buterin's website" />
    <meta name="twitter:image" content="http://vitalik.ca/images/icon.png" />
    
    
    <title> Vitalik Buterin's website </title>
    <br>
    <center><h1 style="border-bottom:0px"> Vitalik Buterin's website </h1></center>
    
    <center><hr>
    <span class="toc-category" style="font-size:77%"><a href="./categories/blockchains.html">Blockchains</a></span>
    <span class="toc-category" style="font-size:70%"><a href="./categories/cryptography.html">Cryptography</a></span>
    <span class="toc-category" style="font-size:100%"><a href="./categories/deutsch.html">Deutsch</a></span>
    <span class="toc-category" style="font-size:94%"><a href="./categories/economics.html">Economics</a></span>
    <span class="toc-category" style="font-size:100%"><a href="./categories/español.html">Español</a></span>
    <span class="toc-category" style="font-size:100%"><a href="./categories/français.html">Français</a></span>
    <span class="toc-category" style="font-size:100%"><a href="./categories/fun.html">Fun</a></span>
    <span class="toc-category" style="font-size:100%"><a href="./categories/general.html">General</a></span>
    <span class="toc-category" style="font-size:100%"><a href="./categories/gitcoin.html">Gitcoin</a></span>
    <span class="toc-category" style="font-size:100%"><a href="./categories/italiano.html">Italiano</a></span>
    <span class="toc-category" style="font-size:100%"><a href="./categories/math.html">Math</a></span>
    <span class="toc-category" style="font-size:85%"><a href="./categories/philosophy.html">Philosophy</a></span>
    <span class="toc-category" style="font-size:100%"><a href="./categories/polski.html">Polski</a></span>
    <span class="toc-category" style="font-size:94%"><a href="./categories/português.html">Português</a></span>
    <span class="toc-category" style="font-size:100%"><a href="./categories/türkçe.html">Türkçe</a></span>
    <span class="toc-category" style="font-size:100%"><a href="./categories/中文.html">中文</a></span>
    <hr></center>
    
    <br>
    <ul class="post-list" style="padding-left:0">
    
    
    
    <li>
        <span class="post-meta">2023 Aug 16</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2023/08/16/communitynotes.html">What do I think about Community Notes?</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2023 Jul 24</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2023/07/24/biometric.html">What do I think about biometric proof of personhood?</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2023 Jun 20</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2023/06/20/deeperdive.html">Deeper dive on cross-L2 reading for wallets and other use cases</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2023 Jun 09</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2023/06/09/three_transitions.html">The Three Transitions</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2023 May 21</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2023/05/21/dont_overload.html">Don't overload Ethereum's consensus</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2023 Apr 14</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2023/04/14/traveltime.html">Travel time ~= 750 * distance ^ 0.6</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2023 Mar 31</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2023/03/31/zkmulticlient.html">How will Ethereum's multi-client philosophy interact with ZK-EVMs?</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2023 Feb 28</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2023/02/28/ux.html">Some personal user experiences</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2023 Jan 20</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2023/01/20/stealth.html">An incomplete guide to stealth addresses</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Dec 30</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/12/30/institutions.html">What even is an institution?</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Dec 06</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/12/06/gpt3.html">Updating my blog: a quick GPT chatbot coding experiment</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Dec 05</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/12/05/excited.html">What in the Ethereum application ecosystem excites me</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Nov 19</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/11/19/proof_of_solvency.html">Having a safe CEX: proof of solvency and beyond</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Oct 28</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/10/28/revenue_evil.html">The Revenue-Evil Curve: a different way to think about prioritizing public goods funding</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Sep 20</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/09/20/daos.html">DAOs are not corporations: where decentralization in autonomous organizations matters</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Sep 17</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/09/17/layer_3.html">What kind of layer 3s make sense?</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Sep 09</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/09/09/ens.html">Should there be demand-based recurring fees on ENS domains?</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Aug 04</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/08/04/zkevm.html">The different types of ZK-EVMs</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Jul 13</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/07/13/networkstates.html">What do I think about network states?</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Jun 20</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/06/20/backpack.html">My 40-liter backpack travel guide</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Jun 15</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/06/15/using_snarks.html">Some ways to use ZK-SNARKs for privacy</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Jun 12</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/06/12/nonfin.html">Where to use a blockchain in non-financial applications?</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 May 25</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/05/25/stable.html">Two thought experiments to evaluate automated stablecoins</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Apr 01</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/04/01/maximalist.html">In Defense of Bitcoin Maximalism</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Mar 29</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/03/29/road.html">The roads not taken</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Mar 14</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/03/14/trustedsetup.html">How do trusted setups work?</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Feb 28</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/02/28/complexity.html">Encapsulated vs systemic complexity in protocol design</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2022 Jan 26</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2022/01/26/soulbound.html">Soulbound</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Dec 19</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/12/19/bullveto.html">The bulldozer vs vetocracy political axis</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Dec 06</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/12/06/endgame.html">Endgame</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Nov 16</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/11/16/retro1.html">Review of Optimism retro funding round 1</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Nov 05</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/11/05/halo.html">Halo and more: exploring incremental verification and SNARKs without pairings</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Oct 31</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/10/31/cities.html">Crypto Cities</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Sep 26</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/09/26/limits.html">On Nathan Schneider on the limits of cryptoeconomics</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Aug 22</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/08/22/prices.html">Alternatives to selling at below-market-clearing prices for achieving fairness (or community sentiment, or fun)</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Aug 16</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/08/16/voting3.html">Moving beyond coin voting governance</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Jul 29</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/07/29/gini.html">Against overuse of the Gini coefficient</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Jun 18</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/06/18/verkle.html">Verkle trees</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 May 25</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/05/25/voting2.html">Blockchain voting is overrated among uninformed people but underrated among informed people</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 May 23</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/05/23/scaling.html">The Limits to Blockchain Scalability</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Apr 07</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/04/07/sharding.html">Why sharding is great: demystifying the technical properties</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Apr 02</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/04/02/round9.html">Gitcoin Grants Round 9: The Next Phase of Growth</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Mar 23</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/03/23/legitimacy.html">The Most Important Scarce Resource is Legitimacy</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Feb 18</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/02/18/election.html">Prediction Markets: Tales from the Election</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Jan 26</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/01/26/snarks.html">An approximate introduction to how zk-SNARKs are possible</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Jan 11</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/01/11/recovery.html">Why we need wide adoption of social recovery wallets</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2021 Jan 05</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2021/01/05/rollup.html">An Incomplete Guide to Rollups</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2020 Dec 28</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2020/12/28/endnotes.html">Endnotes on 2020: Crypto and Beyond</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2020 Nov 08</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2020/11/08/concave.html">Convex and Concave Dispositions</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2020 Nov 06</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2020/11/06/pos2020.html">Why Proof of Stake (Nov 2020)</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2020 Oct 18</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2020/10/18/round7.html">Gitcoin Grants Round 7 Retrospective</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2020 Sep 11</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2020/09/11/coordination.html">Coordination, Good and Bad</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2020 Aug 20</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2020/08/20/trust.html">Trust Models</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2020 Aug 17</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2020/08/17/philosophy.html">A Philosophy of Blockchain Validation</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2020 Jul 22</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2020/07/22/round6.html">Gitcoin Grants Round 6 Retrospective</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2020 Jul 20</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2020/07/20/homomorphic.html">Exploring Fully Homomorphic Encryption</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2020 Apr 30</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2020/04/30/round5.html">Gitcoin Grants Round 5 Retrospective</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2020 Mar 21</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2020/03/21/garbled.html">A Quick Garbled Circuits Primer</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2020 Jan 28</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2020/01/28/round4.html">Review of Gitcoin Quadratic Funding Round 4</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2019 Dec 26</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2019/12/26/mvb.html">Base Layers And Functionality Escape Velocity</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2019 Dec 24</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2019/12/24/christmas.html">Christmas Special</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2019 Dec 07</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2019/12/07/quadratic.html">Quadratic Payments: A Primer</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2019 Nov 22</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2019/11/22/progress.html">Hard Problems in Cryptocurrency: Five Years Later</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2019 Oct 24</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2019/10/24/gitcoin.html">Review of Gitcoin Quadratic Funding Round 3</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2019 Oct 01</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2019/10/01/story.html">In-person meatspace protocol to prove unconditional possession of a private key</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2019 Sep 22</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2019/09/22/plonk.html">Understanding PLONK</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2019 Aug 28</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2019/08/28/hybrid_layer_2.html">The Dawn of Hybrid Layer 2 Protocols</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2019 Jun 12</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2019/06/12/plasma_vs_sharding.html">Sidechains vs Plasma vs Sharding</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2019 May 12</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2019/05/12/fft.html">Fast Fourier Transforms</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2019 May 09</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2019/05/09/control_as_liability.html">Control as Liability</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2019 Apr 16</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2019/04/16/free_speech.html">On Free Speech</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2019 Apr 03</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2019/04/03/collusion.html">On Collusion</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2019 Apr 01</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2019/04/01/cantor.html">[Mirror] Cantor was Wrong: debunking the infinite set hierarchy</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2018 Dec 05</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2018/12/05/cbc_casper.html">A CBC Casper Tutorial</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2018 Nov 25</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2018/11/25/central_planning.html">[Mirror] Central Planning as Overfitting</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2018 Aug 26</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2018/08/26/layer_1.html">Layer 1 Should Be Innovative in the Short Term but Less in the Long Term</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2018 Aug 07</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2018/08/07/99_fault_tolerant.html">A Guide to 99% Fault Tolerant Consensus</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2018 Jul 21</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2018/07/21/starks_part_3.html">STARKs, Part 3: Into the Weeds</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2018 Apr 20</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2018/04/20/radical_markets.html">On Radical Markets</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2018 Mar 28</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2018/03/28/plutocracy.html">Governance, Part 2: Plutocracy Is Still Bad</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Dec 31</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/12/31/pos_faq.html">Proof of Stake FAQ</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Dec 31</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/12/31/sharding_faq.html">Sharding FAQ</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Dec 17</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/12/17/voting.html">Notes on Blockchain Governance</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Dec 14</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/12/14/gas_analysis.html">A Quick Gasprice Market Analysis</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Nov 22</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/11/22/starks_part_2.html">STARKs, Part II: Thank Goodness It's FRI-day</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Nov 09</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/11/09/starks_part_1.html">STARKs, Part I: Proofs with Polynomials</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Oct 17</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/10/17/moe.html">On Medium-of-Exchange Token Valuations</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Sep 14</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/09/14/prehistory.html">A Prehistory of the Ethereum Protocol</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Jul 27</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/07/27/metcalfe.html">A Note on Metcalfe's Law, Externalities and Ecosystem Splits</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Jul 16</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/07/16/triangle_of_harm.html">The Triangle of Harm</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Jun 22</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/06/22/marketmakers.html">On Path Independence</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Jun 09</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/06/09/sales.html">Analyzing Token Sale Models</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 May 08</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/05/08/coordination_problems.html">Engineering Security Through Coordination Problems</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Mar 14</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/03/14/forks_and_markets.html">Hard Forks, Soft Forks, Defaults and Coercion</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Mar 11</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/03/11/a_note_on_charity.html">A Note On Charity Through Marginal Price Discrimination</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Feb 01</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/02/01/zk_snarks.html">[Mirror] Zk-SNARKs: Under the Hood</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2017 Jan 14</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2017/01/14/exploring_ecp.html">[Mirror] Exploring Elliptic Curve Pairings</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2016 Dec 29</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2016/12/29/pos_design.html">[Mirror] A Proof of Stake Design Philosophy</a>
        </h3>
    </li>
    
    
    
    <li>
        <span class="post-meta">2016 Dec 10</span>
        <h3 style="margin-top:12px">
          <a class="post-link" href="./general/2016/12/10/qap.html">[Mirror] Quadratic Arithmetic Programs: from Zero to Hero</a>
        </h3>
    </li>
    
     </ul> `,
  });
  const result = await FeedUtils.findFeed("http://a.b.c");
  expect(result[0]).toBeTruthy();
});
