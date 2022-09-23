const PIXEL_FONT = "Press Start 2P";

// ##### retro-box #####

class RetroBox extends HTMLElement {
    constructor() {
        super();

        // TEMPLATE
        const RETRO_BOX_TEMPLATE = document.createElement("template");
        RETRO_BOX_TEMPLATE.innerHTML =
`
<style>
    :host {
        display: grid;
        grid: 16px auto 16px / 16px 112px auto 112px 16px;
        image-rendering: -moz-crisp-edges;
        image-rendering: pixelated;
    }

    .retro-box-main {
        grid-area: 2 / 2 / 2 / 5;
        background-image: url('${window.PLANET.assetsPrefix}assets/retro-box/retro-box-bg-tile-dark.png');
        background-size: 64px 64px;
        background-repeat: repeat;
        color: white;
        font-family: '${PIXEL_FONT}', dinkie, 'Consolas', monospace;
        font-size: 16px;
        text-align: center;
    }

    .retro-box-main h2 {
        font-size: 24px;
    }

    .top-left {
        background-image: url('${window.PLANET.assetsPrefix}assets/retro-box/retro-box-top-left-corner.png');
        background-size: 16px 16px;
        background-repeat: no-repeat;
    }

    .top-right {
        background-image: url('${window.PLANET.assetsPrefix}assets/retro-box/retro-box-top-right-corner.png');
        background-size: 16px 16px;
        background-repeat: no-repeat;
    }

    .bottom-left {
        background-image: url('${window.PLANET.assetsPrefix}assets/retro-box/retro-box-bottom-left-corner.png');
        background-size: 16px 16px;
        background-repeat: no-repeat;
    }

    .bottom-right {
        background-image: url('${window.PLANET.assetsPrefix}assets/retro-box/retro-box-bottom-right-corner.png');
        background-size: 16px 16px;
        background-repeat: no-repeat;
    }

    .horizontal-left {
        background-image: url('${window.PLANET.assetsPrefix}assets/retro-box/retro-box-horizontal-left.png');
        background-size: 112px 16px;
        background-repeat: no-repeat;
    }

    .horizontal-right {
        background-image: url('${window.PLANET.assetsPrefix}assets/retro-box/retro-box-horizontal-right.png');
        background-size: 112px 16px;
        background-repeat: no-repeat;
    }

    .vertical-tile {
        background-image: url('${window.PLANET.assetsPrefix}assets/retro-box/retro-box-vertical-tile.png');
        background-size: 16px 80px;
        background-repeat: repeat-y;
        image-rendering: pixelated;
    }

    .horizontal-tile {
        background-image: url('${window.PLANET.assetsPrefix}assets/retro-box/retro-box-horizontal-tile.png');
        background-size: 64px 16px;
        background-repeat: repeat-x;
        image-rendering: pixelated;
    }
</style>

<div class="top-left"></div>
<div class="horizontal-left"></div>
<div class="horizontal-tile"></div>
<div class="horizontal-right"></div>
<div class="top-right"></div>

<div class="vertical-tile"></div>
<div class="retro-box-main"><slot></slot></div>
<div class="vertical-tile"></div>

<div class="bottom-left"></div>
<div class="horizontal-left"></div>
<div class="horizontal-tile"></div>
<div class="horizontal-right"></div>
<div class="bottom-right"></div>
`

        const SHADOW_ROOT = this.attachShadow({ 'mode': 'closed' });
        let content = RETRO_BOX_TEMPLATE.content.cloneNode(true);
        SHADOW_ROOT.appendChild(content);
    }
}

// ##### color-box #####

// Usage: <color-box theme="grass"><color-box>

class ColorBox extends HTMLElement {
    constructor() {
        super();

        // TEMPLATE
        const COLOR_BOX_TEMPLATE = document.createElement('template');
        COLOR_BOX_TEMPLATE.innerHTML =
`
<style>
    :host {
        display: grid;
        grid-template-columns: 16px auto 16px;
        grid-template-rows: 16px auto 16px;
        grid-column-gap: 0px;
        grid-row-gap: 0px;
        image-rendering: -moz-crisp-edges;
        image-rendering: pixelated;
    }

    .box-main {
        background-color: rgba(0, 0, 0, 0.5);
        color: white;
        font-family: 'dinkie', 'Consolas', monospace;
        font-size: 16px;
        padding: 16px;
    }

    .box-main p, .box-main span {
        font-size: 16px;
        line-height: 100%;
    }

    .box-main h2 {
        font-size: 24px;
        line-height: 1;
    }

    .top-left {
        background-size: 16px 16px;
        background-repeat: no-repeat;
        image-rendering: pixelated;
    }

    .top-right {
        background-size: 16px 16px;
        background-repeat: no-repeat;
        image-rendering: pixelated;
    }

    .bottom-left {
        background-size: 16px 16px;
        background-repeat: no-repeat;
        image-rendering: pixelated;
    }

    .bottom-right {
        background-size: 16px 16px;
        background-repeat: no-repeat;
        image-rendering: pixelated;
    }

    .left-tile {
        background-size: 16px 16px;
        background-repeat: repeat-y;
        image-rendering: pixelated;
    }

    .right-tile {
        background-size: 16px 16px;
        background-repeat: repeat-y;
        image-rendering: pixelated;
    }

    .top-tile {
        background-size: 16px 16px;
        background-repeat: repeat-x;
        image-rendering: pixelated;
    }

    .bottom-tile {
        background-size: 16px 16px;
        background-repeat: repeat-x;
        image-rendering: pixelated;
    }
</style>

<div class="top-left"></div>
<div class="top-tile"></div>
<div class="top-right"></div>

<div class="left-tile"></div>
<div class="box-main"><slot></slot></div>
<div class="right-tile"></div>

<div class="bottom-left"></div>
<div class="bottom-tile"></div>
<div class="bottom-right"></div>
`

        this.attachShadow({ 'mode': 'open' });
        let content = COLOR_BOX_TEMPLATE.content.cloneNode(true);
        this.shadowRoot.appendChild(content);
    }

