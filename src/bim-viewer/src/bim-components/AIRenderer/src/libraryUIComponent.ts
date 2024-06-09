import * as OBC from "openbim-components"
import {Gallery} from "./DataBase/RenderLibraryDB"

export class LibraryCard extends OBC.SimpleUIComponent {
    imageURL: string
    title: string
    date: string
    dbKey: number
    components: OBC.Components
    onDeleteEvent = new OBC.Event()
    // TODO: add ability to edit caard title?
    // add export options to export all renders? and be able to import to library again??
    // TODO: do i need to dispose of LibraryCard objects??? because i am creating them every time update mehtod is called.
    // could store them in list in the lcass and eveytime update is called i will dispose them and then append the new ones
    constructor(components: OBC.Components, imageURL: string, title: string, date: string, dbKey: number) {
        const template = `
                <div data-key="${dbKey}">
                    <p>${title}</p>
                    <img id="image" src="${imageURL}"></img>
                    <p id="date">${date}</p> 
                    <p id="delete">delete</p>
                </div>
            `
        super(components, template)
        this.components = components
        this.imageURL = imageURL
        this.dbKey = dbKey
        this.title = title
        this.date = date
        this._setStyles()
        const form = new OBC.Modal(this._components)
        form.title = "Render Enlarged"
        this._components.ui.add(form)
        this.getInnerElement("image")!.addEventListener("click", (e: Event) => {
            form.visible = true
            const image = this.getInnerElement("image")!.cloneNode(true) as HTMLImageElement
            image!.style.width = "800px"
            image!.style.height = "auto"
            image!.style.border = "none"
            form.slots.content.domElement.insertAdjacentElement("beforeend", image!)
        })
        // TODO: remove cancel button from form and change Accept button to "Close"
        form.onAccept.add(() => {
            form.visible = false
            form.slots.content.domElement.innerHTML = ""
        })
        this.getInnerElement("delete")!.addEventListener("click", () => {
            this.onDeleteEvent.trigger(this.dbKey)
        })
    }
    private _setStyles() {
        this.get().style.display = "flex"
        this.get().style.flexDirection = "column"
        this.get().style.rowGap = "10px"
        this.get().style.alignItems = "center"
        this.get().style.justifyContent = "center"
        this.get().style.width = "150px"
        this.get().style.maxWidth = "150px"
        this.get().style.minWidth = "150px"
        this.get().style.height = "auto"
        this.get().style.backgroundColor = "#22272e"
        this.get().style.borderRadius = "8px"
        this.get().style.padding = "15px"
        this.getInnerElement("image")!.style.cursor = "pointer"
        this.getInnerElement("image")!.style.width = "150px"
        this.getInnerElement("image")!.style.height = "auto"
        this.getInnerElement("image")!.style.borderRadius = "8px"
        this.getInnerElement("image")!.style.border = "1px solid darkgray"
        this.getInnerElement("date")!.style.fontSize = "10px"
        this.getInnerElement("date")!.style.color = "darkgray"
        this.getInnerElement("image")!.onmouseover = function() {
            this.getInnerElement("image")!.style.border = "1px solid #BCF124"
        }.bind(this)
        this.getInnerElement("image")!.onmouseleave = function() {
            this.getInnerElement("image")!.style.border = "none"
        }.bind(this)
    }
}

export class LibraryUIComponent extends OBC.SimpleUIComponent {
    private _gallery: Gallery
    constructor(components: OBC.Components) {
        const template = `
        <div id="library-container">
            
        </div>
        `
        super(components, template)
        this._setStyles()
        this._gallery = new Gallery()
        this._gallery.init()
        
    }
    private _setStyles() {
        this.get().style.display = "grid"
        this.get().style.gridTemplateColumns = "repeat(auto-fill, minmax(150px, 150px))"
        this.get().style.gap = "30px 30px"
        this.get().style.padding = "20px 20px 20px 0"
    }
    /**
     * adds rendered image to the gallary DB and updates the library
     * @param imageURL 
     * @param title 
     */
    async addRenderCard(imageURL: string, title: string) {
        const date = new Date().toDateString()
        await this._gallery.save(imageURL, title, date)
        this.update()
    }
    /**
     * deletes an image from the library
     * @param key 
     */
    private _deleteLibraryCard(key: string) {
        const cardHTMLElement = document.querySelectorAll(`[data-key="${key}"]`)
        this.get().removeChild(cardHTMLElement[0])
    }   
    /**
     * iterates through the DB and adds the images from the DB to the UI
     */
    async update() {
        this.get().innerHTML = ""
        const allRenders = await this._gallery.db.renders.toArray()
        for (const render of allRenders ) {
            const file = new File([new Blob([render.buffer])], render.id!.toString())
            const src = URL.createObjectURL(file);;
            const card = new LibraryCard(this._components, src, render.title, render.date, render.id!)
            this.get().insertAdjacentElement("beforeend", card.get())
            card.onDeleteEvent.add(async (dbKey) => {
                this._gallery.deleteRender((dbKey) as number)
                this._deleteLibraryCard(render.id!.toString())
            })
        }
    }

    async clearGallery() {
        this._gallery.clear()
    }
}
