import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import { StableDiffusionRender } from "../Components/StableDiffusionRender"
import {Gallery} from "../DataBase/RenderLibraryDB"
import { v4 as uuidv4 } from 'uuid'

export default (components: OBC.Components, galleryDb: Gallery) => {
    // const library = new LibraryComponent(components)
    const renderer = new StableDiffusionRender(components) 
    const spinner = document.querySelector(".loader") as HTMLDivElement
    let prompt: string
    const onPromptChange = (e: Event) => {
        const target = e.target as BUI.TextInput
        prompt = target.value
    }
    const onRenderClick = async () => {
        console.log("running render")
        try {
            // modal.close()
            spinner.classList.toggle("hide")
            const renderedImages = await renderer.render(prompt)
            if (!renderedImages) throw new Error("Something went wrong, render images is undefined")
            for ( const imageURL of renderedImages ) {
                console.log("IMAGE BEING SAVED...", imageURL)
                // *this was wrapped in a settimeout before for 10 seconds....
                // TODO: need to get the current active image in sliders UUID
                const activeImage = document.querySelector(".image-active") as HTMLImageElement
                await galleryDb.saveRender(imageURL, )
                // await library.update(imageURL)
                
            }
        } catch (error) {
            throw new Error(`Unable to complete render: ${error}`)
        } finally {
            spinner.classList.toggle("hide")
            
        }
    }

    return BUI.Component.create<BUI.PanelSection>(() => {
        return BUI.html `
            <div style="display: flex; gap: 1.5rem; align-items: center; margin-top: 10px">
                <div style="display: flex; flex-direction: column; gap: .5rem;">
                    <bim-text-input style="resize: horizontal; width: 500px; height: 30px;" value="${prompt}" @input=${onPromptChange} vertical placeholder="Search..." debounce="200"></bim-text-input>
                </div>
                <div style="display: flex; flex-direction: row; gap: .5rem;">
                    <bim-button style="height:60px;" @click=${onRenderClick} label="Render" icon=""></bim-button>
                </div>
            </div>
            
        `
    })
}
