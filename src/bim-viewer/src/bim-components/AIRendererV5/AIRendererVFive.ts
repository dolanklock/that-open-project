/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
import * as OBC from "@thatopen/components"
import * as BUI from "@thatopen/ui"
import * as OBF from "@thatopen/components-front"
import { LibraryComponent, Library } from "./src/LibraryComponent"
import {StableDiffusionRender} from "./src/StableDiffusionRender"
import Settings from "./src/Settings"
import TakeScreenshot from "./src/TakeScreenshot"
import { Gallery } from "./src/DataBase/RenderLibraryDB"
import { v4 as uuidv4 } from 'uuid'
// import Settings from "../../components/Panels/Settings"

export default (components: OBC.Components, galleryDb: Gallery, library: Library) => {
    const spinner = document.querySelector(".loader") as HTMLDivElement
    // const library = new LibraryComponent(components)
    const renderer = new StableDiffusionRender(components)
    // const galleryDb = new Gallery()
    const lib = new Library(components, galleryDb)
    lib.render()
    galleryDb.init()
    let prompt: string
    

    // TODO: need to figure out how to call lib.render() when screenshot is taken...

    

    const onPrompt = (e: Event) => {
        const target = e.target as BUI.TextInput
        prompt = target.value
    }
    const takeScreenshot = async () => {
        const worlds = components.get(OBC.Worlds)
        await worlds.update()
        const world = worlds.list.entries().next().value[1] as OBC.SimpleWorld
        console.log("WORLD", world)
        const {postproduction} = world.renderer as OBF.PostproductionRenderer
        postproduction.composer.render()
        const image = world.renderer?.three.domElement.toDataURL("image/png") as string
        console.log("image here", image)
        const id = uuidv4()
        await galleryDb.saveScreenshot(image, "testing", new Date().toDateString(), "Screenshots", id)
        galleryDb.getAllScreenShotImages().then((i) => console.log(i))
        const groups = await galleryDb.groupDBItemsByProject()
        console.log("groups here", groups)
        // lib.render()
        library.render()
        return [id, image]
    }

    const onRenderClick = async () => {
        try {
            spinner.classList.toggle("hide")
            // do screenshot here which will allow to get the uuid so i can pass to save render method
            const [id, imageURL] = await takeScreenshot()
            const renderedImages = await renderer.render("kitty cat", imageURL)
            console.log("render images", renderedImages)
            if (!renderedImages) throw new Error("Something went wrong, render images is undefined")
            for ( const imageURL of renderedImages ) {
                // console.log("IMAGE BEING SAVED...", imageURL)
                // without this settimeout i get a 404 error
                // setTimeout(async () => {
                //     await galleryDb.saveRender(imageURL, id)
                // }, 15000);
                await galleryDb.saveRender(imageURL, id)
                library.render()
            }
            lib.render()
        } catch (error) {
            throw new Error(`Unable to complete render: ${error}`)
        } finally {
            spinner.classList.toggle("hide")
        }
    }

    const gallery = () => {
        library.toggle()
    }

    return BUI.Component.create<BUI.ToolbarSection>(() => {
        return BUI.html`
            <bim-toolbar-section name="AI Renderer V5" label="AI Renderer V5" icon="ph:cursor-fill">
                <bim-panel-section>
                    <bim-toolbar-group>
                        <bim-button @click=${onRenderClick} label="Render" icon="ion:camera" tooltip-title="Show All" tooltip-text="Shows all elements in all models."></bim-button>
                        <bim-button @click=${takeScreenshot} label="Take Screenshot" icon="ion:camera" tooltip-title="Show All" tooltip-text="Shows all elements in all models."></bim-button>
                        <bim-button @click=${takeScreenshot} label="Settings" icon="ion:camera" tooltip-title="Show All" tooltip-text="Shows all elements in all models."></bim-button>
                        <bim-button @click=${gallery} label=" Gallery" icon="ion:camera" tooltip-title="Show All" tooltip-text="Shows all elements in all models."></bim-button>
                    </bim-toolbar-group>
                </bim-panel-section
            </bim-toolbar-section>
        `
      })
    }




    // return BUI.Component.create<BUI.Tab>(() => {
    //     return BUI.html `
    //     bim-tab name="AI Renderer Tool" label="AI Renderer Tool" icon="material-symbols:help"
    //         <bim-panel>
    //             <bim-panel-section label="Screenshot" icon="tabler:world">
    //                 <bim-button @click=${takeScreenshot} label="Take Screenshot" icon="ion:camera" tooltip-title="Show All" tooltip-text="Shows all elements in all models."></bim-button>
    //             </bim-panel-section>
    //             <bim-panel-section label="AI Render" icon="tabler:world">
    //                 <div style="display: flex; gap: 0.375rem;">
    //                     <bim-label icon="mingcute:rocket-fill">Prompt</bim-label>
    //                     <bim-text-input @input=${onPrompt} vertical placeholder="Search..." debounce="200"></bim-text-input>
    //                 </div>
    //                 <bim-button style="flex: 0;" label="Render" @click=${onRenderClick} icon="eva:expand-fill"></bim-button>
    //             </bim-panel-section>
        
    //             ${Settings(components)}
        
    //             ${library.bimPanelSection}
    //             ${lib.mainContainer}
    
    //         </bim-panel>
    //     </bim-tab>
    
    //     `
    // })


// TODO: make so that renders are side by side in gallery at least two
// TODO: need to make expand button on render card functional
// TODO: figure out API key in environment variables functional
// TODO: make so that spinner is built in to tool
// TODO: need to add more setting options?
// TODO: tweak whatever i need to in order to make renders look amazing