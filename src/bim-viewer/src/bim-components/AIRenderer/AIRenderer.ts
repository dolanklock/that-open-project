/* eslint-disable prettier/prettier */
import * as OBC from "@thatopen/components"
import * as BUI from "@thatopen/ui"
import * as OBF from "@thatopen/components-front"
import { LibraryComponent, Library } from "./src/LibraryComponent"
import {StableDiffusionRender} from "./src/StableDiffusionRender"
import Settings from "./src/Settings"
import TakeScreenshot from "./src/TakeScreenshot"
import { Gallery } from "./src/DataBase/RenderLibraryDB"
// import Settings from "../../components/Panels/Settings"

export default (components: OBC.Components) => {
    const spinner = document.querySelector(".loader") as HTMLDivElement
    const library = new LibraryComponent(components)
    const renderer = new StableDiffusionRender(components)
    const galleryDb = new Gallery()
    const lib = new Library(components, galleryDb)
    lib.render()
    galleryDb.init()
    let prompt: string
    

    // TODO: need to figure out how to call lib.render() when screenshot is taken...

    const onRenderClick = async () => {
        try {
            spinner.classList.toggle("hide")
            const renderedImages = await renderer.render(prompt)
            if (!renderedImages) throw new Error("Something went wrong, render images is undefined")
            for ( const imageURL of renderedImages ) {
                console.log("IMAGE BEING SAVED...", imageURL)
                await library.update(imageURL)
            }
            lib.render()
        } catch (error) {
            throw new Error(`Unable to complete render: ${error}`)
        } finally {
            spinner.classList.toggle("hide")
        }
    }

    const onPrompt = (e: Event) => {
        const target = e.target as BUI.TextInput
        prompt = target.value
    }
    // const takeScreenshot = async () => {
    //     const test = TakeScreenshot(components, galleryDb)
    //     lib.render()
    //     return test
    // }

    return BUI.Component.create<BUI.Tab>(() => {
        return BUI.html `
        bim-tab name="AI Renderer Tool" label="AI Renderer Tool" icon="material-symbols:help"
            <bim-panel>
                ${TakeScreenshot(components, galleryDb)}
                <bim-panel-section label="AI Render" icon="tabler:world">
                    <div style="display: flex; gap: 0.375rem;">
                        <bim-label icon="mingcute:rocket-fill">Prompt</bim-label>
                        <bim-text-input @input=${onPrompt} vertical placeholder="Search..." debounce="200"></bim-text-input>
                    </div>
                    <bim-button style="flex: 0;" label="Render" @click=${onRenderClick} icon="eva:expand-fill"></bim-button>
                </bim-panel-section>
        
                ${Settings(components)}
        
                ${library.bimPanelSection}
                ${lib.mainContainer}
    
            </bim-panel>
        </bim-tab>
    
        `
    })
}

// TODO: make so that renders are side by side in gallery at least two
// TODO: need to make expand button on render card functional
// TODO: figure out API key in environment variables functional
// TODO: make so that spinner is built in to tool
// TODO: need to add more setting options?
// TODO: tweak whatever i need to in order to make renders look amazing