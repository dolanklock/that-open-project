import * as OBC from "@thatopen/components"
import * as BUI from "@thatopen/ui"
import * as OBF from "@thatopen/components-front"

// import Settings from "../../components/Panels/Settings"

export default (components: OBC.Components) => {
    const spinner = document.querySelector(".loader") as HTMLDivElement
    const viewer = document.getElementById("bim-container")!
    const app = document.getElementById("app")!
    const library = new LibraryComponent(components, viewer)
    const renderer = new StableDiffusionRender(components)
    let prompt: string
    
    const onRenderClick = async () => {
        try {
            spinner.classList.toggle("hide")
            const renderedImages = await renderer.render(prompt)
            if (!renderedImages) throw new Error("Something went wrong, render images is undefined")
            for ( const imageURL of renderedImages ) {
                console.log("IMAGE BEING SAVED...", imageURL)
                await library.update(imageURL)
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
    return BUI.Component.create<BUI.PanelSection>(() => {
        return BUI.html`
          <bim-toolbar-section label="AI Renderer" icon="ph:cursor-fill">
            ${library.get()}
            
          </bim-toolbar-section> 
        `
      })
    }