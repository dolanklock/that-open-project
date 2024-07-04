import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import { StableDiffusionRender } from "../Components/StableDiffusionRender"
import {Gallery} from "../DataBase/RenderLibraryDB"
import { v4 as uuidv4 } from 'uuid'

// TODO: should this be a regualr class?? or be export default funciton?

export default (components: OBC.Components, galleryDb: Gallery) => {
    const createSlide = async () => {
        const images = await galleryDb.db.renders.toArray()
        const template = `
            <div class="slide slide--1">
                <div class="testimonial">
                    <h5 class="testimonial__header">Best financial decision ever!</h5>
                    <img src=""></img>
                </div>
            </div>
        `
        sliderContainer.querySelector(".slider")?.insertAdjacentHTML("beforebegin", template)
    }

    const sliderContainer = document.createElement("div")
    sliderContainer.innerHTML = `
        <div class="slider">
            
            <button class="slider__btn slider__btn--left">&larr;</button>
            <button class="slider__btn slider__btn--right">&rarr;</button>
            <div class="dots"></div>
        </div>
    `
    createSlide()
    // const sliderContainer = BUI.Component.create<HTMLDivElement>(() => {
    //     return BUI.html `
    //         <div class="slider">
                
    //             <button class="slider__btn slider__btn--left">&larr;</button>
    //             <button class="slider__btn slider__btn--right">&rarr;</button>
    //             <div class="dots"></div>
    //         </div>
    //     `
    // })

    return sliderContainer
}
