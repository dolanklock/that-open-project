import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import { StableDiffusionRender } from "../Components/StableDiffusionRender"
import {Gallery} from "../DataBase/RenderLibraryDB"
import * as OBF from "@thatopen/components-front"
import { v4 as uuidv4 } from 'uuid'
// import { v4 as uuidv4 } from 'uuid'

export default (components: OBC.Components, galleryDb: Gallery) => {
    const takeScreenshot = async () => {
        const worlds = components.get(OBC.Worlds)
        await worlds.update()
        const world = worlds.list.entries().next().value[1] as OBC.SimpleWorld
        console.log("WORLD", world)
        const {postproduction} = world.renderer as OBF.PostproductionRenderer
        postproduction.composer.render()
        const image = world.renderer?.three.domElement.toDataURL("image/png") as string
        console.log("image here", image)
        await galleryDb.saveScreenshot(image, "testing", new Date().toDateString(), "undefined", uuidv4())
        galleryDb.getAllScreenShotImages().then((i) => console.log(i))
        return image
    }

    return BUI.Component.create<BUI.PanelSection>(() => {
        return BUI.html `
            <bim-button @click=${takeScreenshot} label="Screenshot" icon="tabler:eye-filled" tooltip-title="Show All" tooltip-text="Shows all elements in all models."></bim-button>
        
        `
    })
}
