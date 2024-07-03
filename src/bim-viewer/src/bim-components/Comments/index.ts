import * as OBC from "@thatopen/components"
import { Comment } from "./src/Comment"
import * as OBF from "@thatopen/components-front"

export class Comments extends OBC.Component implements OBC.Disposable {
  static uuid: string = "377a197f-c631-4545-b4a0-22057d73d41b" as const
  private _enabled: boolean = false
  readonly list: Comment[] = []
  readonly onCommentAdded = new OBC.Event<Comment>()
  private _world: OBC.World | null = null
  private _previewElement: OBF.Mark | null = null
  private _hitPoint: THREE.Vector3 | null = null
  readonly onDisposed = new OBC.Event()

  constructor(components: OBC.Components) {
    super(components)
    components.add(Comments.uuid, this)
  }
  /**
   * to ensure the visual indicator is hidden when the component is disabled,
   *  we can replace the enabled property with accessors like this:
   */
  set enabled(value: boolean) {
    this._enabled = value
    if (!value && this._previewElement) {
      this._previewElement.visible = false
    }
  }
  get enabled() {
    return this._enabled
  }
  addComment(text: string, position?: THREE.Vector3) {
    const comment = new Comment(text)
    if (position) comment.position = position
    this.list.push(comment)
    this.onCommentAdded.trigger(comment)
    return comment
  }
  // addReply() {
  //   const reply = prompt("Relpy:")
  //   if (!reply) return

  // }
  set world(world: OBC.World | null) {
    this._world = world
    if (world) {
      this.createPreviewElement(world)
      this.setEvents(true, world)
    }
  }
  get world() {
    return this._world
  }
  /**
   * this creates the html element for the marker and creates a new instance of Mark class
   * which is essentially a threejs CSS2DObject and then we set its visiblity to false and assign
   * the previewElement attribute of this class to the newly created Mark instance
   * @param world 
   */
  private createPreviewElement = (world: OBC.World) => {
    const icon = document.createElement("bim-label")
    icon.textContent = "Add Comment"
    icon.icon = "material-symbols:comment"
    icon.style.backgroundColor = "var(--bim-ui_bg-base)"
    icon.style.padding = "0.5rem"
    icon.style.borderRadius = "0.5rem"
    const preview = new OBF.Mark(world, icon) // this is a three CSS2DObject essentially
    preview.visible = false
    this._previewElement = preview
  }
  /**
   * getting the worlds root html element that is the container for all other domElements and adding 
   * event listeners on that html element, such as checkHitpoint "mousemove", addCommentOnPreviewPoint "click",
   * and then adding remove event listeners if tool is not enabled
   * @param world 
   * @param enabled 
   */
  private setEvents(enabled: boolean, world?: OBC.World) {
    if (enabled && !world) throw new Error("Pass in world to argument")
    if (enabled && world) {
      if (!(world.renderer && world.renderer.three.domElement.parentElement)) {
        throw new Error("Comments: your world needs a renderer!")
      }
      const worldContainer = world.renderer.three.domElement.parentElement
      if (enabled) {
        worldContainer.addEventListener("mousemove", this.checkHitPoint)
        worldContainer.addEventListener("click", this.addCommentOnPreviewPoint)
      } else {
        worldContainer.removeEventListener("mousemove", this.checkHitPoint)
        worldContainer.removeEventListener("click", this.addCommentOnPreviewPoint)
      }
    }
  }
  /**
   * It looks cumbersome, but we’re just using the built-in raycasters component in That Open Engine to cast a ray from the mouse location
   *  into the model to check if something is hit. In case something is hit, then we’re showing the preview element created earlier,
   *  setting its position to the casting point, and saving the casting point (result.point) inside the private _hitPoint property
   *  in the component.
   * the code in here is the reason why the add comment html is constantly following cursor
   * @returns 
   */
  checkHitPoint = () => {
    if (!(this.enabled && this.world && this._previewElement)) { return }
    const raycasters = this.components.get(OBC.Raycasters)
    const raycaster = raycasters.get(this.world)
    const result = raycaster.castRay()
    console.log(result)
    if (result) {
      this._previewElement.visible = true
      this._previewElement.three.position.copy(result.point)
      this._hitPoint = result.point
    } else {
      this._previewElement.visible = false
      this._hitPoint = null
    }
  }
  /**
   * prompts user for text input for comment and then calls addComment method and pass in text and hitPoint (vector)
   * @returns 
   */
  private addCommentOnPreviewPoint = () => {
    if (!(this.enabled && this._hitPoint)) return;
    const text = prompt("Comment")
    if (!(text && text.trim() !== "")) return;
    this.addComment(text, this._hitPoint)
  }
  dispose() {
    this.enabled = false;
    this.world = null
    this.list.length = 0
    this.onCommentAdded.reset()
    this.setEvents(false)
    this.onDisposed.trigger();
    this.onDisposed.reset();
  }
}






