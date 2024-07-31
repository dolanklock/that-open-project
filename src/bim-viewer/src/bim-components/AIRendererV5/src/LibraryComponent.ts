/* eslint-disable max-classes-per-file */
/* eslint-disable prettier/prettier */
import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import {Gallery} from "./DataBase/RenderLibraryDB"
import { v4 as uuidv4 } from 'uuid'
import {IRender} from "./DataBase/RenderLibraryDB"

class Project {
    container: BUI.PanelSection
    projectName: string
    constructor(projectName: string) {
        this.projectName = projectName
        this.container = document.createElement("bim-panel-section") as BUI.PanelSection
        this.container.label = projectName
    }
}


export class Library {
    // class should have main container
    // method for adding new projects (html bim panel sections)
    // if add new project should append bim panel section to main container
    
    // should by default have screenshot project and renders project
    // need to think about how adding new project works. will have ui 
    // for adding new project at the very top of container 
    // but then the DB items will have to have the project stored as value
    // in DB?
    components: OBC.Components
    galleryDb: Gallery
    mainContainer: BUI.Panel
    projects: Project[]
    constructor(components: OBC.Components, galleryDb: Gallery) {
        this.components = components
        this.galleryDb = galleryDb
        this.mainContainer = document.createElement("bim-panel") as BUI.Panel
        this.mainContainer.style.gridArea = "elementDataPanel"
        this.mainContainer.style.position = "fixed"
        this.mainContainer.style.top = "0"
        this.mainContainer.style.right = "0"
        this.mainContainer.style.margin = "20px"
        this.mainContainer.style.width = "450px"
        this.mainContainer.style.overflow = "auto"
        this.mainContainer.style.maxHeight = "80vh"
        this.mainContainer.style.resize = "horizontal"
        this.projects = []
        this.render()
    }

    toggle() {
        this.mainContainer.classList.toggle("hide")
    }

    setup() {
        // configure main container here
    }
    addProject(projectName: string) {
        const newProject = new Project(projectName)
        this.projects.push(newProject)
        this.mainContainer.appendChild(newProject.container)
    }
    onImageProjectChange() {

    }
    /**
     * this method should update all UI and re-render. need to figure out
     * how i should get all render images and projects. will need to manage
     * with the DB class... store the DB item with the project name as attribute similar
     * to how doing it now with screenshots and renders? will this work?
     * what if project gets renamed or deleted? should maybe store by project id and 
     * then project id will be master key to map image items to it and then will have
     * project name, if project name changes can identidy and update DB image items by id
     * 
     */
    async render() {
        // when image is rendered it should get put into default main render and which will be default dropdown
        // render project option
        // same with screenshots
        
        // iterate through groups of projectsr returned from groupDBItemsByProject and create the required container (from Project class)
        // based on each unique key in the object returned from groupDBItemsByProject and then iterate through
        // each array stored in the value of each project key which will be each dbItem and create an html
        // element for each one with image, etc. and then add it to the master container html from the 
        // "Project" class. then after each project iteration append the project container to the the main
        // container in this class
        this.mainContainer.innerHTML = ""
        const projects = await this.galleryDb.groupDBItemsByProject()
        for ( const [projectName, dbItems] of Object.entries(projects)) {
            console.log(projectName)
            console.log(dbItems)
            console.log("**")
            const projectContainer = this.createProjectContainer(projectName)
            for (const dbItem of dbItems) {
                const blob = [new Blob([dbItem.screenshotBuffer])]
                const card = this.createCard(dbItem, blob)
                // projectContainer.appendChild(card)
                projectContainer.insertAdjacentElement("beforeend", card)
            }
            const bimPanelSecton = document.createElement("bim-panel-section") as BUI.PanelSection
            bimPanelSecton.insertAdjacentElement("beforeend", projectContainer)
            bimPanelSecton.label = projectName
            this.mainContainer.appendChild(bimPanelSecton)
        }
    }
    createProjectContainer(projectName: string): HTMLDivElement {
        // const container = document.createElement("bim-panel-section") as BUI.PanelSection
        // container.label = projectName
        // container.style.width = "100%"
        // container.style.height = "100%"
        // container.style.display = "grid"
        // container.style.gridTemplateColumns = "repeat(auto-fill, minmax(200px, 200px))"
        // container.style.gap = "5x 5px"
        // container.style.padding = "20px 20px 20px 0"
        // return container
        const cardContainer = document.createElement("div") as HTMLDivElement
        cardContainer.style.width = "100%"
        cardContainer.style.height = "100%"
        cardContainer.style.display = "grid"
        cardContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(150px, 150px))"
        cardContainer.style.gap = "30px 30px"
        cardContainer.style.padding = "20px 20px 20px 0"
        cardContainer.style.overflowY = "scroll"
        cardContainer.style.maxHeight = "500px"
        return cardContainer
    }
    createCard(dbItem: IRender, blob: Blob[]): HTMLDivElement {
        const file = new File(blob, dbItem.id!.toString())
        const src = URL.createObjectURL(file)
        const card = document.createElement("div") as HTMLDivElement
            card.innerHTML = `
            <div data-id="${dbItem.uuid}" class="render-card" style="width: 125px; height: fit-content; display: flex;
             flex-direction: column; border-radius: 10px; border: 1px solid rgba(0, 0, 0, 0.5)">
                <img class="render-image" style="border-radius: 10px 10px 0px 0px" src="${src}">
                <div style="color: white; width: 100%; height: fit-content; display: flex; flex-direction: column; padding: 10px;">
                    <bim-label icon="">${dbItem.date}</bim-label>
                    <div style="margin-top: 10px; width: 100%; height: fit-content; display: flex; flex-direction: row; justify-content: space-between; column-gap: 6px;">
                        <bim-button class="delete-render" style="width: 35px; min-width: 80px" label="Delete" icon="mdi:garbage-can-outline"></bim-button>
                        <bim-button class="expand" style="width: 5px;" label="" icon="iconoir:enlarge"></bim-button>
                    </div>            
                </div>
            </div>
            `
            card.style.boxShadow = "0 16px 32px rgba(0, 0, 0, 0)"
            const deleteBtn = card.querySelector(".delete-render") as HTMLButtonElement
            deleteBtn.onclick = this.onCardDelete.bind(this)
            // const expandBtn = card.querySelector(".expand") as HTMLButtonElement
            // expandBtn.onclick = this.onImageExpand.bind(this)
        return card
    }
    async onCardDelete(e: Event) {
        const btnClicked = e.target as HTMLButtonElement
        const card = btnClicked.closest(".render-card") as HTMLDivElement
        const cardId = card.dataset.id as string
        await this.galleryDb.deleteItem(cardId)
        card.remove()
    }
   
}




// ---------------------------- OLD CODE BELOW ------------------------------ //





export class LibraryComponent {
    private _components: OBC.Components
    galleryDB: Gallery
    bimPanelSection: HTMLElement
    constructor(components: OBC.Components) {
        this._components = components
        this.galleryDB = new Gallery()
        this.galleryDB.init()
        this.bimPanelSection = document.createElement('bim-panel-section') as BUI.PanelSection
        this.bimPanelSection.setAttribute('label', 'Renders')
        this.bimPanelSection.setAttribute('icon', 'tabler:world')
        this.render()
    }
    /**
     * iterates through the DB and adds HTML to the bim panel section
     */
    async render() {
        this.bimPanelSection.innerHTML = ""
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
        this.bimPanelSection.insertAdjacentElement("beforeend", cardContainer)
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
}
