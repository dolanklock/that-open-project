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

// TODO: add functionality to the database so it gets images for us, etc..
// DB class should have methods for retrieving information we need from it for other parts
// of our code

export class Slider {
    private _components: OBC.Components
    private _galleryDb: Gallery
    sliderContainer: HTMLDivElement | null
    constructor(components: OBC.Components, galleryDb: Gallery) {
        this._components = components
        this._galleryDb = galleryDb
        this.sliderContainer = null
    }
    async renderRenderedSlides() {
        const allRenderImages = await this._galleryDb.getAllRenderImages()
        const sliderContainer = this.sliderContainerTemplate() as HTMLDivElement
        for (const img of allRenderImages) {
            const slide = `
                <div class="slide slide--1 image-active">
                    <img src="${img}"></img>
                </div>
            `
            sliderContainer?.insertAdjacentHTML("afterbegin", slide)
        }
        this.sliderContainer = sliderContainer
    }
    async renderScreenshotSlides() {
        const allScreenshotImages = await this._galleryDb.getAllScreenShotImages()
        const sliderContainer = this.sliderContainerTemplate() as HTMLDivElement
        console.log(sliderContainer)
        for (const img of allScreenshotImages) {
            const slide = `
                <div class="slide slide--1 image-active">
                    <img src="${img}"></img>
                </div>
            `
            sliderContainer?.insertAdjacentHTML("afterbegin", slide)
        }
        console.log("heree", sliderContainer)
        this.sliderContainer = sliderContainer
        return sliderContainer
    }
    private sliderContainerTemplate() {
        const tempContainer = document.createElement("div")
        tempContainer.innerHTML = `
            <div class="slider">

                <div class="slide-footer">
                    <button class="slider__btn slider__btn--left">&larr;</button>
                    <button class="slider__btn slider__btn--right">&rarr;</button>
                </div>        
            </div>
        `
        return tempContainer.firstElementChild
    }
}


// export default (components: OBC.Components, galleryDb: Gallery) => {
//     // const slideBtnLeft = document.querySelector('.slider__btn--left');
//     // const slideBtnRight = document.querySelector('.slider__btn--right');
//     // const slides = document.querySelectorAll('.slide');
    
//     // const arrayBufferToSrcImg = (arrayBuffer: ArrayBuffer, fileName: string) => {
//     //     const file = new File([new Blob([arrayBuffer])], fileName)
//     //     const src = URL.createObjectURL(file)
//     //     return src
//     // }
//     const createSlide = async () => {
//         const images = await galleryDb.db.renders.toArray()
//         // const arrBuff = images[0].buffer
//         // const src = arrayBufferToSrcImg(arrBuff, "test")
        
//         const template = `
//             <div class="slide slide--1 image-active">
//                 <img src="https://cdn.pixabay.com/photo/2024/03/04/16/38/cat-8612685_1280.jpg"></img>
//             </div>
//         `
//         if (!sliderContainer) return
//         sliderContainer.insertAdjacentHTML("afterbegin", template)
//     }

//     const tempContainer = document.createElement("div")
//     tempContainer.innerHTML = `
//         <div class="slider">

//             <div class="slide-footer">
//                 <button class="slider__btn slider__btn--left">&larr;</button>
//                 <button class="slider__btn slider__btn--right">&rarr;</button>
//             </div>        
//         </div>
//     `
//     const sliderContainer = tempContainer.firstElementChild
//     createSlide()
//     // const sliderContainer = BUI.Component.create<HTMLDivElement>(() => {
//     //     return BUI.html `
//     //         <div class="slider">
                
//     //             <button class="slider__btn slider__btn--left">&larr;</button>
//     //             <button class="slider__btn slider__btn--right">&rarr;</button>
//     //             <div class="dots"></div>
//     //         </div>
//     //     `
//     // })

//     return sliderContainer
// }