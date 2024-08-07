/* eslint-disable max-classes-per-file */
/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable default-case */
/* eslint-disable prettier/prettier */
// import  *  as OBC from "openbim-components"
import * as OBC from "@thatopen/components"
import * as OBF from "@thatopen/components-front"
import * as BUI from "@thatopen/ui"
import Dexie from "dexie"


export class AIRenderer {
    settings = {
      prompt: "cat on the moon", // Indications to the AI engine
      negative_prompt: "Bad quality", // Indications to be avoided by the AI engine
      width: "128", // Maximum 1024
      height: "128", // Maximum 1024
      samples: "1", // Maximum 4
      num_inference_steps: "30",
      safety_checker: false,
      enhance_prompt: true,
      guidance_scale: "10", // cifras en string, min 1, max 20
      strength: 0.7, // Intensity of change, min 0, max 1
      seed: null, // If null, it will be randomly generated
      webhook: null,
      track_id: null,
    };
  
    async render(image: string) {
      // This shouldn't be in your code on production, but on an environment variable
      const key = "5Dc5hLuEiPd9ie3PKG6Tv51hXDLlhU52iTOwPhqL6FJZdj6OC5cCYrngMpEq";
  
      const proxyUrl = "https://cors-anywhere.herokuapp.com/"; // Avoids CORS locally
      const uploadUrl = "https://stablediffusionapi.com/api/v3/base64_crop";
      const processURL = "https://modelslab.com/api/v6/realtime/img2img";
  
      // Let's upload the render to stable diffusion
  
      const url = proxyUrl + uploadUrl;
      const crop = "false";
  
      const rawUploadResponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, image, crop }),
      });
      
      const uploadResponse = await rawUploadResponse.json();
      console.log("tester", uploadResponse)
      if (!uploadResponse.link) {
        throw new Error("There was a problem with the upload!");
      }
  
      // Image uploaded! Now, let's process it:
  
      const uploadedImageURL = uploadResponse.link;
      const params = {
        key,
        init_image: uploadedImageURL,
        ...this.settings,
      };
  
      const rawResponse = await fetch(processURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
    console.log("RAW REPSONSE", rawResponse)
  
    const response = await rawResponse.json();

    if (response.status === "success") {
        return response.output as string[];
    }
    console.log(response)
    const r = await fetch(response.fetch_result, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
    console.log("r::", r)
    const rr = await r.json()
    console.log("r::RR", rr)

    throw new Error("Something went wrong rendering");
    }
  }

export class StableDiffusionRender {
    private _APIKEY = "5Dc5hLuEiPd9ie3PKG6Tv51hXDLlhU52iTOwPhqL6FJZdj6OC5cCYrngMpEq"
    private _proxyURL = "https://cors-anywhere.herokuapp.com/"; // Avoids CORS locally
    private _uploadURL = "https://stablediffusionapi.com/api/v3/base64_crop";
    // private _processURL = "https://stablediffusionapi.com/api/v3/img2img";
    private _processURL = "https://modelslab.com/api/v6/realtime/img2img";
    negPrompt: string
    width: string
    height: string
    private _components: OBC.Components
    AIRender: AIRenderer

    constructor(components: OBC.Components) {
        this._components = components
        this.negPrompt = "Bad quality, Worst quality, Normal quality, Low quality, Low resolution, Blurry, Jpeg artifacts, Grainy."
        this.width = "800"
        this.height = "800"
        this.AIRender = new AIRenderer()
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
                this.handleError(rawUploadResponse.status)
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
    async render(prompt: string, imageURL: string) {
        // const res = await this.AIRender.render(imageURL)
        // return res
        // const image = await this._takeScreenshot() as string
        const uploadedImageURL = await this._uploadRender(this._APIKEY, imageURL)
        console.log("upload images", uploadedImageURL)

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        console.log("prompt used", prompt)
        const raw = JSON.stringify({
            key: this._APIKEY,
            prompt: "image of cat",
            negative_prompt: "bad quality",
            init_image: uploadedImageURL,
            width: "512",
            height: "512",
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
        // const url = this._proxyURL + this._processURL
        const url = this._processURL
        try {
            const response = await fetch(url, requestOptions)
            console.log("response", response)
            if (!response.ok) {
                this.handleError(response.status)
            }
            // const responseURLs: string[] = await response.json()
            // .then((res) => {
            //     console.log("finished", res)
            //     if ( res.status !== "success" ) throw new Error(`Error getting JSON from response: ${res.message}`)
            //     return res.output as string[]
            // })
            // console.log("responseURLs", responseURLs)
            // return responseURLs
            const responseURLs = await response.json()
            if (responseURLs.status === "success") {
                return responseURLs.output as string[];
            }
            console.log(responseURLs)
            throw new Error(`status is set to: ${responseURLs.status}`);
            
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
    //  /**
    //  * takes a screen shot of the viewer scene and returns the image as png
    //  * @returns 
    //  */
    //  private async _takeScreenshot() {
    //     // const postproductionRenderer = this._components.renderer as OBC.PostproductionRenderer
    //     // postproductionRenderer.postproduction.composer.render()
    //     // const renderer = postproductionRenderer.get();
    //     // const image = renderer.domElement.toDataURL("image/png");

    //     const worlds = this._components.get(OBC.Worlds)
    //     await worlds.update()
    //     const world = worlds.list.entries().next().value[1] as OBC.SimpleWorld
    //     console.log("WORLD", world)
    //     const {postproduction} = world.renderer as OBF.PostproductionRenderer
    //     postproduction.composer.render()
    //     const image = world.renderer?.three.domElement.toDataURL("image/png")
    //     console.log("image here", image)
    //     return image
    // }
    handleError(status: number) {
        switch(status) {
            case 400:
                throw new Error(`Bad response uploading render image to SD: ${status}`)
            case 401:
                throw new Error(`Bad response uploading render image to SD: ${status}`)
            case 403:
                throw new Error(`Bad response fetching final image url: ${status}`)
            case 404:
                throw new Error(`Bad response uploading render image to SD: ${status}`)
            case 500:
                throw new Error(`Bad response uploading render image to SD: ${status}`)  
        }
    }
}