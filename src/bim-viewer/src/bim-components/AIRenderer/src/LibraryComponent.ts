import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import {Gallery} from "./DataBase/RenderLibraryDB"
import { v4 as uuidv4 } from 'uuid'

export class LibraryComponent {
    private _components: OBC.Components
    galleryDB: Gallery
    bimPanelSection: HTMLElement
    constructor(components: OBC.Components) {
        this._components = components
        this.galleryDB = new Gallery()
        this.galleryDB.init()
        this.bimPanelSection = document.createElement('bim-panel-section') as BUI.PanelSection
        this.bimPanelSection.setAttribute('label', 'Gallery')
        this.bimPanelSection.setAttribute('icon', 'tabler:world')
        this.bimPanelSection.style.backgroundColor = "#22272e"
        this.render()
        console.log(this.galleryDB.db.renders.toArray())
   
    }
    /**
     * iterates through the DB and adds HTML to the bim panel section
     */
    async render() {
        this.bimPanelSection.innerHTML = ""
        const allRenders = await this.galleryDB.db.renders.toArray()
        for (const render of allRenders ) {
            const file = new File([new Blob([render.buffer])], render.id!.toString())
            const src = URL.createObjectURL(file)
            const card = document.createElement("div") as HTMLDivElement
            card.innerHTML = `
            <div data-id="${render.uuid}" class="render-card" style="width: 100%; height: fit-content; display: flex; flex-direction: column; border: 1px solid black; border-radius: 10px;">
                <img style="border-radius: 10px 10px 0px 0px" src="${src}">
                <div style="color: white; width: 100%; height: fit-content; display: flex; flex-direction: column; padding: 10px;">
                    <bim-label icon="">*Card title*</bim-label>
                    <bim-label icon="">*Prompt used*</bim-label>
                    <bim-label icon="">*date used*</bim-label>            
                    <button class="delete-render">delete</button>            
                </div>
            </div>
            `
            const deleteBtn = card.querySelector(".delete-render") as HTMLButtonElement
            deleteBtn.onclick = this.onCardDelete.bind(this)
            this.bimPanelSection.insertAdjacentElement("beforeend", card)
        }
    }
    /**
     * saves the image to DB and then runs the render function to update UI
     * @param imageURL 
     */
    async update(imageURL: string) {
        setTimeout(async () => {
            await this.galleryDB.save(imageURL, "testing", new Date().toDateString(), uuidv4())
            await this.render()
        }, 10000);
    }
    /**
     * delete button event listener callback fucntion. removes html card from UI and 
     * gets the uuid of the card clicked on for delete
     * and then passes that uuid to the deleteItem method and that deletes item from database
     * @param e 
     */
    async onCardDelete(e: Event) {
        const btnClicked = e.target as HTMLButtonElement
        const card = btnClicked.closest(".render-card") as HTMLDivElement
        const cardId = card.dataset.id as string
        await this.galleryDB.deleteItem(cardId)
        card.remove()
    }
}
