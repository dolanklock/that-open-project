import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import {Gallery} from "../DataBase/RenderLibraryDB"
import PromptUI from "./PromptUI"
import Renders from "./src/Renders"
import Screenshots from "./src/Screenshots"

export default (components: OBC.Components, galleryDb: Gallery) => {
    const bimPanelSection = document.createElement('bim-panel-section') as BUI.PanelSection
    bimPanelSection.setAttribute('label', 'Gallery')
    bimPanelSection.setAttribute('icon', 'tabler:world')
    /**
     * iterates through the DB and adds HTML to the bim panel section
     */
    const updateUI = async() => {
        bimPanelSection.innerHTML = ""
        const cardContainer = document.createElement("div") as HTMLDivElement
        cardContainer.style.width = "100%"
        cardContainer.style.height = "100%"
        cardContainer.style.display = "grid"
        cardContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(150px, 150px))"
        cardContainer.style.gap = "30px 30px"
        cardContainer.style.padding = "20px 20px 20px 0"
        const allRenders = await galleryDb.db.renders.toArray()
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
            deleteBtn.onclick = onCardDelete.bind(this)
            const expandBtn = card.querySelector(".expand") as HTMLButtonElement
            expandBtn.onclick = onImageExpand.bind(this)
            cardContainer.insertAdjacentElement("beforeend", card)
        }
        bimPanelSection.insertAdjacentElement("beforeend", cardContainer)
    }
    /**
     * delete button event listener callback fucntion. removes html card from UI and 
     * gets the uuid of the card clicked on for delete
     * and then passes that uuid to the deleteItem method and that deletes item from database
     * @param e 
     */
    const onCardDelete = async (e: Event) => {
        const btnClicked = e.target as HTMLButtonElement
        const card = btnClicked.closest(".render-card") as HTMLDivElement
        const cardId = card.dataset.id as string
        await galleryDb.deleteItem(cardId)
        card.remove()
    }
    const onImageExpand = (e: Event) => {
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
    const getRenderedImages = async () => {
        const images = await galleryDb.db.renders.toArray()
        return images
    }



    const modal = BUI.Component.create<HTMLDialogElement>(() => {
        return BUI.html `
            <dialog>
                <div style="background-color: aqua; width: 1100px; height: 800px; display: flex;">
                    <div class="library-container">

                        <header class="library-header">
                    
                        </header>

                        <aside class="library-sidebar">
                            <bim-tabs style="grid-area: library-sidebar;">
                                <bim-tab label="Renders" style="height: 100%;">
                                    ${Renders(components, galleryDb)}
                                    </bim-tab>
                                <bim-tab label="Screenshots">
                                    ${Screenshots(components, galleryDb)}
                                </bim-tab>
                                <bim-tab label="Imported">
                                    <button class="render-btn">Render</button>
                                </bim-tab>
                            </bim-tabs>
                        </aside>

                        <main class="library-main">
                            <div class="slider">
                                <div class="slide slide--1">
                                <div class="testimonial">
                                    <h5 class="testimonial__header">Best financial decision ever!</h5>
                                    <blockquote class="testimonial__text">
                                    Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                                    Accusantium quas quisquam non? Quas voluptate nulla minima
                                    deleniti optio ullam nesciunt, numquam corporis et asperiores
                                    laboriosam sunt, praesentium suscipit blanditiis. Necessitatibus
                                    id alias reiciendis, perferendis facere pariatur dolore veniam
                                    autem esse non voluptatem saepe provident nihil molestiae.
                                    </blockquote>
                                    <address class="testimonial__author">
                                    <img src="img/user-1.jpg" alt="" class="testimonial__photo" />
                                    <h6 class="testimonial__name">Aarav Lynn</h6>
                                    <p class="testimonial__location">San Francisco, USA</p>
                                    </address>
                                </div>
                                <button class="slider__btn slider__btn--left">&larr;</button>
                                <button class="slider__btn slider__btn--right">&rarr;</button>
                                <div class="dots"></div>
                            </div>
                        </main>

                    </div>
                </div>
            </dialog>
        `
    })
    document.body.append(modal)
    const onLibraryClick = () => {
        // updateUI()
        modal.showModal()
    }
    return BUI.Component.create<BUI.PanelSection>(() => {
        return BUI.html `
            <bim-button @click=${onLibraryClick} label="Gallery" icon="tabler:eye-filled" tooltip-title="Show All" tooltip-text="Shows all elements in all models."></bim-button>
        `
    })
}

// <dialog>
// <div style="background-color: aqua; width: 1000px; height: 800px; display: flex;">
//     <div class="library-container">

//         <header class="library-header">
    
//         </header>

//         <aside class="library-sidebar">
//             <bim-tabs style="grid-area: library-sidebar;">
//                 <bim-tab label="Library">
//                     <button>Render</button>
//                 </bim-tab>
//                 <bim-tab label="settings"></bim-tab>
//             </bim-tabs>
//         </aside>

//         <main class="library-main">
//             <button></button>
//         </main>

//     </div>
// </div>
// </dialog>