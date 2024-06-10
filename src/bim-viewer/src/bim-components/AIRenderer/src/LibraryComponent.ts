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
    }

    async render() {
        this.bimPanelSection.innerHTML = ""
        const allRenders = await this.galleryDB.db.renders.toArray()
        for (const render of allRenders ) {
            const file = new File([new Blob([render.buffer])], render.id!.toString())
            const src = URL.createObjectURL(file)
            const card = document.createElement("div") as HTMLDivElement
            const id = uuidv4()
            card.innerHTML = `
            <div data-id="${id}" class="render-card" style="width: 100%; height: fit-content; display: flex; flex-direction: column; border: 1px solid black; border-radius: 10px;">
                <img style="border-radius: 10px 10px 0px 0px" src="${src}">
                <div style="color: white; width: 100%; height: fit-content; display: flex; flex-direction: column; padding: 10px;">
                    <bim-label icon="">*Card title*</bim-label>
                    <bim-label icon="">*Prompt used*</bim-label>
                    <bim-label icon="">*date used*</bim-label>            
                    <button>delete</button>            
                </div>
            </div>
        `
        const deleteBtn = card.querySelector("button") as HTMLButtonElement
        deleteBtn.onclick = this.onCardDelete
        this.bimPanelSection.insertAdjacentElement("beforeend", card)
            // card.onDeleteEvent.add(async (dbKey) => {
            //     this._gallery.deleteRender((dbKey) as number)
            //     this._deleteLibraryCard(render.id!.toString())
            // })
        }
    }

    onCardDelete(e: Event) {
        const btnClicked = e.target as HTMLButtonElement
        console.log(btnClicked)
        const card = btnClicked.closest(".render-card") as HTMLDivElement
        console.log("card delete", card)
        card.remove()
    }

    deleteCardDB(key: number) {
        this.galleryDB.deleteRender((key) as number)
    }

}

// export default (components: OBC.Components) => {
//     const galleryDB = new Gallery()

//     const update = () => {
//         const allRenders = await galleryDB.db.renders.toArray()
//         for (const render of allRenders ) {
//             const file = new File([new Blob([render.buffer])], render.id!.toString())
//             const src = URL.createObjectURL(file);;
//             const card = new LibraryCard(this._components, src, render.title, render.date, render.id!)
//             this.get().insertAdjacentElement("beforeend", card.get())
//             card.onDeleteEvent.add(async (dbKey) => {
//                 this._gallery.deleteRender((dbKey) as number)
//                 this._deleteLibraryCard(render.id!.toString())
//             })
//         }
//     }

//     const addGalleryCard = (cardTitle: string, cardPrompt: string) => {
//         galleryDB.save()
//         const galleryCard = `
//             <div style="width: 100%; height: fit-content; display: flex; flex-direction: column; border: 1px solid black; border-radius: 10px;">
//                 <img style="border-radius: 10px 10px 0px 0px" src="https://img.freepik.com/free-vector/tiny-people-developers-computer-working-core-system-core-system-development-all-one-software-solution-core-system-modernization-concept_335657-896.jpg?t=st=1717943201~exp=1717946801~hmac=b3d4fa56af20ddb28f508a58b22a14a035ac7678bda9a873f409aa2b489858e2&w=2000" alt="...">
//                 <div style="color: white; width: 100%; height: fit-content; display: flex; flex-direction: column; padding: 10px;">
//                     <bim-label icon="">${cardTitle}</bim-label>
//                     <bim-label icon="">${cardPrompt}</bim-label>
//                     <bim-label icon="">${new Date().toDateString()}</bim-label>            
//                 </div>
//             </div>
//         `
//         return galleryCard
//     }

//     return BUI.Component.create<HTMLDivElement>(() => {
//         return BUI.html`
//         ${}
//         `
//     })
// }
