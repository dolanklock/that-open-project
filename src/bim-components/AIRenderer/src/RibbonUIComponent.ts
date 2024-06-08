import * as OBC from "openbim-components"

export class RibbonUIComponent extends OBC.SimpleUIComponent {
    onRenderclick = new OBC.Event()
    onSettingsclick = new OBC.Event()
    onLibraryclick = new OBC.Event()
    constructor(components: OBC.Components) {
        const template = `
        <bim-toolbar-section label="AI Renderer">
            <bim-button id="render" vertical label="Render" icon="lets-icons:load-list"></bim-button>
            <bim-button id="render-library" vertical label="Library" icon="solar:library-bold"></bim-button>
            <bim-button id="render-settings" vertical label="Settings" icon="material-symbols-light:settings"></bim-button>
        </bim-toolbar-section>
        `
        super(components, template)
        this.getInnerElement("render")?.addEventListener("click", (e: Event) => {
            this.onRenderclick.trigger(e)
        })
        this.getInnerElement("render-library")?.addEventListener("click", (e: Event) => {
            this.onLibraryclick.trigger(e)
        })
        this.getInnerElement("render-settings")?.addEventListener("click", (e: Event) => {
            this.onSettingsclick.trigger(e)
        })
        this.get().style.backgroundColor = "#22272e"
    }
}