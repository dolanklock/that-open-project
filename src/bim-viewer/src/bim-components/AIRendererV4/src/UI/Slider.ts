import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import { StableDiffusionRender } from "../Components/StableDiffusionRender"
import {Gallery} from "../DataBase/RenderLibraryDB"
import { v4 as uuidv4 } from 'uuid'

// TODO: should this be a regualr class?? or be export default funciton?
// need to render images from DB into slider
// when render tab gets clicked in window. slider should show the images from render gallery automatically
// want to have isolated per project?

// TODO: next step figure out the logic of having all images rendered and when 
// arrow btn is clicked the next render will show

export default (components: OBC.Components, galleryDb: Gallery) => {
    const createSlide = async () => {
        const images = await galleryDb.db.renders.toArray()
        const template = `
            <div class="slide slide--1">
                <img src="https://cdn.pixabay.com/photo/2024/03/04/16/38/cat-8612685_1280.jpg"></img>
            </div>
        `
        if (!sliderContainer) return
        sliderContainer.insertAdjacentHTML("afterbegin", template)
    }

    const tempContainer = document.createElement("div")
    tempContainer.innerHTML = `
        <div class="slider">

            <div class="slide-footer">
                <button class="slider__btn slider__btn--left">&larr;</button>
                <button class="slider__btn slider__btn--right">&rarr;</button>
                
            </div>        
        </div>
    `
    const sliderContainer = tempContainer.firstElementChild
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
