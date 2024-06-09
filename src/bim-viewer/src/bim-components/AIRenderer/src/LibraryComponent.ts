import * as BUI from "@thatopen/ui"
import * as CUI from "@thatopen/ui-obc"
import * as OBC from "@thatopen/components"

export default (components: OBC.Components) => {
    const addGalleryCard = (cardTitle: string, cardPrompt: string) => {
        const galleryCard = `
            <div style="width: 100%; height: fit-content; display: flex; flex-direction: column; border: 1px solid black; border-radius: 10px;">
                <img style="border-radius: 10px 10px 0px 0px" src="https://img.freepik.com/free-vector/tiny-people-developers-computer-working-core-system-core-system-development-all-one-software-solution-core-system-modernization-concept_335657-896.jpg?t=st=1717943201~exp=1717946801~hmac=b3d4fa56af20ddb28f508a58b22a14a035ac7678bda9a873f409aa2b489858e2&w=2000" alt="...">
                <div style="color: white; width: 100%; height: fit-content; display: flex; flex-direction: column; padding: 10px;">
                    <bim-label icon="">${cardTitle}</bim-label>
                    <bim-label icon="">${cardPrompt}</bim-label>
                    <bim-label icon="">${new Date().toDateString()}</bim-label>            
                </div>
            </div>
        `
        
    }

    return BUI.Component.create<BUI.Panel>(() => {
        return BUI.html`
        <bim-panel-section style="background-color: #22272e;" label="Gallery" icon="tabler:world">
            <div style="width: 100%; height: fit-content; display: flex; flex-direction: column; border: 1px solid black; border-radius: 10px;">
                <img style="border-radius: 10px 10px 0px 0px" src="https://img.freepik.com/free-vector/tiny-people-developers-computer-working-core-system-core-system-development-all-one-software-solution-core-system-modernization-concept_335657-896.jpg?t=st=1717943201~exp=1717946801~hmac=b3d4fa56af20ddb28f508a58b22a14a035ac7678bda9a873f409aa2b489858e2&w=2000" alt="...">
                <div style="color: white; width: 100%; height: fit-content; display: flex; flex-direction: column; padding: 10px;">
                <bim-label icon="">Urban Rendering</bim-label>
                <bim-label icon="">modern home in urban environment</bim-label>
                <bim-label icon="">Nov 23, 2024</bim-label>            
                </div>
            </div>
        </bim-panel-section>
        `
    })
}