    set theme(theme) {
        const THEMES = ['ice', 'fire', 'grass', 'dark'];
        if (!THEMES.includes(theme)) {
            console.error(`No theme "${theme}" available`);
            return;
        }

        let style = document.createElement('style');
        style.id = 'theme-css';
        style.innerHTML = `
            .top-left { background-image: url('${window.PLANET.assetsPrefix}assets/boxes/${theme}/top-left.png'); }
            .top-right { background-image: url('${window.PLANET.assetsPrefix}assets/boxes/${theme}/top-right.png'); }
            .bottom-left { background-image: url('${window.PLANET.assetsPrefix}assets/boxes/${theme}/bottom-left.png'); }
            .bottom-right { background-image: url('${window.PLANET.assetsPrefix}assets/boxes/${theme}/bottom-right.png'); }
            .left-tile { background-image: url('${window.PLANET.assetsPrefix}assets/boxes/${theme}/left-tile.png'); }
            .right-tile { background-image: url('${window.PLANET.assetsPrefix}assets/boxes/${theme}/right-tile.png'); }
            .top-tile { background-image: url('${window.PLANET.assetsPrefix}assets/boxes/${theme}/top-tile.png'); }
            .bottom-tile { background-image: url('${window.PLANET.assetsPrefix}assets/boxes/${theme}/bottom-tile.png'); }
        `;
        let elem = this.shadowRoot.querySelector('#theme-css');
        if (elem) {
            this.shadowRoot.replaceChild(style, elem);
        } else {
            this.shadowRoot.prepend(style);
        }
    }

    static get observedAttributes() {
        return ['theme'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name.toLowerCase() === 'theme') {
            this.theme = newVal;
        }
    }
}

// ##### mech-box #####

class MechBox extends HTMLElement {
    constructor() {
        super();

        const MECH_BOX_TEMPLATE = document.createElement('template');
        MECH_BOX_TEMPLATE.innerHTML =
`
<style>
    :host {
        display: grid;
        grid-template-columns: 16px auto 16px;
        grid-template-rows: 16px auto 16px;
        grid-column-gap: 0px;
        grid-row-gap: 0px;
        image-rendering: -moz-crisp-edges;
        image-rendering: pixelated;
    }

    .mech-box-main {
        background-color: black;
        background-image: url('${window.PLANET.assetsPrefix}assets/boxes/mech/main-tile.png');
        background-size: 64px 64px;
        background-repeat: repeat;
        color: black;
        font-family: '${PIXEL_FONT}', 'dinkie', 'Consolas', monospace;
        font-size: 16px;
        padding: 0px;
        text-align: center;
    }

    ::slotted(h2) {
        font-size: 18px;
    }

    .sep16 {
        height: 16px;
    }

    .top-left {
        background-image: url('${window.PLANET.assetsPrefix}assets/boxes/mech/top-left.png');
        background-size: 16px 16px;
        background-repeat: no-repeat;
    }

    .top-right {
        background-image: url('${window.PLANET.assetsPrefix}assets/boxes/mech/top-right.png');
        background-size: 16px 16px;
        background-repeat: no-repeat;
    }

    .bottom-left {
        background-image: url('${window.PLANET.assetsPrefix}assets/boxes/mech/bottom-left.png');
        background-size: 16px 16px;
        background-repeat: no-repeat;
    }

    .bottom-right {
        background-image: url('${window.PLANET.assetsPrefix}assets/boxes/mech/bottom-right.png');
        background-size: 16px 16px;
        background-repeat: no-repeat;
    }

    .left-tile {
        background-image: url('${window.PLANET.assetsPrefix}assets/boxes/mech/left-tile.png');
        background-size: 16px 64px;
        background-repeat: repeat-y;
        image-rendering: pixelated;
    }

    .right-tile {
        background-image: url('${window.PLANET.assetsPrefix}assets/boxes/mech/right-tile.png');
        background-size: 16px 64px;
        background-repeat: repeat-y;
        image-rendering: pixelated;
    }

    .top-tile {
        background-image: url('${window.PLANET.assetsPrefix}assets/boxes/mech/top-tile.png');
        background-size: 64px 16px;
        background-repeat: repeat-x;
        image-rendering: pixelated;
    }

    .bottom-tile {
        background-image: url('${window.PLANET.assetsPrefix}assets/boxes/mech/bottom-tile.png');
        background-size: 64px 16px;
        background-repeat: repeat-x;
        image-rendering: pixelated;
    }

    @media only screen and (max-width: 600px) {

    }
</style>

<div class="top-left"></div>
<div class="top-tile"></div>
<div class="top-right"></div>

<div class="left-tile"></div>
<div class="mech-box-main"><slot></slot></div>
<div class="right-tile"></div>

<div class="bottom-left"></div>
<div class="bottom-tile"></div>
<div class="bottom-right"></div>
`

        const SHADOW_ROOT = this.attachShadow({ 'mode': 'closed' });
        let content = MECH_BOX_TEMPLATE.content.cloneNode(true);
        SHADOW_ROOT.appendChild(content);
    }
}

