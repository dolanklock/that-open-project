import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"
import {Gallery} from "../../DataBase/RenderLibraryDB"
import PromptUI from "../PromptUI"

export default (components: OBC.Components, galleryDb: Gallery) => {
    const containerHTMLElement = document.createElement("ol") as HTMLElement
    // containerHTMLElement.style.paddingRight = "10px"
    containerHTMLElement.style.padding = "0px"
    // would need to iterate through db and get each image url and other data, etc
    // and render to UI
    for (let i = 0; i < 10; i++) {
        const imageHTMLElement = document.createElement("li")
        imageHTMLElement.style.display = "flex"
        imageHTMLElement.style.alignItems = "center"
        imageHTMLElement.textContent = "testing"
        imageHTMLElement.classList.add("image-item")
        containerHTMLElement.appendChild(imageHTMLElement)
    }
    
    return containerHTMLElement
}
