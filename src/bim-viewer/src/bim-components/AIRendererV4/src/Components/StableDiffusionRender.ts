/* eslint-disable default-case */
/* eslint-disable prettier/prettier */
// import  *  as OBC from "openbim-components"
import * as OBC from "@thatopen/components"
import * as OBF from "@thatopen/components-front"
import * as BUI from "@thatopen/ui"
import Dexie from "dexie"

export class StableDiffusionRender {
    private _APIKEY = "5Dc5hLuEiPd9ie3PKG6Tv51hXDLlhU52iTOwPhqL6FJZdj6OC5cCYrngMpEq"
    private _proxyURL = "https://cors-anywhere.herokuapp.com/"; // Avoids CORS locally
    private _uploadURL = "https://stablediffusionapi.com/api/v3/base64_crop";
    private _processURL = "https://stablediffusionapi.com/api/v3/img2img";
    negPrompt: string
    width: string
    height: string
    private _components: OBC.Components

    constructor(components: OBC.Components) {
        this._components = components
        this.negPrompt = "Bad quality, Worst quality, Normal quality, Low quality, Low resolution, Blurry, Jpeg artifacts, Grainy."
        this.width = "800"
        this.height = "800"
    }
    /**
     * takes a screen shot of the viewer scene and returns the image as png
     * @returns 
     */
    private async _takeScreenshot() {
        // const postproductionRenderer = this._components.renderer as OBC.PostproductionRenderer
        // postproductionRenderer.postproduction.composer.render()
        // const renderer = postproductionRenderer.get();
        // const image = renderer.domElement.toDataURL("image/png");

        const worlds = this._components.get(OBC.Worlds)
        await worlds.update()
        const world = worlds.list.entries().next().value[1] as OBC.SimpleWorld
        console.log("WORLD", world)
        const {postproduction} = world.renderer as OBF.PostproductionRenderer
        postproduction.composer.render()
        const image = world.renderer?.three.domElement.toDataURL("image/png")
        console.log("image here", image)
        return image
    }
    /**
     * uploads image to SD and gets the image url from it
     * @param APIKey 
     * @param image 
     * @returns 
     */
    private async _uploadRender(key: string, image: string) {
        const url = this._proxyURL + this._uploadURL;
        const crop = "false";
        try {
            const rawUploadResponse = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ key, image, crop }),
            });
            if (!rawUploadResponse.ok) {
                switch(rawUploadResponse.status) {
                    case 400:
                        throw new Error(`Bad response uploading render image to SD: ${rawUploadResponse.status}`)
                    case 401:
                        throw new Error(`Bad response uploading render image to SD: ${rawUploadResponse.status}`)
                    case 403:
                        throw new Error(`Bad response fetching final image url: ${rawUploadResponse.status}`)
                    case 404:
                        throw new Error(`Bad response uploading render image to SD: ${rawUploadResponse.status}`)
                    case 500:
                        throw new Error(`Bad response uploading render image to SD: ${rawUploadResponse.status}`)  
                }
            } else {
                const uploadResponse = await rawUploadResponse.json();
                return uploadResponse.link
            }
        } catch (error) {
            throw new Error(`Error making post request to upload image to SD: ${error}`)
        }
    }
    /**
     * sends post request to SD to render the image that we uploaded with the given prompt
     * @param APIKey 
     * @param prompt 
     * @returns 
     */
    async render(prompt: string, image: string) {
        // const test = await this._takeScreenshot() as string
        console.log("image used here", image)
        const uploadedImageURL = await this._uploadRender(this._APIKEY, image)
        console.log("upload images", uploadedImageURL)

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        console.log("prompt used", prompt)
        const raw = JSON.stringify({
            key: this._APIKEY,
            prompt: prompt,
            negative_prompt: this.negPrompt,
            init_image: uploadedImageURL,
            width: this.width,
            height: this.height,
            samples: "1",
            temp: false,
            safety_checker: false,
            strength:0.7,
            seed: null,
            webhook: null,
            track_id: null,
        });
        const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
        };
        const url = this._proxyURL + this._processURL
        try {
            const response = await fetch(url, requestOptions)
            console.log("response", response)
            if (!response.ok) {
                switch(response.status) {
                    case 400:
                        throw new Error(`Bad response fetching final image url: ${response.status}`)
                    case 401:
                        throw new Error(`Bad response fetching final image url: ${response.status}`)
                    case 403:
                        throw new Error(`Bad response fetching final image url: ${response.status}`)
                    case 404:
                        throw new Error(`Bad response fetching final image url: ${response.status}`)
                    case 405:
                        throw new Error(`Bad response fetching final image url: ${response.status}`)
                    case 500:
                        throw new Error(`Bad response fetching final image url: ${response.status}`)  
                }
            } else {
                const responseURLs: string[] = await response.json()
                .then((res) => {
                    console.log("finished", res)
                    if ( res.status !== "success" ) throw new Error(`Error getting JSON from response: ${res.message}`)
                    return res.output as string[]
                })
                console.log("responseURLs", responseURLs)
                return responseURLs
            }
        } catch (error) {
            throw new Error(`Error making request to get rendered image from SD: ${error}`)
        }
    }
    async init(settingsDb: any) {
        const settings = await settingsDb.db.settings.toArray()
        console.log(settings)
        this.negPrompt = settings[0].negativePrompt
        this.width = settings[0].width
        this.height = settings[0].height
        console.log(this.negPrompt)
        console.log(settings[0])
    }
}