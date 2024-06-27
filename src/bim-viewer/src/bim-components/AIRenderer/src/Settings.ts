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
    const onNegPromptChange = (e: Event) => {
        const target = e.target as BUI.TextInput
        const negPrompt = target.value
        localStorage.setItem("negPrompt", negPrompt)
    }
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
    return BUI.Component.create<BUI.PanelSection>(() => {
        return BUI.html `
            <bim-panel-section label="Settings" icon="tabler:world">
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div style="display: flex; flex-direction: column; gap: .5rem;">
                        <bim-label style="display: flex" icon="mingcute:rocket-fill">Negative prompt</bim-label>
                        <bim-text-input value="${settings.negPrompt}" @input=${onNegPromptChange} vertical placeholder="Search..." debounce="200"></bim-text-input>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: .5rem;">
                        <bim-label style="display: flex" icon="mingcute:rocket-fill">Width</bim-label>
                        <bim-text-input value="${settings.width}" @input=${onWidthChange} vertical placeholder="Search..." debounce="200"></bim-text-input>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: .5rem;">
                        <bim-label style="display: flex" icon="mingcute:rocket-fill">Height</bim-label>
                        <bim-text-input value="${settings.height}" @input=${onHeightChange} vertical placeholder="Search..." debounce="200"></bim-text-input>
                    </div>
                </div>
            </bim-panel-section>
        `
    })
}
