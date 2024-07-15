import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import { StableDiffusionRender } from "../Components/StableDiffusionRender"
import {Gallery} from "../DataBase/RenderLibraryDB"
import { v4 as uuidv4 } from 'uuid'
import { getActiveScreenshotImage } from "./src/Functions"

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
        const activeImg = await galleryDb.getActiveScreenshotImageAsDataUrl() as string
        console.log("image RETRIVED", activeImg)
        try {
            spinner.classList.toggle("hide")
            const renderedImage = await renderer.render(prompt, activeImg)
            if (!renderedImage) throw new Error("Something went wrong, render images is undefined")
            const activeSlide = document.querySelector(".active") as HTMLDivElement
            const uuid = activeSlide.dataset.uuid as string
            console.log("rendered image hereee", renderedImage)
            // without this settimeout i get a 404 error
            setTimeout(async () => {
                await galleryDb.saveRender(renderedImage[0], uuid)
            }, 15000);
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
