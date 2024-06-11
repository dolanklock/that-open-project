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
        // this.bimPanelSection = document.createElement(`
        // <bim-panel-section style="background-color: #22272e;" label="Gallery" icon="tabler:world">

        // </bim-panel-section>
        // `)
        this.bimPanelSection = document.createElement('bim-panel-section') as BUI.PanelSection
        this.bimPanelSection.setAttribute('label', 'Gallery')
        this.bimPanelSection.setAttribute('icon', 'tabler:world')
        this.bimPanelSection.style.backgroundColor = "#22272e"
        this.render()
        this.updateItems()
    }

    async render() {
        this.bimPanelSection.innerHTML = ""
        const allRenders = await this.galleryDB.db.renders.toArray()
        console.log("testing", allRenders)
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
        console.log(deleteBtn)
        deleteBtn.onclick = this.onCardDelete.bind(this)
        this.bimPanelSection.insertAdjacentElement("beforeend", card)
            // card.onDeleteEvent.add(async (dbKey) => {
            //     this._gallery.deleteRender((dbKey) as number)
            //     this._deleteLibraryCard(render.id!.toString())
            // })
        }
    }

    async onCardDelete(e: Event) {
        const btnClicked = e.target as HTMLButtonElement
        console.log(btnClicked)
        const card = btnClicked.closest(".render-card") as HTMLDivElement
        console.log("card delete", card)
        const cardId = card.dataset.id as string
        console.log(this.galleryDB)
        await this.galleryDB.deleteItem(cardId)
        // this.delete(cardId)
        card.remove()
    }
    // async delete(uuid: string) {
    //     await this.galleryDB.deleteItem(uuid)
    // }

    async updateItems() {
        const allDBItems = await this.galleryDB.db.renders.toArray()
        const allNodes = Array.from(this.bimPanelSection.childNodes) as HTMLElement[]
        allNodes.forEach(async (item, index) => {
            const uuiD = item.dataset.id
            const key = allDBItems[index].id as number
            const test = await this.galleryDB.db.renders.update(key, { uuid: uuiD });
            console.log(test)
          });

        // await this.db.renders.toArray(items => {
        //   items.forEach(async item => {
        //     const id = item.id as number
        //     await this.db.renders.update(id, { newKey: 'newValue' });
        //   });
        // });
      }

}
