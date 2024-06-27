/* eslint-disable no-useless-return */
/* eslint-disable prettier/prettier */
import * as OBC from "@thatopen/components";

export interface IDiscordIntegrationConfig {
  webhookURL: string | null;
}

export class DiscordIntegration extends OBC.Component implements OBC.Configurable<IDiscordIntegrationConfig> {
  static readonly uuid = "166be1b9-22a1-4147-adc1-5d614c3b45e8";
  readonly onSetup = new OBC.Event<DiscordIntegration>();
  enabled = true;
  isSetup: boolean = false
  config: Required<IDiscordIntegrationConfig> = {
    webhookURL: null
  }
  private _xtr: XMLHttpRequest = new XMLHttpRequest()

  constructor(components: OBC.Components) {
    super(components);
    components.add(DiscordIntegration.uuid, this);
  }

  setup(config?: Partial<IDiscordIntegrationConfig>) {
    if ( this.isSetup ) return
    const openConnection = (url: string) => {
      this._xtr.open("POST", url)
    }
    this.config = {...this.config, ...config}
    const _config = {...this.config}
    Object.defineProperty(this.config, "webhookURL", {
      get() {
        return this._webhookURL
      },
      set(url: string | null) {
        this._webhookURL = url
        if (url) openConnection(url)
      }
    })
    this.config.webhookURL = _config.webhookURL
    this.enabled = true
    this.isSetup = true
    this.onSetup.trigger(this) // what is this doing? no callbacks were added to event object...

  }
  sendMessage(world: OBC.World, message: string) {
    if (!this.isSetup) {
      throw new Error("DiscordIntegration was not setup yet. Call the setup method")
    }
    if (!(this.enabled && this.config.webhookURL)) return
    const { renderer, scene, camera } = world
    if ( !renderer ) {
      throw new Error("DiscordIntegration: world needs renderer!")
    }
    const canvasHTMLElem = renderer.three.domElement
    renderer.three.render(scene.three, camera.three) // takes the screenshot of the canvas
    // blob represents an object of binary data which is needed to interact with API that requries binary data
    canvasHTMLElem.toBlob((blob) => {
      if (!blob) return
      // getting canvas as binary data in order to send in request body
      const file = new File([blob], "screenshot.png")
      const data = new FormData()
      data.set("content", message)
      data.set("screenshot", file)
      // XMLHttpRequest can take a FormData type for the body (arg)
      this._xtr.send(data)
    })
  }

}
