import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import {Gallery} from "../../DataBase/RenderLibraryDB"
import PromptUI from "../PromptUI"

export class BaseUI {
    bimPanelSection: BUI.PanelSection
    protected _galleryDb: Gallery
    constructor(components: OBC.Components, galleryDb: Gallery) {
        this.bimPanelSection = document.createElement('bim-panel-section') as BUI.PanelSection
        this.bimPanelSection.setAttribute('label', 'Gallery')
        this.bimPanelSection.setAttribute('icon', 'tabler:world')
        this._galleryDb = galleryDb
    }
    
    async onCardDelete(e: Event) {
        const btnClicked = e.target as HTMLButtonElement
        const card = btnClicked.closest(".render-card") as HTMLDivElement
        const cardId = card.dataset.id as string
        await this._galleryDb.deleteItem(cardId)
        card.remove()
    }
}