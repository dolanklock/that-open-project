/* eslint-disable prettier/prettier */
import * as OBC from "@thatopen/components"
import * as BUI from "@thatopen/ui"
import * as OBF from "@thatopen/components-front"
import { LibraryComponent } from "./src/Components/LibraryComponent"
import {StableDiffusionRender} from "./src/Components/StableDiffusionRender"
import Settings from "./src/UI/SettingsUI"
import Prompt from "./src/UI/PromptUI"
import Library from "./src/UI/libraryUI"
import {Gallery} from "./src/DataBase/RenderLibraryDB"


export default (components: OBC.Components) => {
    const library = new LibraryComponent(components)
    const galleryDB = new Gallery()
    galleryDB.init()
    
    return BUI.Component.create<BUI.Panel>(() => {
        return BUI.html`
            <bim-panel style="grid-area: elementDataPanel">
                <bim-panel-section label="AI Renderer V3" icon="ph:cursor-fill">
                    ${Prompt(components, galleryDB)}
                    ${Settings(components)}
                    ${Library(components, galleryDB)}
                </bim-panel-section> 
            </bim-panel> 
        `
      })
    }