import * as OBC from "@thatopen/components"
import * as BUI from "@thatopen/ui"
import * as OBF from "@thatopen/components-front"
import { LibraryComponent } from "./src/Components/LibraryComponent"
import {StableDiffusionRender} from "./src/Components/StableDiffusionRender"
import Settings from "./src/UI/SettingsUI"
import Prompt from "./src/UI/PromptUI"
import {Gallery} from "./src/DataBase/RenderLibraryDB"


export default (components: OBC.Components) => {
    const library = new LibraryComponent(components)
    const galleryDB = new Gallery()
    galleryDB.init()
    
    return BUI.Component.create<BUI.PanelSection>(() => {
        return BUI.html`
            <bim-toolbar-section label="AI Renderer V3" icon="ph:cursor-fill">
                ${Prompt(components, galleryDB)}
                <bim-button label="Prompt" icon="tabler:eye-filled" tooltip-title="Prompt" tooltip-text="Shows all elements in all models."></bim-button>
                ${Settings(components)}
            </bim-toolbar-section> 
        `
      })
    }

