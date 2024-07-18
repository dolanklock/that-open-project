/* eslint-disable prettier/prettier */
import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import {Gallery} from "../../DataBase/RenderLibraryDB"
import PromptUI from "../PromptUI"
import { BaseUI } from "./UIBase"

export class RenderUI extends BaseUI{
    constructor(components: OBC.Components, galleryDb: Gallery) {
        super(components, galleryDb)
    }
    async render() {
        this.bimPanelSection.innerHTML = ""
        const cardContainer = document.createElement("div") as HTMLDivElement
        cardContainer.style.width = "100%"
        cardContainer.style.height = "100%"
        cardContainer.style.display = "grid"
        cardContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(150px, 150px))"
        cardContainer.style.gap = "30px 30px"
        cardContainer.style.padding = "20px 20px 20px 0"
        const allRenders = await this._galleryDb.db.renders.toArray()
        for (const dbItem of allRenders ) {
            const file = new File([new Blob([dbItem.renderBuffer])], dbItem.id!.toString())
            const src = URL.createObjectURL(file)
            const card = document.createElement("div") as HTMLDivElement
            card.innerHTML = `
                <div data-id="${dbItem.uuid}" class="render-card" style="width: 150px; height: fit-content; display: flex;
                flex-direction: column; border-radius: 10px; border: 1px solid rgba(0, 0, 0, 0.5)">
                    <img class="render-image" style="border-radius: 10px 10px 0px 0px" src="${src}">
                    <div style="color: white; width: 100%; height: fit-content; display: flex; flex-direction: column; padding: 10px;">
                        <bim-label icon="">${dbItem.date}</bim-label>
                        <div style="margin-top: 10px; width: 100%; height: fit-content; display: flex; flex-direction: row; justify-content: space-between; column-gap: 6px;">
                            <bim-button class="delete-render" style="width: 50px; min-width: 80px" label="Delete" icon="mdi:garbage-can-outline"></bim-button>
                        </div>
                    </div>
                </div>
            `
            card.style.boxShadow = "0 16px 32px rgba(0, 0, 0, 0)"
            const deleteBtn = card.querySelector(".delete-render") as HTMLButtonElement
            deleteBtn.onclick = this.onCardDelete.bind(this)
            cardContainer.insertAdjacentElement("beforeend", card)
        }
        this.bimPanelSection.insertAdjacentElement("beforeend", cardContainer)
    }
}