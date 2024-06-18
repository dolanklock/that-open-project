import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import {Gallery} from "./DataBase/RenderLibraryDB"
import { v4 as uuidv4 } from 'uuid'

export class LibraryComponent {
    private _components: OBC.Components
    galleryDB: Gallery
    libraryUI: HTMLElement
    main: HTMLElement
    
    constructor(components: OBC.Components, main: HTMLElement) {
        this._components = components
        this.main = main
        this.libraryUI = document.createElement('div') as HTMLDivElement
        this.galleryDB = new Gallery()
        this.galleryDB.init()
        this.setUI()
        this.render()
    }
    setUI() {
        this.libraryUI.style.display = "grid"
        this.libraryUI.style.gridTemplateColumns = "repeat(auto-fill, minmax(150px, 150px))"
        this.libraryUI.style.gap = "30px 30px"
        this.libraryUI.style.padding = "20px 20px 20px 0"
        this.libraryUI.style.position = "fixed"
        // this.libraryUI.style.top = "50%"
        // this.libraryUI.style.left = "50%"
        this.libraryUI.style.width = "800px"
        this.libraryUI.style.height = "800px"
        this.libraryUI.style.backgroundColor = "#22272e"
        this.libraryUI.style.resize = "both"
        this.libraryUI.style.padding = "20px"
        this.libraryUI.style.overflow = "auto"
        this.main.insertAdjacentElement("beforeend", this.libraryUI)
        // let isDragging = false;
        // let startX, startY, initialX, initialY;
        // this.libraryUI.addEventListener('mousedown', function(e: Event) {
        //     const t = e.target as HTMLDivElement
        //     isDragging = true;
        //     startX = t.clientX;
        //     startY = t.clientY;
        //     initialX = this.libraryUI.offsetLeft;
        //     initialY = this.libraryUI.offsetTop;
        //     document.addEventListener('mousemove', onMouseMove);
        //     document.addEventListener('mouseup', onMouseUp);
        // }.bind(this));
        // function onMouseMove(e: Event) {
        //     const tt = e.target as HTMLDivElement
        //     if (isDragging) {
        //         const dx = tt.clientX - startX;
        //         const dy = tt.clientY - startY;
        //         this.libraryUI.style.left = `${initialX + dx}px`;
        //         this.libraryUI.style.top = `${initialY + dy}px`;
        //     }
        // }
        // function onMouseUp() {
        //     isDragging = false;
        //     document.removeEventListener('mousemove', onMouseMove);
        //     document.removeEventListener('mouseup', onMouseUp);
        // }
    }
    
    get visible() {
        return (this.libraryUI.style.display === "flex")
    }
    set visible(bool: boolean) {
        if (!bool) {
            this.libraryUI.style.display = "none"
            return
        }
        this.libraryUI.style.display = "flex"
    }
    /**
     * iterates through the DB and adds HTML to the bim panel section
     */
    async render() {
        this.libraryUI.innerHTML = ""
        const cardContainer = document.createElement("div") as HTMLDivElement
        cardContainer.style.width = "100%"
        cardContainer.style.height = "100%"
        cardContainer.style.display = "grid"
        cardContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(150px, 150px))"
        cardContainer.style.gap = "30px 30px"
        cardContainer.style.padding = "20px 20px 20px 0"
        const allRenders = await this.galleryDB.db.renders.toArray()
        for (const render of allRenders ) {
            const file = new File([new Blob([render.buffer])], render.id!.toString())
            const src = URL.createObjectURL(file)
            const card = document.createElement("div") as HTMLDivElement
            card.innerHTML = `
            <div data-id="${render.uuid}" class="render-card" style="width: 150px; height: fit-content; display: flex;
             flex-direction: column; border-radius: 10px; border: 1px solid rgba(0, 0, 0, 0.5)">
                <img class="render-image" style="border-radius: 10px 10px 0px 0px" src="${src}">
                <div style="color: white; width: 100%; height: fit-content; display: flex; flex-direction: column; padding: 10px;">
                    <bim-label icon="">${render.date}</bim-label>
                    <div style="margin-top: 10px; width: 100%; height: fit-content; display: flex; flex-direction: row; justify-content: space-between; column-gap: 6px;">
                        <bim-button class="delete-render" style="width: 50px; min-width: 80px" label="Delete" icon="mdi:garbage-can-outline"></bim-button>
                        <bim-button class="expand" style="width: 10px;" label="" icon="icomoon-free:enlarge"></bim-button>
                    </div>            
                </div>
            </div>
            `
            card.style.boxShadow = "0 16px 32px rgba(0, 0, 0, 0)"
            const deleteBtn = card.querySelector(".delete-render") as HTMLButtonElement
            deleteBtn.onclick = this.onCardDelete.bind(this)
            const expandBtn = card.querySelector(".expand") as HTMLButtonElement
            expandBtn.onclick = this.onImageExpand.bind(this)
            cardContainer.insertAdjacentElement("beforeend", card)
        }
        this.libraryUI.insertAdjacentElement("beforeend", cardContainer)
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
    onImageExpand(e: Event) {
        const imageForm = document.createElement("div") as HTMLDivElement
        const closeBtn = document.createElement('bim-button') as BUI.Button
        closeBtn.onclick = function() {
            imageForm.remove()
        }
        closeBtn.style.position = "absolute"
        closeBtn.style.display = "flex"
        closeBtn.style.top = "0"
        closeBtn.style.left = "0"
        closeBtn.setAttribute("icon", "material-symbols:close")

        imageForm.style.position = "absolute"
        imageForm.style.width = "fit-content"
        imageForm.style.maxWidth = "1000px"
        imageForm.style.height = "auto"
        
        imageForm.style.display = "flex"
        imageForm.insertAdjacentElement("beforeend", closeBtn)

        const btnClicked = e.target as HTMLButtonElement
        const card = btnClicked.closest(".render-card") as HTMLDivElement
        const image = card.querySelector(".render-image")?.cloneNode(true) as HTMLImageElement
        
        imageForm.insertAdjacentElement("beforeend", image)
        const viewer = document.getElementById("bim-container")
        viewer?.insertAdjacentElement("beforeend", imageForm)

    }
    toggleVisible() {
        console.log("running")
        if (this.visible) {
            this.visible = false
            return
        }
        this.visible = true
        console.log(this.visible)
        
    }
    get() {
        return BUI.Component.create<BUI.Button>(() => {
            return BUI.html`
                <bim-button @click=${this.toggleVisible.bind(this)} label="Library" icon="ri:focus-mode" tooltip-title="Focus" tooltip-text="Focus the camera to the current selection."></bim-button>
            `
          })
        }
}