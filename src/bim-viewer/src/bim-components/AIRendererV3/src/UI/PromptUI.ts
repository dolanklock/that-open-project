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
        try {
            spinner.classList.toggle("hide")
            const renderedImages = await renderer.render(prompt)
            if (!renderedImages) throw new Error("Something went wrong, render images is undefined")
            for ( const imageURL of renderedImages ) {
                console.log("IMAGE BEING SAVED...", imageURL)
                // *this was wrapped in a settimeout before for 10 seconds....
                await galleryDb.save(imageURL, "testing", new Date().toDateString(), uuidv4())
                // await library.update(imageURL)
                
            }
        } catch (error) {
            throw new Error(`Unable to complete render: ${error}`)
        } finally {
            spinner.classList.toggle("hide")
        }
    }

    const modal = BUI.Component.create<HTMLDialogElement>(() => {
        return BUI.html `
            <dialog style="resize: both;">
                <bim-panel> 
                    <div style="display: flex; flex-direction: column; gap: 1.5rem; padding: 20px;">
                        <div style="display: flex; flex-direction: column; gap: .5rem;">
                            <bim-label style="display: flex" icon="mingcute:rocket-fill">Render Prompt</bim-label>
                            <bim-text-input value="${prompt}" @input=${onPromptChange} vertical placeholder="Search..." debounce="200"></bim-text-input>
                        </div>
                        <div style="display: flex; flex-direction: row; gap: .5rem;">
                            <bim-button @click=${onRenderClick} label="Render" icon=""></bim-button>
                        </div>
                    </div>
                </bim-panel>
            </dialog>
        `
    })

    document.body.append(modal)

    return BUI.Component.create<BUI.PanelSection>(() => {
        return BUI.html `
            <bim-button @click=${() => modal.showModal()} label="Render" icon="tabler:eye-filled" tooltip-title="Show All" tooltip-text="Shows all elements in all models."></bim-button>
        `
    })
}
