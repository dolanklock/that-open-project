import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import {Gallery} from "../DataBase/RenderLibraryDB"
import PromptUI from "./PromptUI"
// import Renders from "./src/Renders"
// import Screenshots from "./src/Screenshots"
import {Slider} from "./Slider"
import { LibraryComponent } from "../Components/LibraryComponent"
import {ScreenshotUI} from "./src/Screenshots"
import { RenderUI } from "./src/Renders"

export default (components: OBC.Components, galleryDb: Gallery) => {
    const bimPanelSection = document.createElement('bim-panel-section') as BUI.PanelSection
    bimPanelSection.setAttribute('label', 'Gallery')
    bimPanelSection.setAttribute('icon', 'tabler:world')
    
    const libraryRenders = new LibraryComponent(components, galleryDb)
    const libraryScreenshots = new LibraryComponent(components, galleryDb)
    const screenshotUI = new ScreenshotUI(components, galleryDb)
    const renderUI = new RenderUI(components, galleryDb)
    const slider = new Slider(components, galleryDb)
    console.log("sliderconstainer", slider.sliderContainer)
    
    const modal = BUI.Component.create<HTMLDialogElement>(() => {
        return BUI.html `
            <dialog>
                <div style="background-color: #22272e; width: 1300px; height: 800px; display: flex;">
                    <div class="library-container">

                        <header class="library-header">
                            <i class='bx bx-md bxs-palette' ></i>
                            ${PromptUI(components, galleryDb)}
                        </header>

                        <aside class="library-sidebar">
                            <bim-tabs style="grid-area: library-sidebar;">
                                <bim-tab label="Renders">
                                    ${renderUI}
                                    </bim-tab>
                                <bim-tab label="Screenshots">
                                    ${screenshotUI.bimPanelSection}
                                </bim-tab>
                                <bim-tab label="Imported">
                                    <button class="render-btn">Render</button>
                                </bim-tab>
                            </bim-tabs>
                        </aside>

                        <main class="library-main">
                            ${slider.sliderContainer}
                        </main>

                    </div>
                </div>
            </dialog>
        `
    })
    document.body.append(modal)
    const onLibraryClick = async () => {
        screenshotUI.render()
        modal.showModal()
        const mainLibraryHTMLElement = modal.querySelector(".library-main") as HTMLElement
        mainLibraryHTMLElement.innerHTML = ""
        const slidesHTML = await slider.renderScreenshotSlides()
        mainLibraryHTMLElement.insertAdjacentElement("afterbegin", slidesHTML)

    }
    return BUI.Component.create<BUI.PanelSection>(() => {
        return BUI.html `
            <bim-button @click=${onLibraryClick} label="Gallery" icon="tabler:eye-filled" tooltip-title="Show All" tooltip-text="Shows all elements in all models."></bim-button>
        `
    })
}

// const modal = BUI.Component.create<HTMLDialogElement>(() => {
//     return BUI.html `
//         <dialog>
//             <div style="background-color: aqua; width: 1100px; height: 800px; display: flex;">
//                 <div class="library-container">

//                     <header class="library-header">
                
//                     </header>

//                     <aside class="library-sidebar">
//                         <bim-tabs style="grid-area: library-sidebar;">
//                             <bim-tab label="Renders" style="height: 100%;">
//                                 ${Renders(components, galleryDb)}
//                                 </bim-tab>
//                             <bim-tab label="Screenshots">
//                                 ${Screenshots(components, galleryDb)}
//                             </bim-tab>
//                             <bim-tab label="Imported">
//                                 <button class="render-btn">Render</button>
//                             </bim-tab>
//                         </bim-tabs>
//                     </aside>

//                     <main class="library-main">
//                         <div class="slider">
//                             <div class="slide slide--1">
//                                 <div class="testimonial">
//                                     <h5 class="testimonial__header">Best financial decision ever!</h5>
//                                     <blockquote class="testimonial__text">
//                                         Lorem ipsum dolor sit, amet consectetur adipisicing elit.
//                                         Accusantium quas quisquam non? Quas voluptate nulla minima
//                                         deleniti optio ullam nesciunt, numquam corporis et asperiores
//                                         laboriosam sunt, praesentium suscipit blanditiis. Necessitatibus
//                                         id alias reiciendis, perferendis facere pariatur dolore veniam
//                                         autem esse non voluptatem saepe provident nihil molestiae.
//                                     </blockquote>
//                                     <address class="testimonial__author">
//                                         <img src="img/user-1.jpg" alt="" class="testimonial__photo" />
//                                         <h6 class="testimonial__name">Aarav Lynn</h6>
//                                         <p class="testimonial__location">San Francisco, USA</p>
//                                     </address>
//                                 </div>
//                             </div>
//                             <button class="slider__btn slider__btn--left">&larr;</button>
//                             <button class="slider__btn slider__btn--right">&rarr;</button>
//                             <div class="dots"></div>
//                         </div>
//                     </main>

//                 </div>
//             </div>
//         </dialog>
//     `
// })