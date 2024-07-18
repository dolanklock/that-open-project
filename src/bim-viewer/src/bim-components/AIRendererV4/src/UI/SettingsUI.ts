/* eslint-disable prettier/prettier */
import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"

interface ISettings {
    negPrompt: string,
    width: string,
    height: string,
}

export default (components: OBC.Components) => {
    const settings: ISettings = {
        negPrompt: localStorage.getItem('negPrompt') as string,
        width: localStorage.getItem('width') as string,
        height: localStorage.getItem('height') as string,
    }
    // <bim-text-input value="${settings.negPrompt}" @input=${onNegPromptChange} vertical placeholder="Search..." debounce="200"></bim-text-input>
    // const onNegPromptChange = (e: Event) => {
    //     const target = e.target as BUI.TextInput
    //     const negPrompt = target.value
    //     textArea.textContent = target.value
    //     localStorage.setItem("negPrompt", negPrompt)

    // }
    const onWidthChange = (e: Event) => {
        const target = e.target as BUI.TextInput
        const width = target.value
        localStorage.setItem("width", width)
    }
    const onHeightChange = (e: Event) => {
        const target = e.target as BUI.TextInput
        const height = target.value
        localStorage.setItem("height", height)
    }

    const textArea = document.createElement("textarea") as HTMLTextAreaElement
    textArea.style.backgroundColor = "#2E3338"
    textArea.style.color = "white"
    textArea.defaultValue = localStorage.getItem("negPrompt") as string
    textArea.onchange = function() {
        console.log("changed")
        localStorage.setItem("negPrompt", textArea.value)
    }
    const modal = BUI.Component.create<HTMLDialogElement>(() => {
        return BUI.html `
            <dialog>
                <bim-panel> 
                    <div style="display: flex; flex-direction: column; gap: 1.5rem; padding: 20px;">
                        <div style="display: flex; flex-direction: column; gap: .5rem;">
                            <bim-label style="display: flex" icon="mingcute:rocket-fill">Negative prompt</bim-label>
                            ${textArea}
                        </div>
                        <div style="display: flex; flex-direction: column; gap: .5rem;">
                            <bim-label style="display: flex" icon="mingcute:rocket-fill">Width</bim-label>
                            <bim-text-input value="${settings.width}" @input=${onWidthChange} vertical placeholder="Search..." debounce="200"></bim-text-input>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: .5rem;">
                            <bim-label style="display: flex" icon="mingcute:rocket-fill">Height</bim-label>
                            <bim-text-input value="${settings.height}" @input=${onHeightChange} vertical placeholder="Search..." debounce="200"></bim-text-input>
                        </div>
                        <div style="display: flex; flex-direction: row; gap: .5rem;">
                            <bim-button @click=${() => modal.close()} label="Accept" icon=""></bim-button>
                        </div>
                    </div>
                    
                </bim-panel>
            </dialog>
        `
    })

    document.body.append(modal)

    return BUI.Component.create<BUI.PanelSection>(() => {
        return BUI.html `
            <bim-button @click=${() => modal.showModal()} label="Settings" icon="tabler:eye-filled" tooltip-title="Show All" tooltip-text="Shows all elements in all models."></bim-button>
        `
    })
}

    // return BUI.Component.create<BUI.PanelSection>(() => {
    //     return BUI.html `
            // <bim-panel-section label="Settings" icon="tabler:world">
            //     <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            //         <div style="display: flex; flex-direction: column; gap: .5rem;">
            //             <bim-label style="display: flex" icon="mingcute:rocket-fill">Negative prompt</bim-label>
            //             <bim-text-input value="${settings.negPrompt}" @input=${onNegPromptChange} vertical placeholder="Search..." debounce="200"></bim-text-input>
            //         </div>
            //         <div style="display: flex; flex-direction: column; gap: .5rem;">
            //             <bim-label style="display: flex" icon="mingcute:rocket-fill">Width</bim-label>
            //             <bim-text-input value="${settings.width}" @input=${onWidthChange} vertical placeholder="Search..." debounce="200"></bim-text-input>
            //         </div>
            //         <div style="display: flex; flex-direction: column; gap: .5rem;">
            //             <bim-label style="display: flex" icon="mingcute:rocket-fill">Height</bim-label>
            //             <bim-text-input value="${settings.height}" @input=${onHeightChange} vertical placeholder="Search..." debounce="200"></bim-text-input>
            //         </div>
            //     </div>
            // </bim-panel-section>
    //     `
    // })