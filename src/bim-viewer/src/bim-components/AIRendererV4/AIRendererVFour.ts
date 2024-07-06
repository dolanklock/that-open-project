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

// TODO: need save for render and screenshot
// if i do a render and click render button from existing screenshot
// then need to get the existing saved item in database
// that has screenshot already and save the rendered image to that
// if taking screenshot of model or uploading new screenshot need
// to save a brand new item to DB


// TODO: db needs to have projectID/ project name,
// and render and screenshot

// should be able to click on dropdown on card and change the project
// its currently grouped under and it will move to that group
// (render image and screenshot)

// TODO: need to make so that when change a cards project to something else,
// it brings both the render and screenshot images over to that project

// projects UI should be a button to add new proejt then new bim sectio npanel is added
// to both renders and screen shots and then when when click on dropdown on card for project change
// you will see that new project in it and then can select it and it will move the cards over
// to that group

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


    