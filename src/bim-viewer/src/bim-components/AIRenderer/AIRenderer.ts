import * as OBC from "@thatopen/components"
import * as BUI from "@thatopen/ui"
import * as OBF from "@thatopen/components-front"
import {Gallery} from "./src/DataBase/RenderLibraryDB"
import { LibraryComponent } from "./src/LibraryComponent"
import {StableDiffusionRender} from "./src/StableDiffusionRender"
import { v4 as uuidv4 } from 'uuid'

// import { v4 as uuidv4 } from 'uuid'
// import * as OBC from "@thatopen/components"
// import {LibraryUIComponent} from "./src/LibraryUIComponent"
// import {RibbonUIComponent} from "./src/RibbonUIComponent"
// import {SettingsUIComponent} from "./src/SettingsUIComponent"
// import {StableDiffusionRender} from "./src/StableDiffusionRender"

// export class AIRenderer extends OBC.Component {
//     enabled: boolean = true
//     static uuid: string = uuidv4()
//     private _components: OBC.Components
//     private _APIKey: string
//     private _ribbonUI: RibbonUIComponent
//     private _libraryUI: LibraryUIComponent
//     private _settingsUI: SettingsUIComponent
//     // private _spinner: OBC.Spinner
//     proxyURL: string
//     uploadURL: string
//     processURL: string
//     renderer: StableDiffusionRender

//     constructor(components: OBC.Components, APIKey: string, proxyURL: string, uploadURL: string, processURL: string) {
//         super(components)
//         this._components = components
//         this._components.add(AIRenderer.uuid, this)
//         this.processURL = processURL
//         this.proxyURL = proxyURL
//         this.uploadURL = uploadURL
//         this._APIKey = APIKey
//         this.renderer = new StableDiffusionRender(this._components, this.proxyURL, this.uploadURL, this.processURL)
//         this._ribbonUI = new RibbonUIComponent(this._components)
//         this._libraryUI = new LibraryUIComponent(this._components)
//         this._settingsUI = new SettingsUIComponent(this._components)
//         // this._spinner = new OBC.Spinner(this._components)
//         // this._spinner.visible = false
//         // this._components.ui.add(this._spinner)
//         this._libraryUI.update()
//         this._setUI()
//     }

//     private _setUI() {
//         const form = new OBC.Modal(this._components)
//         form.title = "AI Renderer"
//         this._components.ui.add(form)
//         form.onCancel.add(() => {
//             form.visible = !form.visible
//         })
//         form.onAccept.add(async () => {
//             console.log("DB", this._settingsUI.getDB())
//             const prompt = formPrompt.value
//             if (!prompt) {
//                 alert("Enter a prompt!")
//             } else {
//                 form.visible = false
//                 // this._spinner.visible = true
//                 try {
//                     const renderedImages = await this.renderer.render(this._APIKey, prompt)
//                     if (!renderedImages) {
//                         // this._spinner.visible = false
//                         throw new Error("Something went wrong, render images is undefined")
//                     } else {
//                         for ( const imageURL of renderedImages ) {
//                             await this._libraryUI.addRenderCard(imageURL, "testing")
//                         }
//                     }
//                     // this._spinner.visible = false
//                 } catch (error) {
//                     this._spinner.visible = false
//                     throw new Error(`Unable to complete render: ${error}`)
//                 }
//             }
//         })
//         // form input
//         const formPrompt = new OBC.TextArea(this._components)
//         formPrompt.label = "Prompt AI"
//         form.slots.content.addChild(formPrompt)
//         form.slots.content.get().style.padding = "20px"
//         form.slots.content.get().style.display = "flex"
//         form.slots.content.get().style.flexDirection = "column"
//         form.slots.content.get().style.rowGap = "20px"
//         this._ribbonUI.onRenderclick.add(() => {
//             form.visible = true
//         })
//         this._libraryUISetup()
//         this._settingsUISetup()
//         this.uiElement.set({RibbonUIComponent: this._ribbonUI})
//     }

//     private _libraryUISetup() {
//         const libraryFloatingWindow = new OBC.FloatingWindow(this._components)
//         this._components.ui.add(libraryFloatingWindow)
//         libraryFloatingWindow.visible = false
//         libraryFloatingWindow.title = "AI Rendering Library"
//         libraryFloatingWindow.addChild(this._libraryUI)
//         this._ribbonUI.onLibraryclick.add(() => {
//             libraryFloatingWindow.visible = true
//         })
//     }

