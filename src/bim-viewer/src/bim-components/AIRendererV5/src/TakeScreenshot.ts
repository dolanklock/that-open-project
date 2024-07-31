/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import {Gallery} from "./DataBase/RenderLibraryDB"
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
        await galleryDb.saveScreenshot(image, "testing", new Date().toDateString(), "Project Name Here", uuidv4())
        galleryDb.getAllScreenShotImages().then((i) => console.log(i))
        const groups = await galleryDb.groupDBItemsByProject()
        console.log("groups here", groups)
        return image
    }

    return BUI.Component.create<BUI.PanelSection>(() => {
        return BUI.html `
            <bim-panel-section label="Screenshot" icon="tabler:world">
                <bim-button @click=${takeScreenshot} label="Take Screenshot" icon="ion:camera" tooltip-title="Show All" tooltip-text="Shows all elements in all models."></bim-button>
            </bim-panel-section>
        
        `
    })
}

// export class TakeScreenshot {
//     private _components: OBC.Components
//     private _galleryDb: Gallery
//     constructor(components: OBC.Components, gallerDb: Gallery) {
//         this._components = components
//         this._galleryDb = gallerDb
//     }
//     async takeScreenshot() {
//         const worlds = this._components.get(OBC.Worlds)
//         await worlds.update()
//         const world = worlds.list.entries().next().value[1] as OBC.SimpleWorld
//         console.log("WORLD", world)
//         const {postproduction} = world.renderer as OBF.PostproductionRenderer
//         postproduction.composer.render()
//         const image = world.renderer?.three.domElement.toDataURL("image/png") as string
//         console.log("image here", image)
//         await this._galleryDb.saveScreenshot(image, "testing", new Date().toDateString(), "Project Name Here", uuidv4())
//         this._galleryDb.getAllScreenShotImages().then((i) => console.log(i))
//         const groups = await this._galleryDb.groupDBItemsByProject()
//         console.log("groups here", groups)
//         return image
//     }

// }



// TODO: need to separate renders from screenshots. should have screenshots first.
// could have screenshots grouped in beginning then all renders divided by project
// should have an add project section with button and input for project name
// when user clicks render they have to select from dropdown and pick project
// to assign render to


// want so that there is a browse button at the top of each bim seciton panel before
// all screenshots or renders so that when you click it it open window in middle
// of scren of enlarged images and you can click through all images in that project
// could add controls on that window to for downloading image

// want it so that no image shows in main left panle for renders and screenshots.
// on show file name and then date and then some download option button
