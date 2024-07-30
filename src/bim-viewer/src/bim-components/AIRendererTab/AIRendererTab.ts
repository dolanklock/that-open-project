/* eslint-disable prettier/prettier */
import * as OBC from "@thatopen/components"
import * as BUI from "@thatopen/ui"
import * as OBF from "@thatopen/components-front"
import { LibraryComponent } from "./src/LibraryComponent"
import {StableDiffusionRender} from "./src/StableDiffusionRender"
import Settings from "./src/Settings"

export class Renderer extends OBC.Component {
    static readonly uuid: string = "34c2550f-b481-45c4-af5b-891e5e88c17a"
    private _library: LibraryComponent
    private _components: OBC.Components
    private _renderer: StableDiffusionRender
    enabled = true
    viewer: HTMLDivElement

    constructor(components: OBC.Components, viewer: HTMLDivElement) {
        super(components)
        components.add(Renderer.uuid, this)
        this._components = components
        this.viewer = document.getElementById("bim-container") as HTMLDivElement
        this._library = new LibraryComponent(components, viewer)
        this._renderer = new StableDiffusionRender(components)
    }
    async onRenderClick() {
        const spinner = document.querySelector(".loader") as HTMLDivElement
        try {
            spinner.classList.toggle("hide")
            // TODO: need to add correct prompt
            const renderedImages = await this._renderer.render("modern home")
            if (!renderedImages) throw new Error("Something went wrong, render images is undefined")
            for ( const imageURL of renderedImages ) {
                console.log("IMAGE BEING SAVED...", imageURL)
                await this._library.update(imageURL)
            }
        } catch (error) {
            throw new Error(`Unable to complete render: ${error}`)
        } finally {
            spinner.classList.toggle("hide")
        }
    }
    get() {
        return BUI.Component.create<BUI.PanelSection>(() => {
            return BUI.html`
              <bim-toolbar-section label="AI Reghfghnderer" icon="ph:cursor-fill">
                ${this._library.get()}
                
              </bim-toolbar-section> 
            `
          })
    }
}

    // return BUI.Component.create<BUI.Tab>(() => {
    //     return BUI.html `
    //     bim-tab name="AI Renderer Tool" label="AI Renderer Tool" icon="material-symbols:help"
    //         <bim-panel>
    //             <bim-panel-section label="AI Render" icon="tabler:world">
    //                 <div style="display: flex; gap: 0.375rem;">
    //                     <bim-label icon="mingcute:rocket-fill">Prompt</bim-label>
    //                     <bim-text-input @input=${onPrompt} vertical placeholder="Search..." debounce="200"></bim-text-input>
    //                 </div>
    //                 <bim-button style="flex: 0;" label="Render" @click=${onRenderClick} icon="eva:expand-fill"></bim-button>
    //             </bim-panel-section>
        
    //             ${Settings(components)}
        
    //             ${library.bimPanelSection}
    
    //         </bim-panel>
    //     </bim-tab>
    
    //     `
    // })


// TODO: make so that renders are side by side in gallery at least two
// TODO: need to make expand button on render card functional
// TODO: figure out API key in environment variables functional
// TODO: make so that spinner is built in to tool
// TODO: need to add more setting options?
// TODO: tweak whatever i need to in order to make renders look amazing