//     private _settingsUISetup() {
//         this._settingsUI.updateFormInputsFromDB()
//         const settingsForm = new OBC.Modal(this._components)
//         settingsForm.onAccept.add(async () => {
//             await this._settingsUI.update()
//             this.renderer.negPrompt = this._settingsUI.negativePrompt
//             this.renderer.width = this._settingsUI.width
//             this.renderer.height = this._settingsUI.height
//             console.log("updated renderer", this.renderer.width, this.renderer.height, this.renderer.negPrompt)
//             settingsForm.visible = false
//         })
//         settingsForm.addChild(this._settingsUI)
//         settingsForm.title = "Render Settings"
//         this._components.ui.add(settingsForm)
//         settingsForm.visible = false
//         this._ribbonUI.onSettingsclick.add(() => {
//             settingsForm.visible = true
//         })
//     }

//     dispose() {
//     }

//     get(): any {
//         return undefined
//     }
// }

// TODO: not getting renderer properly for screenshot in SD file
// TODO: existing DB items dont have uuid attrbute so the method deleteItems in renderlivrarydb file cant find
// the uuid so im trying to update existing db items with the uuid key matching the uuid fromm the card jtml
// item but doesnt see to be working (in librarycomponents file)

export default (components: OBC.Components, proxyURL: string, uploadURL: string, processURL: string) => {
    const APIKEY = "5Dc5hLuEiPd9ie3PKG6Tv51hXDLlhU52iTOwPhqL6FJZdj6OC5cCYrngMpEq"
    const renderer = new StableDiffusionRender(components, proxyURL, uploadURL, processURL)
    const library = new LibraryComponent(components)
    let prompt: string
    const onRenderClick = async () => {
        console.log("PROMPT", prompt)
        try {
            const renderedImages = await renderer.render(APIKEY, "A futuristic and stunningly beautiful high-rise shopping center architectural structure with bold, futuristic design elements, blending seamlessly into the art form of digital illustration. Inspired by the works of Zaha Hadid. The scene showcases the center amidst a bustling city, its sleek lines contrasting with the urban environment. A warm color temperature adds vibrancy, highlighting the architectural details. Shoppers and visitors exhibit expressions of awe and excitement. Illuminated by soft, diffused lighting, the atmosphere exudes sophistication and promise of tomorrow")
            if (!renderedImages) {
                // this._spinner.visible = false
                throw new Error("Something went wrong, render images is undefined")
            } else {
                for ( const imageURL of renderedImages ) {
                    console.log("IMAGE BEING SAVED...", imageURL)
                    await library.galleryDB.save(imageURL, "testing", new Date().toDateString(), uuidv4())
                }
                await library.render()
            }
            // this._spinner.visible = false
        } catch (error) {
            // this._spinner.visible = false
            throw new Error(`Unable to complete render: ${error}`)
        }
    }
    const onPrompt = (e: Event) => {
        // const world = components.get(OBC.Worlds)
        // console.log("world components", world.components)
        // console.log("world list", components.list)
        const target = e.target as BUI.TextInput
        prompt = target.value
        console.log(prompt)
        library.updateItems()
        console.log(library.galleryDB.db.renders.toArray())
    }

    // TODO: get prompt value from the input html element and pass to onRenderCLick
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
                        <bim-text-input @input= vertical placeholder="Search..." debounce="200"></bim-text-input>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: .5rem;">
                        <bim-label style="display: flex" icon="mingcute:rocket-fill">Wifth</bim-label>
                        <bim-text-input @input= vertical placeholder="Search..." debounce="200"></bim-text-input>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: .5rem;">
                        <bim-label style="display: flex" icon="mingcute:rocket-fill">Height</bim-label>
                        <bim-text-input @input= vertical placeholder="Search..." debounce="200"></bim-text-input>
                        </div>
                    </div>
                    <br>
                    <bim-button style="flex: 0;" label="Update" @click= icon="eva:expand-fill"></bim-button>
                </bim-panel-section>
        
                ${library.bimPanelSection}
    
            </bim-panel>
        </bim-tab>
    
        `
    })
}



// TODO: need to update so API key is not in code base - refer to open companny master class for how to avoid it
// "This shouldn't be in your code on production, but on an environment variable"

// should have a button for generate which will open dialog for user to input text.
// what is showing in the scene is what will be sent to SD API

// library should have thumbnail of small image with time stamp underneath and descirption of render. should
// be able to click on thumbnail and enlarge image to view
