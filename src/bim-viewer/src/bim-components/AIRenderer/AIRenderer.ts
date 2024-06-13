import * as OBC from "@thatopen/components"
import * as BUI from "@thatopen/ui"
import * as OBF from "@thatopen/components-front"
import { LibraryComponent } from "./src/LibraryComponent"
import {StableDiffusionRender} from "./src/StableDiffusionRender"
import { SettingsComponent } from "./src/SettingsComponent"

export default (components: OBC.Components, proxyURL: string, uploadURL: string, processURL: string) => {
    const APIKEY = "5Dc5hLuEiPd9ie3PKG6Tv51hXDLlhU52iTOwPhqL6FJZdj6OC5cCYrngMpEq"
    const spinner = document.querySelector(".loader") as HTMLDivElement
    const library = new LibraryComponent(components)
    const settings = new SettingsComponent(components)
    const renderer = new StableDiffusionRender(components, proxyURL, uploadURL, processURL)
    // TODO: need way to set value of inputs on page refresh with values from settings DB
    // the UI below is using renderer.width, etc.. as starting values...
    // renderer.init()
    let prompt: string
    let negPrompt: string
    let width: string
    let height: string
    const onRenderClick = async () => {
        try {
            spinner.classList.toggle("hide")
            const renderedImages = await renderer.render(APIKEY, prompt)
            if (!renderedImages) {
                throw new Error("Something went wrong, render images is undefined")
            } else {
                for ( const imageURL of renderedImages ) {
                    console.log("IMAGE BEING SAVED...", imageURL)
                    await library.update(imageURL)
                }
            }
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
    const onNegPromptChange = (e: Event) => {
        const target = e.target as BUI.TextInput
        negPrompt = target.value

    }
    const onWidthChange = (e: Event) => {
        const target = e.target as BUI.TextInput
        width = target.value
    }
    const onHeightChange = (e: Event) => {
        const target = e.target as BUI.TextInput
        height = target.value
    }
    const onSettingsUpdate = () => {
        renderer.negPrompt = negPrompt
        renderer.width = width
        renderer.height = height
        settings.update(renderer.negPrompt, renderer.width, renderer.height)
        console.log("settings on update", settings.getDB())
    }

    return BUI.Component.create<BUI.Tab>(() => {
        return BUI.html `
        bim-tab name="AI Renderer Tool" label="AI Renderer Tool" icon="material-symbols:help"
            <bim-panel>
                <bim-panel-section style="background-color: #22272e;" label="AI Render" icon="tabler:world">
                    <div style="display: flex; gap: 0.375rem;">
                        <bim-label icon="mingcute:rocket-fill">Prompt</bim-label>
                        <bim-text-input @input=${onPrompt} vertical placeholder="Search..." debounce="200"></bim-text-input>
                    </div>
                    <bim-button style="flex: 0;" label="Render" @click=${onRenderClick} icon="eva:expand-fill"></bim-button>
                </bim-panel-section>
        
                <bim-panel-section style="background-color: #22272e;" label="Settings" icon="tabler:world">
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div style="display: flex; flex-direction: column; gap: .5rem;">
                        <bim-label style="display: flex" icon="mingcute:rocket-fill">Negative prompt</bim-label>
                        <bim-text-input value="${renderer.negPrompt}" @input=${onNegPromptChange} vertical placeholder="Search..." debounce="200"></bim-text-input>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: .5rem;">
                        <bim-label style="display: flex" icon="mingcute:rocket-fill">Wifth</bim-label>
                        <bim-text-input value="${renderer.width}" @input=${onWidthChange} vertical placeholder="Search..." debounce="200"></bim-text-input>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: .5rem;">
                        <bim-label style="display: flex" icon="mingcute:rocket-fill">Height</bim-label>
                        <bim-text-input value="${renderer.height}" @input=${onHeightChange} vertical placeholder="Search..." debounce="200"></bim-text-input>
                        </div>
                    </div>
                    <br>
                    <bim-button style="flex: 0;" label="Update" @click=${onSettingsUpdate} icon="eva:expand-fill"></bim-button>
                </bim-panel-section>
        
                ${library.bimPanelSection}
    
            </bim-panel>
        </bim-tab>
    
        `
    })
}

// TODO: the SettingsComponent module should not have the negprompt width and height settings
// that should come from the sstable diffusion module

// TODO: not getting renderer properly for screenshot in SD file
// TODO: existing DB items dont have uuid attrbute so the method deleteItems in renderlivrarydb file cant find
// the uuid so im trying to update existing db items with the uuid key matching the uuid fromm the card jtml
// item but doesnt see to be working (in librarycomponents file)


// TODO: get prompt value from the input html element and pass to onRenderCLick

// TODO: need to update so API key is not in code base - refer to open companny master class for how to avoid it
// "This shouldn't be in your code on production, but on an environment variable"

// should have a button for generate which will open dialog for user to input text.
// what is showing in the scene is what will be sent to SD API

// library should have thumbnail of small image with time stamp underneath and descirption of render. should
// be able to click on thumbnail and enlarge image to view