// ##### simple-box #####

// Usage: <simple-box link="/" caption="V2EX"><simple-box>

class SimpleBox extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // TEMPLATE
        const SIMPLE_BOX_TEMPLATE = document.createElement('template');
        SIMPLE_BOX_TEMPLATE.innerHTML =
`
<style>
    :host {
        display: grid;
        grid-template-columns: 32px auto 32px;
        grid-template-rows: 32px auto 32px;
        grid-column-gap: 0px;
        grid-row-gap: 0px;
        image-rendering: -moz-crisp-edges;
        image-rendering: pixelated;
    }

    a:link, a:visited {
        color: white;
        text-decoration: none;
    }

    a:hover {
        color: #ccd;
        text-decoration: none;
    }

    .box-main {
        background-color: transparent;
        color: white;
        font-family: 'Dinkie', 'Consolas', monospace;
        font-size: 14px;
        padding: 0px;
    }

    .box-main p, .box-main span {
        font-size: 16px;
        line-height: 100%;
    }

    .box-main h2 {
        font-size: 24px;
    }

    .top-left {
        background-image: url('${window.PLANET.assetsPrefix}assets/simple-box/simple-box-top-left.png');
        background-size: 32px 32px;
        background-repeat: no-repeat;
        image-rendering: pixelated;
    }

    .top-right {
        background-image: url('${window.PLANET.assetsPrefix}assets/simple-box/simple-box-top-right.png');
        background-size: 32px 32px;
        background-repeat: no-repeat;
        image-rendering: pixelated;
    }

    .bottom-left {
        background-image: url('${window.PLANET.assetsPrefix}assets/simple-box/simple-box-bottom-left.png');
        background-size: 32px 32px;
        background-repeat: no-repeat;
        image-rendering: pixelated;
    }

    .bottom-right {
        background-image: url('${window.PLANET.assetsPrefix}assets/simple-box/simple-box-bottom-right.png');
        background-size: 32px 32px;
        background-repeat: no-repeat;
        image-rendering: pixelated;
    }

    .left-tile {

    }

    .right-tile {

    }

    .top-tile {
        font-size: 8px;
        line-height: 16px;
        padding: 0px 8px 0px 8px;
        text-align: center;
        font-family: "Press Start 2P";
    }

    .bottom-tile {
        background-image: url('${window.PLANET.assetsPrefix}assets/simple-box/simple-box-bottom-tile.png');
        background-size: 32px 32px;
        background-repeat: repeat-x;
        image-rendering: pixelated;
    }
</style>

<div class="top-left"></div>
<div class="top-tile"></div>
<div class="top-right"></div>

<div class="left-tile"></div>
<div class="box-main"><slot></slot></div>
<div class="right-tile"></div>

<div class="bottom-left"></div>
<div class="bottom-tile"></div>
<div class="bottom-right"></div>
`

        let content = SIMPLE_BOX_TEMPLATE.content.cloneNode(true);
        this.shadowRoot.appendChild(content);
    }

    set link(link) {
        let top = this.shadowRoot.querySelector('.top-tile');
        let a = this.shadowRoot.querySelector('.top-tile > a');
        if (link) {
            if (!a) {
                a = document.createElement('a');
                // moves all elements inside `.top-tile` to `.top-tile > a`
                a.append(...top.childNodes);
                top.append(a);
            }
            a.setAttribute('href', link);
        } else {
            if (a) {
                // moves all elements inside `.top-tile > a` to `.top-tile`
                top.append(...a.childNodes);
                top.removeChild(a)
            }
        }
    }

    set caption(caption) {
        let elem = this.shadowRoot.querySelector('.top-tile > a');
        if (!elem) {
            elem = this.shadowRoot.querySelector('.top-tile');
        }
        elem.textContent = caption;
    }

    static get observedAttributes() {
        return ['link', 'caption'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        switch (name.toLowerCase()) {
            case 'link':
                this.link = newVal;
                break;
            case 'caption':
                this.caption = newVal;
                break;
        }
    }
}

window.customElements.define('retro-box', RetroBox);
window.customElements.define('color-box', ColorBox);
window.customElements.define('mech-box', MechBox);
window.customElements.define('simple-box', SimpleBox);
