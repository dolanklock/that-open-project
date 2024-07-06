import * as OBC from "@thatopen/components"
import * as BUI from "@thatopen/ui"
import * as OBF from "@thatopen/components-front"
import { LibraryComponent } from "./src/Components/LibraryComponent"
import {StableDiffusionRender} from "./src/Components/StableDiffusionRender"
import Settings from "./src/UI/SettingsUI"
import Prompt from "./src/UI/PromptUI"
import Library from "./src/UI/libraryUI"
import {Gallery} from "./src/DataBase/RenderLibraryDB"
import TakeScreenshot from "./src/UI/TakeScreenshot"
import { takeCoverage } from "v8"


export default (components: OBC.Components) => {
    const galleryDb = new Gallery()
    galleryDb.init()
    console.log("hererere", galleryDb)
    // const library = new LibraryComponent(components, galleryDb)
    
    return BUI.Component.create<BUI.PanelSection>(() => {
        return BUI.html`
            <bim-toolbar-section label="AI Renderer V4" icon="ph:cursor-fill">
                ${TakeScreenshot(components, galleryDb)}
                ${Library(components, galleryDb)}
            </bim-toolbar-section> 
        `
      })
    }


    